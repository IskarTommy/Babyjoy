import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

async function fetchSales() {
  const res = await fetch('/api/sales/');
  if (!res.ok) throw new Error('Failed to load sales');
  return res.json();
}

export default function Sales() {
  const { data, isLoading, error } = useQuery<any[], Error>({ queryKey: ['sales'], queryFn: fetchSales });

  function printReceipt(sale: any) {
    const features = 'menubar=no,toolbar=no,location=no,status=no';
    const win = window.open('', '_blank', features);
    if (!win) return;
    const itemsHtml = (sale.items || []).map((it: any) => `<tr><td>${it.product_name || it.product}</td><td>${it.quantity}</td><td>$${parseFloat(it.unit_price||0).toFixed(2)}</td><td>$${parseFloat(it.subtotal||0).toFixed(2)}</td></tr>`).join('');
    const html = `
      <html>
        <head>
          <title>Receipt ${sale.receipt_number}</title>
          <style>body{font-family: Arial, Helvetica, sans-serif; padding:20px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h2>Receipt: ${sale.receipt_number}</h2>
          <p>Date: ${new Date(sale.created_at).toLocaleString()}</p>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <h3>Total: $${parseFloat(sale.total_amount||0).toFixed(2)}</h3>
          <script>setTimeout(()=>{window.print();}, 300);</script>
        </body>
      </html>
    `;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">List of sales and receipts</p>
        </div>

      <div className="rounded-lg border bg-card p-4">
        {isLoading ? (
          <p>Loading sales…</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">Receipt</th>
                  <th className="px-3 py-2">Items</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length ? (
                  data.map((s: any) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.receipt_number}</td>
                      <td className="px-3 py-2">{(s.items || []).length}</td>
                      <td className="px-3 py-2">${parseFloat(s.total_amount||0).toFixed(2)}</td>
                      <td className="px-3 py-2"><Button onClick={()=>printReceipt(s)}>Print</Button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No sales found</td>
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
