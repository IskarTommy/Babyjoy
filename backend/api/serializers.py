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
        for item in items_data:
            subtotal = item['unit_price'] * item['quantity']
            si = SaleItem.objects.create(sale=sale, subtotal=subtotal, **item)
            # Decrement Stock Safely

            if si.product:
                si.product.stock = max(si.product.stock - si.quantity, 0)
                si.product.save()
        return sale
