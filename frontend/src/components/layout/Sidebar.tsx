import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/pos", icon: ShoppingCart, label: "POS" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold text-primary">BabyJoy</h1>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
