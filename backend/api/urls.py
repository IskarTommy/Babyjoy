from django.urls import path
from .views import CategoryListCreateView, ProductListCreateView, SaleListCreateView, ProductImageUploadView, ProductRetrieveDestroyView

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='categories'),
    path('products/', ProductListCreateView.as_view(), name='products'),
    path('products/<int:pk>/', ProductRetrieveDestroyView.as_view(), name='product-detail'),
    path('products/upload-image/', ProductImageUploadView.as_view(), name='product-upload-image'),
    path('sales/', SaleListCreateView.as_view(), name='sales'),
]