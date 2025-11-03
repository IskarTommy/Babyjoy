import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "@/components/PermissionGuard";
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Settings,
  Receipt,
  Plus
} from "lucide-react";

export const QuickActionBar = () => {
  const { hasPermission } = useAuth();

  return (
    <div className="bg-muted/30 border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
        
        <PermissionGuard permission="pos_access">
          <Link to="/pos">
            <Button size="sm" className="flex items-center gap-2">
              <ShoppingCart className="h-3 w-3" />
              New Sale
            </Button>
          </Link>
        </PermissionGuard>
        
        <PermissionGuard permission="manage_products">
          <Link to="/products">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Add Product
            </Button>
          </Link>
        </PermissionGuard>
        
        <PermissionGuard permission="view_sales">
          <Link to="/sales">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Receipt className="h-3 w-3" />
              Recent Sales
            </Button>
          </Link>
        </PermissionGuard>
        
        <PermissionGuard permission="view_analytics">
          <Link to="/analytics">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              Reports
            </Button>
          </Link>
        </PermissionGuard>
      </div>
    </div>
  );
};

export const RoleBasedBreadcrumb = ({ currentPage }: { currentPage: string }) => {
  const { user, hasPermission } = useAuth();
  
  const getAvailablePages = () => {
    const pages = [];
    
    if (hasPermission('view_dashboard')) {
      pages.push({ name: 'Dashboard', path: '/', icon: TrendingUp });
    }
    if (hasPermission('view_products')) {
      pages.push({ name: 'Products', path: '/products', icon: Package });
    }
    if (hasPermission('pos_access')) {
      pages.push({ name: 'POS', path: '/pos', icon: ShoppingCart });
    }
    if (hasPermission('view_sales')) {
      pages.push({ name: 'Sales', path: '/sales', icon: Receipt });
    }
    if (hasPermission('view_analytics')) {
      pages.push({ name: 'Analytics', path: '/analytics', icon: BarChart3 });
    }
    if (hasPermission('manage_users')) {
      pages.push({ name: 'Users', path: '/users', icon: Users });
    }
    if (hasPermission('manage_settings')) {
      pages.push({ name: 'Settings', path: '/settings', icon: Settings });
    }
    
    return pages;
  };

  const availablePages = getAvailablePages();
  const otherPages = availablePages.filter(page => 
    !page.path.includes(currentPage.toLowerCase()) && page.path !== '/'
  );

  if (otherPages.length === 0) return null;

  return (
    <div className="bg-background border-b px-6 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Navigate to:</span>
        {otherPages.slice(0, 4).map((page) => (
          <Link key={page.path} to={page.path}>
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex items-center gap-2 h-7 px-2 text-xs"
            >
              <page.icon className="h-3 w-3" />
              {page.name}
            </Button>
          </Link>
        ))}
        {otherPages.length > 4 && (
          <span className="text-muted-foreground text-xs">
            +{otherPages.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};