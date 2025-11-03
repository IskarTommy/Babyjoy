import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/libs/utils";
import { fetchProducts as apiFetchProducts, createSale } from "@/libs/api";

type Product = { id: number; name: string; price: number; stock?: number };

export default function POS() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const productsQuery = useQuery<Product[], Error>({ 
    queryKey: ['products'], 
    queryFn: async () => {
      const data = await apiFetchProducts();
      return data.map((p: any) => {
        const price = parseFloat(p.price || 0);
        const stock = p.stock != null ? parseInt(p.stock, 10) : 0;
        
        return {
          id: parseInt(p.id, 10) || 0,
          name: String(p.name || 'Unknown Product'),
          price: isNaN(price) ? 0 : price,
          stock: isNaN(stock) ? 0 : stock,
        };
      });
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  const products = productsQuery.data ?? [];

  useEffect(() => {
    // Ensure products are fresh when POS mounts, but only if we have a queryClient
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  }, [queryClient]);

  const saleMutation = useMutation({
    mutationFn: createSale,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
    }
  });

  if (productsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Quick checkout for in-store customers</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      </div>
    );
  }

  if (productsQuery.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-red-500">Error loading products: {productsQuery.error.message}</p>
          <Button onClick={() => productsQuery.refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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

  const total = cart.reduce((s, it) => {
    const price = typeof it.product.price === 'number' ? it.product.price : 0;
    const qty = typeof it.qty === 'number' ? it.qty : 0;
    return s + (price * qty);
  }, 0);
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 text-center text-muted-foreground">
                    {searchTerm ? "No products found" : "No products"}
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div key={p.id} className="rounded border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(p.price)}</div>
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
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.product.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e)=>changeQty(item.product.id, parseInt(e.target.value||'0',10))} 
                          className="w-16 px-2 py-1 border border-input rounded text-center"
                        />
                        <div className="font-medium">{formatCurrency(item.product.price * item.qty)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {/* Customer fields removed per request */}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
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
