import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Settings, Receipt } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/libs/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "@/components/PermissionGuard";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", permission: "view_dashboard" },
  { to: "/products", icon: Package, label: "Products", permission: "view_products" },
  { to: "/pos", icon: ShoppingCart, label: "POS", permission: "pos_access" },
  { to: "/sales", icon: Receipt, label: "Sales", permission: "view_sales" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", permission: "view_analytics" },
  { to: "/users", icon: Users, label: "Users", permission: "manage_users" },
  { to: "/settings", icon: Settings, label: "Settings", permission: "manage_settings" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold text-primary">BabyJoy</h1>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <PermissionGuard key={item.to} permission={item.permission}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
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
          </PermissionGuard>
        ))}
      </nav>
      
      {/* User Role Display */}
      {user && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <div className="text-xs text-sidebar-accent-foreground opacity-75">
              Logged in as
            </div>
            <div className="font-medium text-sidebar-accent-foreground">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user.email}
            </div>
            <div className="text-xs text-sidebar-accent-foreground opacity-75">
              {user.role_display || 'Staff'}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
