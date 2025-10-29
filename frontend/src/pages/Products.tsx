import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Product = {
  id: number;
  name: string;
  sku?: string | null;
  price: string | number;
  cost?: string | number | null;
  stock?: number;
};

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products/");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default function Products() {
  const { data, isLoading, error } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

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
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.sku ?? "—"}</td>
                      <td className="px-3 py-2">{p.price}</td>
                      <td className="px-3 py-2">{p.stock ?? 0}</td>
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
