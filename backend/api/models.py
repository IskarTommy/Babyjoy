from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.validators import RegexValidator


class User(models.Model):
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=50, default='staff')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw):
        self.password_hash = make_password(raw)
    
    def __str__(self):
        return self.email
    
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
    sku = models.CharField(max_length=100, unique=True, validators=[sku_validator])
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

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

