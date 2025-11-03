import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Info, CheckCircle, XCircle } from "lucide-react";

export const RoleHelpCard = () => {
  const { user, hasPermission } = useAuth();

  if (!user || user.role === 'super_admin') return null;

  const roleGuides = {
    cashier: {
      title: "Cashier Guide",
      description: "As a cashier, you can process sales and view basic information.",
      canDo: [
        "Process sales at the POS",
        "View product catalog",
        "View sales history",
        "Print receipts",
        "View dashboard metrics"
      ],
      cantDo: [
        "Add or edit products",
        "View detailed analytics",
        "Manage other users",
        "Change system settings"
      ]
    },
    staff: {
      title: "Staff Guide", 
      description: "As staff, you can handle POS operations and view products.",
      canDo: [
        "Process sales at the POS",
        "View product catalog",
        "View dashboard metrics"
      ],
      cantDo: [
        "View sales history",
        "Add or edit products", 
        "View analytics",
        "Manage users"
      ]
    },
    manager: {
      title: "Manager Guide",
      description: "As a manager, you have access to most store operations.",
      canDo: [
        "Process sales at the POS",
        "Manage products and inventory",
        "View sales history and analytics",
        "Generate reports",
        "View dashboard metrics"
      ],
      cantDo: [
        "Manage other users",
        "Change system settings"
      ]
    },
    admin: {
      title: "Administrator Guide",
      description: "As an admin, you have full access except system settings.",
      canDo: [
        "All POS and sales operations",
        "Full product management",
        "Complete analytics access",
        "User management",
        "Generate all reports"
      ],
      cantDo: [
        "Change core system settings"
      ]
    },
    viewer: {
      title: "Viewer Guide",
      description: "As a viewer, you can see information but not make changes.",
      canDo: [
        "View dashboard metrics",
        "View product catalog",
        "View sales history"
      ],
      cantDo: [
        "Process sales",
        "Add or edit anything",
        "Access analytics",
        "Manage users"
      ]
    }
  };

  const guide = roleGuides[user.role as keyof typeof roleGuides];
  
  if (!guide) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          {guide.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">{guide.description}</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              What you can do:
            </h4>
            <ul className="space-y-1">
              {guide.canDo.map((item, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              What you cannot do:
            </h4>
            <ul className="space-y-1">
              {guide.cantDo.map((item, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};