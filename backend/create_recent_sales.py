#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Product, Sale, SaleItem
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import datetime, timedelta
import random

def create_recent_sales():
    print("Creating recent sales data...")
    
    # Get admin user
    try:
        admin = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("Admin user not found!")
        return
    
    # Get products
    products = list(Product.objects.all())
    
    if not products:
        print("No products found!")
        return
    
    # Create sales for the last 7 days
    for i in range(20):
        # Random date in last 7 days
        days_ago = random.randint(0, 6)
        sale_date = datetime.now() - timedelta(days=days_ago)
        
        # Create sale
        receipt_number = f'RCP-{sale_date.strftime("%Y%m%d")}-{i+1:03d}'
        payment_method = random.choice(['CASH', 'MOMO', 'CARD'])
        
        sale = Sale.objects.create(
            receipt_number=receipt_number,
            total_amount=Decimal('0.00'),
            payment_method=payment_method,
            created_by=admin
        )
        # Update the created_at manually
        sale.created_at = sale_date
        sale.save()
        
        # Add random items
        total = Decimal('0.00')
        num_items = random.randint(1, 3)
        selected_products = random.sample(products, min(num_items, len(products)))
        
        for product in selected_products:
            quantity = random.randint(1, 2)
            unit_price = product.price
            subtotal = unit_price * quantity
            
            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )
            
            total += subtotal
        
        # Calculate tax and update sale (15% tax included in total)
        tax_amount = total * Decimal('0.15')
        total_with_tax = total + tax_amount
        
        sale.total_amount = total_with_tax
        sale.save()
        
        print(f'Created sale: {receipt_number} - ₵{total_with_tax}')
    
    print("Recent sales data created successfully!")

if __name__ == '__main__':
    create_recent_sales()