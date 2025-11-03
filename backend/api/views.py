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

from .models import Category, Product, Sale, SaleItem
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer


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
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
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
    
    def get(self, request):
        # Only allow staff/superusers to view user list
        if not request.user.is_staff:
            return Response({
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('-date_joined')
        users_data = []
        
        for user in users:
            # Get user's sales count and total
            user_sales = Sale.objects.filter(created_by=user)
            sales_count = user_sales.count()
            sales_total = user_sales.aggregate(total=Sum('total_amount'))['total'] or 0
            
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
                'sales_total': float(sales_total)
            })
        
        return Response(users_data)