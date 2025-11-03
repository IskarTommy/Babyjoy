import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, User, Shield, Clock, Mail, DollarSign, ShoppingCart, Edit, Save, X } from "lucide-react";
import { fetchUsers, updateUserRole } from "@/libs/api";
import { formatCurrency } from "@/libs/utils";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery<any[], Error>({ 
    queryKey: ['users'], 
    queryFn: fetchUsers 
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingRole(null);
      setNewRole('');
    },
    onError: (error: any) => {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  });

  const roleOptions = [
    { value: 'super_admin', label: 'Super Administrator', color: 'bg-red-100 text-red-800' },
    { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-800' },
    { value: 'manager', label: 'Store Manager', color: 'bg-blue-100 text-blue-800' },
    { value: 'cashier', label: 'Cashier', color: 'bg-green-100 text-green-800' },
    { value: 'staff', label: 'Staff Member', color: 'bg-gray-100 text-gray-800' },
    { value: 'viewer', label: 'Viewer Only', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption?.color || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role: string) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption?.label || role;
  };

  const handleRoleEdit = (userId: number, currentRole: string) => {
    setEditingRole(userId);
    setNewRole(currentRole);
  };

  const handleRoleSave = (userId: number) => {
    if (newRole) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleRoleCancel = () => {
    setEditingRole(null);
    setNewRole('');
  };

  const getStatusColor = (user: any) => {
    return user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-red-500">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(user => user.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(user => user.is_staff).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Staff access</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(user => user.is_superuser).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Full access</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username}
                        </h3>
                        
                        {editingRole === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="px-2 py-1 text-xs border rounded"
                            >
                              {roleOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleSave(user.id)}
                              className="p-1 text-green-600 hover:text-green-700"
                              disabled={updateRoleMutation.isPending}
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={handleRoleCancel}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                            <PermissionGuard permission="manage_users">
                              <button
                                onClick={() => handleRoleEdit(user.id, user.role)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </PermissionGuard>
                          </div>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Joined {new Date(user.date_joined).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ShoppingCart className="h-3 w-3" />
                        <span>{user.sales_count} sales</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(user.sales_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal/Panel */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details: {selectedUser.first_name && selectedUser.last_name 
                ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                : selectedUser.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span>{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                        {getRoleLabel(selectedUser.role)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser)}`}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date Joined:</span>
                      <span>{new Date(selectedUser.date_joined).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span>
                        {selectedUser.last_login 
                          ? new Date(selectedUser.last_login).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Sales Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sales:</span>
                      <span className="font-medium">{selectedUser.sales_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(selectedUser.sales_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Sale Value:</span>
                      <span className="font-medium">
                        {selectedUser.sales_count > 0 
                          ? formatCurrency(selectedUser.sales_total / selectedUser.sales_count)
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Permissions</h4>
                  <div className="space-y-2">
                    {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedUser.permissions.map((permission: string) => (
                          <span 
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {permission.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <User className="h-3 w-3 mr-1" />
                        No Permissions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm">
                Edit User
              </Button>
              <Button variant="outline" size="sm">
                Reset Password
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={selectedUser.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
              >
                {selectedUser.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}