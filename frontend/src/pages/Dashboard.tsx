import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

async function fetchProducts() {
  const res = await fetch("/api/products/");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

async function fetchSales() {
  const res = await fetch("/api/sales/");
  if (!res.ok) throw new Error("Failed to load sales");
  return res.json();
}

export default function Dashboard() {
  const productsQuery = useQuery<any[], Error>({ queryKey: ["products"], queryFn: fetchProducts });
  const salesQuery = useQuery<any[], Error>({ queryKey: ["sales"], queryFn: fetchSales });

  const products = productsQuery.data ?? [];
  const sales = salesQuery.data ?? [];

  const totalSales = (sales as any[]).reduce((s: number, sale: any) => s + parseFloat(sale.total_amount || 0), 0);
  const ordersToday = (sales as any[]).filter((sale: any) => {
    const d = new Date(sale.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: "Total Sales",
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Products",
      value: `${products.length}`,
      icon: Package,
      color: "text-secondary",
    },
    {
      title: "Orders Today",
      value: `${ordersToday}`,
      icon: ShoppingCart,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
        <div className="mt-4">
          <Link to="/pos">
            <button className="inline-flex items-center rounded bg-primary px-3 py-2 text-white">Go to POS</button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
              {sales.slice(0, 6).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{sale.receipt_number}</p>
                    <p className="text-sm text-muted-foreground">{sale.items?.length || 0} items</p>
                  </div>
                  <p className="font-semibold">${parseFloat(sale.total_amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.stock <= (p.reorder_level ?? 10)).slice(0,6).map((p:any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Stock: {p.stock ?? 0}</p>
                  </div>
                  <span className="text-xs font-medium text-destructive">Low</span>
                </div>
              ))}
              {products.filter(p => p.stock <= (p.reorder_level ?? 10)).length === 0 && (
                <p className="text-muted-foreground">No low-stock products</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
