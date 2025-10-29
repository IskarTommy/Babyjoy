from django.shortcuts import render
from rest_framework import generics
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings
import os, uuid


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer


class ProductRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer


class ProductImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file = request.FILES.get('image')
        if not file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        ext = os.path.splitext(file.name)[1]
        filename = f"product_{uuid.uuid4().hex}{ext}"
        subpath = os.path.join('product_images', filename)
        saved_path = default_storage.save(subpath, file)
        url = settings.MEDIA_URL + saved_path.replace('\\', '/')
        return Response({'url': url}, status=status.HTTP_201_CREATED)