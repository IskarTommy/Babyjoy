import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { apiCall } from "@/libs/api";

async function fetchAnalytics() {
  const response = await apiCall('/analytics/');
  return response.json();
}

export default function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">Overall store performance and financial insights</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">Overall store performance and financial insights</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Failed to load analytics data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    statistics = {},
    daily_sales = [],
    payment_methods = [],
    top_products = [],
    low_stock_products = []
  } = data || {};
  
  // Extract statistics from backend
  const {
    total_revenue = 0,
    total_orders = 0,
    today_revenue = 0,
    today_orders = 0,
    avg_order_value = 0
  } = statistics;
  
  // Calculate weekly revenue from daily sales
  const weekRevenue = daily_sales.reduce((sum: number, day: any) => sum + (day.revenue || 0), 0);
  const weekOrders = daily_sales.reduce((sum: number, day: any) => sum + (day.orders || 0), 0);

  const metrics = [
    {
      title: "Total Store Revenue",
      value: `₵${total_revenue.toFixed(2)}`,
      icon: DollarSign,
      trend: today_revenue > 0 ? "up" : "neutral",
      subtitle: `All time • ${total_orders} orders`
    },
    {
      title: "Today's Performance",
      value: `₵${today_revenue.toFixed(2)}`,
      icon: TrendingUp,
      trend: today_orders > 0 ? "up" : "neutral",
      subtitle: `${today_orders} orders today`
    },
    {
      title: "Weekly Revenue",
      value: `₵${weekRevenue.toFixed(2)}`,
      icon: ShoppingCart,
      trend: weekOrders > 0 ? "up" : "neutral",
      subtitle: `Last 7 days • ${weekOrders} orders`
    },
    {
      title: "Average Order Value",
      value: `₵${avg_order_value.toFixed(2)}`,
      icon: Package,
      trend: avg_order_value > 50 ? "up" : "neutral",
      subtitle: `${low_stock_products.length} low stock items`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Analytics</h1>
        <p className="text-muted-foreground">Overall store performance and financial insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                {metric.trend === "down" && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
                {metric.subtitle}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {daily_sales.map((day: any) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{day.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                  </div>
                </div>
              ))}
              {daily_sales.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top_products.map((product: any, index: number) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {top_products.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No product data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {low_stock_products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Reorder at: {product.reorder_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{product.stock} left</p>
                    <p className="text-xs text-red-500">Low Stock</p>
                  </div>
                </div>
              ))}
              {low_stock_products.length === 0 && (
                <p className="text-center text-green-600 py-4">All products well stocked!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      {payment_methods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {payment_methods.map((method: any) => (
                <div key={method.name} className="text-center p-4 border rounded-lg">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-2xl font-bold text-blue-600">₵{method.value.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}