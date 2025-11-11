from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.core.files.storage import default_storage
from django.conf import settings
import os, uuid

from .models import Category, Product, Sale, SaleItem, UserProfile, StoreSettings, Notification
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer
from .permissions import require_permission, get_user_permissions


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    @require_permission('view_products')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @require_permission('manage_products')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    @require_permission('view_products')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @require_permission('manage_products')
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    @require_permission('manage_products')
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    @require_permission('manage_products')
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    
    @require_permission('view_sales')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @require_permission('pos_access')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


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


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Authenticate with username (Django's default)
        user = authenticate(username=user.username, password=password)
        
        if user:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            # Get or create user profile
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=user, role='cashier')
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': profile.role,
                    'role_display': profile.role_display,
                    'permissions': profile.permissions,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'message': 'Error logging out'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }, status=status.HTTP_200_OK)


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('view_analytics')
    def get(self, request):
        # Get date range (last 7 days by default)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=6)
        
        # Daily sales data for the last 7 days
        daily_sales = []
        for i in range(7):
            date = start_date + timedelta(days=i)
            day_sales = Sale.objects.filter(created_at__date=date)
            revenue = day_sales.aggregate(total=Sum('total_amount'))['total'] or 0
            orders = day_sales.count()
            
            daily_sales.append({
                'day': date.strftime('%a'),  # Mon, Tue, etc.
                'date': date.isoformat(),
                'revenue': float(revenue),
                'orders': orders
            })
        
        # Payment method distribution
        payment_methods = Sale.objects.values('payment_method').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('-total')
        
        payment_data = [
            {
                'name': method['payment_method'] or 'Cash',
                'value': float(method['total'] or 0),
                'count': method['count']
            }
            for method in payment_methods
        ]
        
        # Top selling products (based on sale items)
        top_products = SaleItem.objects.values(
            'product__name', 'product__price'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('subtotal')
        ).order_by('-total_quantity')[:5]
        
        top_products_data = [
            {
                'name': product['product__name'][:20] + ('...' if len(product['product__name']) > 20 else ''),
                'sales': product['total_quantity'],
                'revenue': float(product['total_revenue'] or 0)
            }
            for product in top_products
        ]
        
        # Overall statistics
        total_sales = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = Sale.objects.count()
        today_sales = Sale.objects.filter(created_at__date=end_date)
        today_revenue = today_sales.aggregate(total=Sum('total_amount'))['total'] or 0
        today_orders = today_sales.count()
        
        # Low stock products
        low_stock_products = Product.objects.filter(
            stock__lte=F('reorder_level')
        ).values('id', 'name', 'stock', 'reorder_level')[:10]
        
        return Response({
            'daily_sales': daily_sales,
            'payment_methods': payment_data,
            'top_products': top_products_data,
            'statistics': {
                'total_revenue': float(total_sales),
                'total_orders': total_orders,
                'today_revenue': float(today_revenue),
                'today_orders': today_orders,
                'avg_order_value': float(total_sales / total_orders) if total_orders > 0 else 0
            },
            'low_stock_products': list(low_stock_products)
        })


class UsersListView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('manage_users')
    def get(self, request):
        
        users = User.objects.all().order_by('-date_joined')
        users_data = []
        
        for user in users:
            # Get user's sales count and total
            try:
                user_sales = Sale.objects.filter(created_by=user)
                sales_count = user_sales.count()
                sales_total = user_sales.aggregate(total=Sum('total_amount'))['total'] or 0
            except Exception as e:
                print(f"Error getting sales for user {user.username}: {e}")
                sales_count = 0
                sales_total = 0
            
            # Get user profile and role
            try:
                profile = user.profile
                role = profile.role
                role_display = profile.role_display
                permissions = profile.permissions
            except UserProfile.DoesNotExist:
                # Create default profile for users without one
                profile = UserProfile.objects.create(user=user, role='staff')
                role = profile.role
                role_display = profile.role_display
                permissions = profile.permissions
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'sales_count': sales_count,
                'sales_total': float(sales_total),
                'role': role,
                'role_display': role_display,
                'permissions': permissions
            })
        
        return Response(users_data)


class UserPermissionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user's permissions"""
        permissions = get_user_permissions(request.user)
        
        try:
            profile = request.user.profile
            role = profile.role
            role_display = profile.role_display
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user, role='staff')
            role = profile.role
            role_display = profile.role_display
        
        return Response({
            'user_id': request.user.id,
            'username': request.user.username,
            'role': role,
            'role_display': role_display,
            'permissions': permissions,
            'is_superuser': request.user.is_superuser
        })


class UpdateUserRoleView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('manage_users')
    def post(self, request):
        """Update user role"""
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        
        if not user_id or not new_role:
            return Response({
                'error': 'user_id and role are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate role
        valid_roles = [choice[0] for choice in UserProfile.ROLE_CHOICES]
        if new_role not in valid_roles:
            return Response({
                'error': f'Invalid role. Valid roles: {valid_roles}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = new_role
            profile.save()
            
            return Response({
                'message': f'User {user.username} role updated to {profile.role_display}',
                'user_id': user.id,
                'username': user.username,
                'role': profile.role,
                'role_display': profile.role_display,
                'permissions': profile.permissions
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ToggleUserStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('manage_users')
    def post(self, request):
        """Activate or deactivate a user"""
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            
            return Response({
                'message': f'User {user.username} {"activated" if user.is_active else "deactivated"}',
                'user_id': user.id,
                'username': user.username,
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ResetUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('manage_users')
    def post(self, request):
        """Reset user password to a default value"""
        user_id = request.data.get('user_id')
        new_password = request.data.get('new_password', 'password123')  # Default password
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': f'Password reset for user {user.username}',
                'user_id': user.id,
                'username': user.username,
                'new_password': new_password
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UpdateUserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    @require_permission('manage_users')
    def post(self, request):
        """Update user profile information"""
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            
            # Update user fields
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            if 'email' in request.data:
                user.email = request.data['email']
            
            user.save()
            
            return Response({
                'message': f'User {user.username} profile updated',
                'user_id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class StoreSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get store settings"""
        settings = StoreSettings.get_settings()
        return Response({
            'store_name': settings.store_name,
            'store_address': settings.store_address,
            'store_phone': settings.store_phone,
            'store_email': settings.store_email,
            'currency': settings.currency,
            'tax_rate': float(settings.tax_rate),
            'receipt_footer': settings.receipt_footer,
            'auto_open_cash_drawer': settings.auto_open_cash_drawer,
            'print_receipts': settings.print_receipts,
            'ask_for_customer_info': settings.ask_for_customer_info,
            'low_stock_alerts': settings.low_stock_alerts,
            'daily_sales_report': settings.daily_sales_report,
            'email_notifications': settings.email_notifications,
            'sms_notifications': settings.sms_notifications,
        })
    
    @require_permission('manage_settings')
    def post(self, request):
        """Update store settings"""
        settings = StoreSettings.get_settings()
        
        # Update fields if provided
        if 'store_name' in request.data:
            settings.store_name = request.data['store_name']
        if 'store_address' in request.data:
            settings.store_address = request.data['store_address']
        if 'store_phone' in request.data:
            settings.store_phone = request.data['store_phone']
        if 'store_email' in request.data:
            settings.store_email = request.data['store_email']
        if 'currency' in request.data:
            settings.currency = request.data['currency']
        if 'tax_rate' in request.data:
            settings.tax_rate = request.data['tax_rate']
        if 'receipt_footer' in request.data:
            settings.receipt_footer = request.data['receipt_footer']
        if 'auto_open_cash_drawer' in request.data:
            settings.auto_open_cash_drawer = request.data['auto_open_cash_drawer']
        if 'print_receipts' in request.data:
            settings.print_receipts = request.data['print_receipts']
        if 'ask_for_customer_info' in request.data:
            settings.ask_for_customer_info = request.data['ask_for_customer_info']
        if 'low_stock_alerts' in request.data:
            settings.low_stock_alerts = request.data['low_stock_alerts']
        if 'daily_sales_report' in request.data:
            settings.daily_sales_report = request.data['daily_sales_report']
        if 'email_notifications' in request.data:
            settings.email_notifications = request.data['email_notifications']
        if 'sms_notifications' in request.data:
            settings.sms_notifications = request.data['sms_notifications']
        
        settings.updated_by = request.user
        settings.save()
        
        return Response({
            'message': 'Settings updated successfully',
            'settings': {
                'store_name': settings.store_name,
                'store_address': settings.store_address,
                'store_phone': settings.store_phone,
                'store_email': settings.store_email,
                'currency': settings.currency,
                'tax_rate': float(settings.tax_rate),
            }
        })


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user notifications"""
        # Get unread notifications for the user or all if superuser
        if request.user.is_superuser:
            notifications = Notification.objects.all()[:20]
        else:
            notifications = Notification.objects.filter(
                Q(user=request.user) | Q(user__isnull=True)
            )[:20]
        
        return Response([{
            'id': notif.id,
            'type': notif.type,
            'title': notif.title,
            'message': notif.message,
            'is_read': notif.is_read,
            'created_at': notif.created_at.isoformat(),
            'product_id': notif.related_product_id,
            'product_name': notif.related_product.name if notif.related_product else None,
        } for notif in notifications])
    
    def post(self, request):
        """Mark notification as read"""
        notification_id = request.data.get('notification_id')
        
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


class CheckLowStockView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Check for low stock products and create notifications"""
        settings = StoreSettings.get_settings()
        
        if not settings.low_stock_alerts:
            return Response({'message': 'Low stock alerts are disabled'})
        
        # Find products with low stock
        low_stock_products = Product.objects.filter(stock__lte=F('reorder_level'))
        
        # Create notifications for low stock products
        notifications_created = 0
        for product in low_stock_products:
            # Check if notification already exists for this product
            existing = Notification.objects.filter(
                type='low_stock',
                related_product=product,
                is_read=False
            ).exists()
            
            if not existing:
                Notification.objects.create(
                    type='low_stock',
                    title=f'Low Stock Alert: {product.name}',
                    message=f'{product.name} is running low. Current stock: {product.stock}, Reorder level: {product.reorder_level}',
                    related_product=product
                )
                notifications_created += 1
        
        return Response({
            'message': f'Created {notifications_created} new low stock notifications',
            'low_stock_count': low_stock_products.count()
        })
