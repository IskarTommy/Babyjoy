from django.urls import path
from .views import (
    CategoryListCreateView, ProductListCreateView, SaleListCreateView, 
    ProductImageUploadView, ProductRetrieveDestroyView, LoginView, LogoutView, 
    UserProfileView, AnalyticsView, UsersListView, UserPermissionsView, UpdateUserRoleView
)

urlpatterns = [
    # Authentication
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # Analytics and Users
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('users/', UsersListView.as_view(), name='users'),
    path('users/permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    path('users/update-role/', UpdateUserRoleView.as_view(), name='update-user-role'),
    
    # Existing endpoints
    path('categories/', CategoryListCreateView.as_view(), name='categories'),
    path('products/', ProductListCreateView.as_view(), name='products'),
    path('products/<int:pk>/', ProductRetrieveDestroyView.as_view(), name='product-detail'),
    path('products/upload-image/', ProductImageUploadView.as_view(), name='product-upload-image'),
    path('sales/', SaleListCreateView.as_view(), name='sales'),
]