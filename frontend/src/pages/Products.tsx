import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";

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
  const res = await fetch("/api/products/");
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
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
  const { data, isLoading, error } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const queryClient = useQueryClient();

  // Form state for adding a product inline
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addProduct = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm({ name: "", sku: "", price: "", cost: "", stock: "" });
      setShowForm(false);
    }
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      sku: form.sku || undefined,
      price: parseFloat(String(form.price)) || 0,
      cost: form.cost ? parseFloat(String(form.cost)) : undefined,
      stock: form.stock ? parseInt(String(form.stock), 10) : 0,
      image_url: (form as any).image_url || undefined,
    };
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "Add Product"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={onChange} placeholder="Product name" className="input input-bordered w-full" />
            <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU (A-Z0-9_- )" className="input input-bordered w-full" />
            <input name="price" value={form.price} onChange={onChange} placeholder="Price" type="number" step="0.01" className="input input-bordered w-full" />
            <input name="cost" value={form.cost} onChange={onChange} placeholder="Cost" type="number" step="0.01" className="input input-bordered w-full" />
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
          <p>Loading products…</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
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
                        <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.sku ?? "—"}</td>
                      <td className="px-3 py-2">{p.price}</td>
                      <td className="px-3 py-2">{p.stock ?? 0}</td>
                      <td className="px-3 py-2">
                        <button
                          className="text-sm text-red-600 hover:underline"
                          onClick={async () => {
                            if (!confirm(`Delete product '${p.name}'? This cannot be undone.`)) return;
                            try {
                              const res = await fetch(`/api/products/${p.id}/`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Delete failed');
                              // refresh products
                              queryClient.invalidateQueries({ queryKey: ['products'] });
                            } catch (err: any) {
                              alert(err?.message || 'Failed to delete');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
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
