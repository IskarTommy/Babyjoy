import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/libs/utils";
import { RoleBasedBreadcrumb } from "@/components/RoleBasedNavigation";
import { PermissionGuard } from "@/components/PermissionGuard";
import { apiCall, updateProduct } from "@/libs/api";

type Product = {
  id: number;
  name: string;
  sku?: string | null;
  price: string | number;
  cost?: string | number | null;
  stock?: number;
  image_url?: string | null;
};

async function fetchProducts(): Promise<Product[]> {
  const response = await apiCall("/products/");
  const data = await response.json();
  // Normalize types from backend (price/cost may be strings)
  return (data || []).map((p: any) => ({
    ...p,
    price: Number(p.price || 0),
    cost: p.cost != null ? Number(p.cost) : null,
    stock: p.stock != null ? Number(p.stock) : 0,
    image_url: p.image_url ?? null,
  }));
}

export default function Products() {
  const { data, isLoading, error, refetch } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const queryClient = useQueryClient();

  // Form state for adding a product inline
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name?: string;
    sku?: string;
    price?: string;
    cost?: string;
    stock?: string;
    image_url?: string;
  }>({});

  const addProduct = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiCall("/products/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm({ name: "", sku: "", price: "", cost: "", stock: "" });
      setShowForm(false);
    },
    onError: (error: Error) => {
      console.error('Failed to create product:', error);
      alert(`Failed to create product: ${error.message}`);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return updateProduct(id, data);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingId(null);
      setEditForm({});
    },
    onError: (error: Error) => {
      console.error('Failed to update product:', error);
      alert(`Failed to update product: ${error.message}`);
    }
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function onEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      sku: product.sku || "",
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      stock: product.stock?.toString() || "0",
      image_url: product.image_url || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingId) return;
    
    const payload: any = {
      name: editForm.name,
      price: parseFloat(String(editForm.price)) || 0,
      stock: editForm.stock ? parseInt(String(editForm.stock), 10) : 0,
    };
    
    // Include optional fields if they have values
    if (editForm.sku && editForm.sku.trim()) {
      payload.sku = editForm.sku.trim().toUpperCase();
    }
    if (editForm.cost && editForm.cost.trim()) {
      payload.cost = parseFloat(String(editForm.cost));
    }
    if (editForm.image_url && editForm.image_url.trim()) {
      payload.image_url = editForm.image_url.trim();
    }
    
    updateProductMutation.mutate({ id: editingId, data: payload });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      price: parseFloat(String(form.price)) || 0,
      stock: form.stock ? parseInt(String(form.stock), 10) : 0,
    };
    
    // Only include optional fields if they have values
    if (form.sku && form.sku.trim()) {
      payload.sku = form.sku.trim().toUpperCase();
    }
    if (form.cost && form.cost.trim()) {
      payload.cost = parseFloat(String(form.cost));
    }
    if ((form as any).image_url && (form as any).image_url.trim()) {
      payload.image_url = (form as any).image_url.trim();
    }
    
    addProduct.mutate(payload);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/products/upload-image/', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setForm((s) => ({ ...s, image_url: json.url } as any));
    } catch (err: any) {
      setUploadError(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <RoleBasedBreadcrumb currentPage="Products" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard permission="manage_products">
            <Button onClick={() => setShowForm((s) => !s)}>
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancel" : "Add Product"}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">SKU Examples:</h4>
            <p className="text-xs text-blue-700">
              • Baby Diapers: <code>BJ-DIAPER-NB</code>, <code>BJ-DIAPER-S</code>, <code>BJ-DIAPER-M</code><br/>
              • Toys: <code>TOY-CAR-RED</code>, <code>TOY-DOLL-001</code>, <code>PUZZLE-ABC</code><br/>
              • Clothing: <code>CLOTH-SHIRT-6M</code>, <code>DRESS-PINK-12M</code><br/>
              • Feeding: <code>BOTTLE-250ML</code>, <code>SPOON-SOFT</code>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={onChange} placeholder="Product name" className="w-full px-3 py-2 border border-input rounded-md" />
            <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU (e.g., BJ-DIAPER-001, TOY-CAR-RED)" className="w-full px-3 py-2 border border-input rounded-md" />
            <input name="price" value={form.price} onChange={onChange} placeholder="Price (₵)" type="number" step="0.01" className="w-full px-3 py-2 border border-input rounded-md" />
            <input name="cost" value={form.cost} onChange={onChange} placeholder="Cost (₵)" type="number" step="0.01" className="w-full px-3 py-2 border border-input rounded-md" />
            <input name="stock" value={form.stock} onChange={onChange} placeholder="Stock" type="number" className="input input-bordered w-full" />
            <input name="image_url" value={(form as any).image_url || ""} onChange={onChange} placeholder="Image URL (optional)" className="input input-bordered w-full" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input w-full" />
            {uploading && <p className="text-sm text-muted-foreground">Uploading image…</p>}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>
          <div>
            <Button type="submit" disabled={(addProduct as any).isLoading}>{(addProduct as any).isLoading ? 'Saving...' : 'Create product'}</Button>
            {(addProduct as any).isError && <p className="text-red-500">{((addProduct as any).error as Error)?.message}</p>}
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-card p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading products…</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                  <tr className="text-left">
                    <th className="px-3 py-2">Image</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Stock</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {data && data.length ? (
                  (data as Product[]).map((p) => (
                    <tr key={p.id} className="border-t">
                        <td className="px-3 py-2">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">No</div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingId === p.id ? (
                            <input
                              name="name"
                              value={editForm.name || ""}
                              onChange={onEditChange}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                            />
                          ) : (
                            p.name
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingId === p.id ? (
                            <input
                              name="sku"
                              value={editForm.sku || ""}
                              onChange={onEditChange}
                              placeholder="BJ-ITEM-001"
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                            />
                          ) : (
                            p.sku ?? "—"
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingId === p.id ? (
                            <input
                              name="price"
                              value={editForm.price || ""}
                              onChange={onEditChange}
                              type="number"
                              step="0.01"
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                            />
                          ) : (
                            formatCurrency(Number(p.price))
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingId === p.id ? (
                            <input
                              name="stock"
                              value={editForm.stock || ""}
                              onChange={onEditChange}
                              type="number"
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                            />
                          ) : (
                            <span className={p.stock && p.stock <= 3 ? "text-red-600 font-semibold" : ""}>
                              {p.stock ?? 0}
                              {p.stock && p.stock <= 3 && " (Low)"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {editingId === p.id ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  disabled={updateProductMutation.isPending}
                                  className="text-sm text-green-600 hover:underline flex items-center gap-1"
                                >
                                  <Save className="h-3 w-3" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-sm text-gray-600 hover:underline flex items-center gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <PermissionGuard permission="manage_products">
                                  <button
                                    onClick={() => startEdit(p)}
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </button>
                                </PermissionGuard>
                                <PermissionGuard permission="manage_products">
                                  <button
                                    className="text-sm text-red-600 hover:underline"
                                    onClick={async () => {
                                      if (!confirm(`Delete product '${p.name}'? This cannot be undone.`)) return;
                                      try {
                                        await apiCall(`/products/${p.id}/`, { method: 'DELETE' });
                                        queryClient.invalidateQueries({ queryKey: ['products'] });
                                      } catch (err: any) {
                                        alert(err?.message || 'Failed to delete');
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </PermissionGuard>
                              </>
                            )}
                          </div>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
