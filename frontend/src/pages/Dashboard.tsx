import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, Users, Calendar, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/libs/utils";
import { fetchProducts, fetchSales, fetchAnalytics } from "@/libs/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "@/components/PermissionGuard";
import { RoleHelpCard } from "@/components/RoleHelp";

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const productsQuery = useQuery<any[], Error>({ queryKey: ["products"], queryFn: fetchProducts });
  const salesQuery = useQuery<any[], Error>({ queryKey: ["sales"], queryFn: fetchSales });
  const analyticsQuery = useQuery<any, Error>({ 
    queryKey: ["analytics"], 
    queryFn: fetchAnalytics,
    enabled: hasPermission('view_analytics')
  });

  const products = productsQuery.data ?? [];
  const sales = salesQuery.data ?? [];
  const analytics = analyticsQuery.data;

  // Use analytics data or fallback to calculated data
  const dailySalesData = analytics?.daily_sales || [];
  const paymentData = analytics?.payment_methods || [];
  const topProducts = analytics?.top_products || [];
  const statistics = analytics?.statistics || {};

  // Use analytics statistics or calculate from sales data
  const totalSales = statistics.total_revenue || (sales as any[]).reduce((s: number, sale: any) => s + parseFloat(sale.total_amount || 0), 0);
  const ordersToday = statistics.today_orders || (sales as any[]).filter((sale: any) => {
    const d = new Date(sale.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const todayRevenue = statistics.today_revenue || 0;
  const avgOrderValue = statistics.avg_order_value || (sales.length > 0 ? totalSales / sales.length : 0);

  const lowStockCount = analytics?.low_stock_products?.length || products.filter(p => (p.stock || 0) <= (p.reorder_level || 5)).length;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: "text-green-600",
      change: `${formatCurrency(todayRevenue)} today`,
      changeColor: todayRevenue > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Total Products",
      value: `${products.length}`,
      icon: Package,
      color: "text-blue-600",
      change: lowStockCount > 0 ? `${lowStockCount} low stock` : "All stocked",
      changeColor: lowStockCount > 0 ? "text-red-600" : "text-green-600"
    },
    {
      title: "Orders Today",
      value: `${ordersToday}`,
      icon: ShoppingCart,
      color: "text-purple-600",
      change: `${sales.length} total orders`,
      changeColor: "text-gray-600"
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(avgOrderValue),
      icon: TrendingUp,
      color: "text-orange-600",
      change: sales.length > 0 ? "Per transaction" : "No data",
      changeColor: "text-gray-600"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.first_name || user?.email?.split('@')[0]}! 
          {user?.role_display && ` You're logged in as ${user.role_display}.`}
        </p>
        
        {/* Role-specific Quick Actions */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <PermissionGuard permission="pos_access">
              <Link to="/pos">
                <Button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Start Sale
                </Button>
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="view_products">
              <Link to="/products">
                <Button variant="outline" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {hasPermission('manage_products') ? 'Manage Products' : 'View Products'}
                </Button>
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="view_sales">
              <Link to="/sales">
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Sales
                </Button>
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="view_analytics">
              <Link to="/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="manage_users">
              <Link to="/users">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </PermissionGuard>
          </div>
        </div>
        
        {/* Role-specific Information */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Your Access Level</h4>
          <div className="flex flex-wrap gap-2">
            {user?.permissions?.map((permission) => (
              <span 
                key={permission}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {permission.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Role-specific help for non-admin users */}
      <RoleHelpCard />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeColor} mt-1`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You have {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock. 
              <Link to="/products" className="ml-2 underline hover:no-underline">
                Manage inventory →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData && paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment data available</p>
                  <p className="text-sm">Complete some sales to see payment methods</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products by Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Units Sold'
                  ]}
                />
                <Bar dataKey="sales" fill="#8884d8" name="sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales data available</p>
                <p className="text-sm">Make some sales to see top products</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <Link to="/sales">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 6).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{sale.receipt_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString()} • {sale.items?.length || 0} items
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(parseFloat(sale.total_amount || 0))}</p>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No sales yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <Link to="/products">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.stock <= (p.reorder_level ?? 10)).slice(0,6).map((p:any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Stock: {p.stock ?? 0}</p>
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                    Low Stock
                  </span>
                </div>
              ))}
              {products.filter(p => p.stock <= (p.reorder_level ?? 10)).length === 0 && (
                <p className="text-muted-foreground text-center py-4">All products well stocked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}