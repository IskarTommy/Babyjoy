from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import status
from functools import wraps
from .models import UserProfile


class RoleBasedPermission(BasePermission):
    """
    Custom permission class for role-based access control
    """
    required_permission = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super users always have access
        if request.user.is_superuser:
            return True
        
        # Get user profile
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            # Create default profile for users without one
            profile = UserProfile.objects.create(user=request.user, role='staff')
        
        # Check if user has required permission
        if hasattr(view, 'required_permission'):
            return profile.has_permission(view.required_permission)
        
        return True


def require_permission(permission):
    """
    Decorator to require specific permission for view methods
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Super users always have access
            if request.user.is_superuser:
                return view_func(self, request, *args, **kwargs)
            
            # Get user profile
            try:
                profile = request.user.profile
            except UserProfile.DoesNotExist:
                # Create default profile for users without one
                profile = UserProfile.objects.create(user=request.user, role='staff')
            
            # Check permission
            if not profile.has_permission(permission):
                return Response({
                    'error': f'Permission denied. Required: {permission}',
                    'user_role': profile.role,
                    'user_permissions': profile.permissions
                }, status=status.HTTP_403_FORBIDDEN)
            
            return view_func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def get_user_permissions(user):
    """
    Helper function to get user permissions
    """
    if user.is_superuser:
        return [
            'view_dashboard', 'manage_products', 'manage_sales', 'view_analytics', 
            'manage_users', 'manage_settings', 'pos_access', 'view_reports'
        ]
    
    try:
        profile = user.profile
        return profile.permissions
    except UserProfile.DoesNotExist:
        # Create default profile
        profile = UserProfile.objects.create(user=user, role='staff')
        return profile.permissions