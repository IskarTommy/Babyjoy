from django.urls import path
from .views import (
    CategoryListCreateView, ProductListCreateView, SaleListCreateView, 
    ProductImageUploadView, ProductRetrieveUpdateDestroyView, LoginView, LogoutView, 
    UserProfileView, AnalyticsView, UsersListView, UserPermissionsView, UpdateUserRoleView,
    ToggleUserStatusView, ResetUserPasswordView, UpdateUserProfileView,
    StoreSettingsView, NotificationsView, CheckLowStockView
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
    path('users/toggle-status/', ToggleUserStatusView.as_view(), name='toggle-user-status'),
    path('users/reset-password/', ResetUserPasswordView.as_view(), name='reset-user-password'),
    path('users/update-profile/', UpdateUserProfileView.as_view(), name='update-user-profile'),
    
    # Settings and Notifications
    path('settings/', StoreSettingsView.as_view(), name='settings'),
    path('notifications/', NotificationsView.as_view(), name='notifications'),
    path('notifications/check-low-stock/', CheckLowStockView.as_view(), name='check-low-stock'),
    
    # Existing endpoints
    path('categories/', CategoryListCreateView.as_view(), name='categories'),
    path('products/', ProductListCreateView.as_view(), name='products'),
    path('products/<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),
    path('products/upload-image/', ProductImageUploadView.as_view(), name='product-upload-image'),
    path('sales/', SaleListCreateView.as_view(), name='sales'),
]