import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Sales",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Products",
      value: "248",
      change: "+5",
      icon: Package,
      color: "text-secondary",
    },
    {
      title: "Orders Today",
      value: "23",
      change: "+8",
      icon: ShoppingCart,
      color: "text-accent",
    },
    {
      title: "Growth",
      value: "18.2%",
      change: "+2.4%",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">{stat.change}</span> from last week
              </p>
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Order #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">2 items</p>
                  </div>
                  <p className="font-semibold">${(Math.random() * 100 + 50).toFixed(2)}</p>
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
              {["Baby Bottle", "Diapers Pack", "Baby Lotion", "Pacifier Set"].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{item}</p>
                    <p className="text-sm text-muted-foreground">Stock: {Math.floor(Math.random() * 10)}</p>
                  </div>
                  <span className="text-xs font-medium text-destructive">Low</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
