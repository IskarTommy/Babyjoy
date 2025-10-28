from django.shortcuts import render
from rest_framework import generics
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer