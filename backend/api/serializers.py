from rest_framework import serializers
from .models import Category, Product, Sale, SaleItem, User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

    def validate(self, data):
        # Ensure business rule: price should be greater than or equal to cost (if cost provided)
        price = data.get('price')
        cost = data.get('cost')
        # If cost is provided and both are numbers, enforce price >= cost
        if cost is not None and price is not None:
            try:
                if price < cost:
                    raise serializers.ValidationError({'non_field_errors': ['price must be greater than or equal to cost']})
            except TypeError:
                # Let DRF field validators handle type issues
                pass
        return data


class SaleItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'quantity', 'unit_price', 'subtotal']


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = ['id','receipt_number','total_amount','payment_method','customer_name','customer_phone','created_by','created_at','items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            # Remove subtotal from item_data if it exists to avoid duplicate
            item_data.pop('subtotal', None)
            # Calculate subtotal
            subtotal = item_data['unit_price'] * item_data['quantity']
            si = SaleItem.objects.create(sale=sale, subtotal=subtotal, **item_data)
            # Decrement Stock Safely
            if si.product:
                si.product.stock = max(si.product.stock - si.quantity, 0)
                si.product.save()
        return sale
