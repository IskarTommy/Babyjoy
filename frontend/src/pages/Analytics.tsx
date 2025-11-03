import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users } from "lucide-react";

async function fetchAnalytics() {
  const [salesRes, productsRes] = await Promise.all([
    fetch('/api/sales/'),
    fetch('/api/products/')
  ]);
  
  const sales = salesRes.ok ? await salesRes.json() : [];
  const products = productsRes.ok ? await productsRes.json() : [];
  
  return { sales, products };
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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your business performance</p>
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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your business performance</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sales = [], products = [] } = data || {};
  
  // Calculate metrics
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalProducts = products.length;
  const totalSales = sales.length;
  const lowStockProducts = products.filter((p: any) => (p.stock || 0) <= (p.reorder_level || 5)).length;
  
  // Calculate today's metrics
  const today = new Date().toDateString();
  const todaySales = sales.filter((sale: any) => new Date(sale.created_at).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
  
  // Calculate average order value
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: todayRevenue > 0 ? "up" : "neutral",
      subtitle: `$${todayRevenue.toFixed(2)} today`
    },
    {
      title: "Total Sales",
      value: totalSales.toString(),
      icon: ShoppingCart,
      trend: todaySales.length > 0 ? "up" : "neutral",
      subtitle: `${todaySales.length} today`
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      icon: Package,
      trend: lowStockProducts > 0 ? "down" : "neutral",
      subtitle: `${lowStockProducts} low stock`
    },
    {
      title: "Avg Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      trend: "neutral",
      subtitle: "Per transaction"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your business performance</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sale.receipt_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${parseFloat(sale.total_amount || 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{sale.items?.length || 0} items</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product: any) => {
                const isLowStock = (product.stock || 0) <= (product.reorder_level || 5);
                return (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${parseFloat(product.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
                        {product.stock || 0} units
                      </p>
                      {isLowStock && (
                        <p className="text-xs text-red-500">Low Stock</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No products available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
