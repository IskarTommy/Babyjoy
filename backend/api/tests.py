from django.test import TestCase
from .models import Product
from .serializers import ProductSerializer


class ProductModelTests(TestCase):
	def test_sku_normalization(self):
		p = Product.objects.create(name='Test', sku=' abc-123 ', price='10.00')
		self.assertEqual(p.sku, 'ABC-123')


class ProductSerializerTests(TestCase):
	def test_price_must_be_greater_or_equal_cost(self):
		data = {
			'name': 'Test',
			'sku': 'SKU1',
			'price': '500.00',
			'cost': '1200.00'
		}
		serializer = ProductSerializer(data=data)
		self.assertFalse(serializer.is_valid())
		self.assertIn('non_field_errors', serializer.errors)
