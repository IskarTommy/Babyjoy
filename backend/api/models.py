from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from decimal import Decimal


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('super_admin', 'Super Administrator'),
        ('cashier', 'Cashier'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='cashier')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def permissions(self):
        """Return permissions based on role"""
        role_permissions = {
            'super_admin': [
                'view_dashboard', 'manage_products', 'manage_sales', 'view_analytics', 
                'manage_users', 'manage_settings', 'pos_access', 'view_reports', 'view_products'
            ],
            'cashier': [
                'view_dashboard', 'view_products', 'pos_access', 'view_sales'
            ]
        }
        return role_permissions.get(self.role, [])
    
    def has_permission(self, permission):
        """Check if user has specific permission"""
        return permission in self.permissions
    
    @property
    def role_display(self):
        """Get human-readable role name"""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def __str__(self):
        return f"{self.user.username} - {self.role_display}"
    
class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    # SKU: normalized to uppercase, validated to a safe charset (A-Z,0-9,_,-)
    sku_validator = RegexValidator(r'^[A-Z0-9_-]+$', 'Uppercase letters, numbers, -, _ only')
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True, validators=[sku_validator])
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=3)
    image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Normalize SKU: strip and uppercase (keeps DB-stored SKUs consistent)
        if self.sku:
            self.sku = self.sku.strip().upper()
        super().save(*args, **kwargs)
    

class Sale(models.Model):
    receipt_number = models.CharField(max_length=100, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_phone = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Normalize payment method
        if self.payment_method:
            # Convert to title case for consistency
            self.payment_method = self.payment_method.strip().title()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.receipt_number
    

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, null=True, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        sale_num = getattr(self.sale, "receipt_number", None) or f"Sale {self.sale_id or 'Unknown'}"
        product_label = getattr(self.product, "name", None) or f"Product {self.product_id or 'Unknown'}"
        return f"{sale_num} - {product_label}"


class StoreSettings(models.Model):
    # Store Information
    store_name = models.CharField(max_length=255, default='Hafshat Kidz')
    store_address = models.TextField(default='123 Liberation Road, Accra, Ghana')
    store_phone = models.CharField(max_length=50, default='+233 24 123 4567')
    store_email = models.EmailField(default='info@hafshatkidz.com')
    currency = models.CharField(max_length=10, default='GHS')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=12.5)
    
    # POS Settings
    receipt_footer = models.TextField(default='Thank you for shopping with us!')
    auto_open_cash_drawer = models.BooleanField(default=True)
    print_receipts = models.BooleanField(default=True)
    ask_for_customer_info = models.BooleanField(default=False)
    
    # Notification Settings
    low_stock_alerts = models.BooleanField(default=True)
    daily_sales_report = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='settings_updates')
    
    class Meta:
        verbose_name = 'Store Settings'
        verbose_name_plural = 'Store Settings'
    
    def __str__(self):
        return f"Settings for {self.store_name}"
    
    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        settings, created = cls.objects.get_or_create(id=1)
        return settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('low_stock', 'Low Stock Alert'),
        ('sale', 'Sale Notification'),
        ('system', 'System Notification'),
    ]
    
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()}: {self.title}"