import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Product = { id: number; name: string; price: number; stock?: number };

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products/');
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return (data || []).map((p: any) => ({
    ...p,
    price: Number(p.price || 0),
    stock: p.stock != null ? Number(p.stock) : 0,
  }));
}

export default function POS() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery<Product[], Error>({ queryKey: ['products'], queryFn: fetchProducts });
  const products = productsQuery.data ?? [];

  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  // Customer name/phone intentionally removed per request
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure products are fresh when POS mounts
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, []);

  function addToCart(p: Product) {
    setCart((c) => {
      const idx = c.findIndex(x => x.product.id === p.id);
      if (idx === -1) return [...c, { product: p, qty: 1 }];
      const next = [...c]; next[idx] = { ...next[idx], qty: next[idx].qty + 1 }; return next;
    });
  }

  function changeQty(productId: number, qty: number) {
    setCart((c) => c.map(item => item.product.id === productId ? { ...item, qty: Math.max(0, qty) } : item).filter(i=>i.qty>0));
  }

  const total = cart.reduce((s, it) => s + it.product.price * it.qty, 0);

  const saleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/sales/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create sale');
      return res.json();
    },
    onSuccess() {
  queryClient.invalidateQueries({ queryKey: ['sales'] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
      // customer fields removed; just reset cart
    }
  });

  function completeSale() {
    if (!cart.length) return;
    const receipt = `R-${Date.now()}`;
    const payload = {
      receipt_number: receipt,
      total_amount: total,
      payment_method: 'cash',
      items: cart.map(c => ({ product: c.product.id, quantity: c.qty, unit_price: c.product.price }))
    };
    setIsSubmitting(true);
    setMutationError(null);
    saleMutation.mutate(payload, {
      onSuccess() {
        setIsSubmitting(false);
      },
      onError(err: any) {
        setIsSubmitting(false);
        setMutationError(err?.message || String(err));
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <p className="text-muted-foreground">Quick checkout for in-store customers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-2 text-center text-muted-foreground">No products</div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="rounded border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">${p.price.toFixed(2)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">{p.stock ?? 0} in stock</div>
                        <Button size="sm" onClick={() => addToCart(p)}>Add</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Empty cart</div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} value={item.qty} onChange={(e)=>changeQty(item.product.id, parseInt(e.target.value||'0',10))} className="input input-sm w-16" />
                        <div className="font-medium">${(item.product.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {/* Customer fields removed per request */}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={completeSale} disabled={isSubmitting || cart.length===0}>
                {isSubmitting ? 'Processing...' : 'Complete Sale'}
              </Button>
              {mutationError && <p className="text-red-500">{mutationError}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
