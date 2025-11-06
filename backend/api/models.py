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