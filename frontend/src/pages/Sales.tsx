import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/libs/utils";
import { fetchSales } from "@/libs/api";
import { Calendar, Download, Filter, Search, Printer } from "lucide-react";
import { useState } from "react";
import { RoleBasedBreadcrumb } from "@/components/RoleBasedNavigation";

export default function Sales() {
  const { data, isLoading, error } = useQuery<any[], Error>({ queryKey: ['sales'], queryFn: fetchSales });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const sales = data ?? [];
  
  // Filter sales based on search and date
  const filteredSales = sales.filter((sale: any) => {
    const matchesSearch = sale.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || new Date(sale.created_at).toDateString() === new Date(dateFilter).toDateString();
    return matchesSearch && matchesDate;
  });

  // Group sales by date
  const salesByDate = filteredSales.reduce((groups: any, sale: any) => {
    const date = new Date(sale.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(sale);
    return groups;
  }, {});

  // Sort dates (most recent first)
  const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Calculate daily totals
  const dailyTotals = Object.keys(salesByDate).reduce((totals: any, date: string) => {
    const dayRevenue = salesByDate[date].reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
    const dayTransactions = salesByDate[date].length;
    totals[date] = { revenue: dayRevenue, transactions: dayTransactions };
    return totals;
  }, {});

  // Calculate overall totals for filtered results
  const totalRevenue = filteredSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalTransactions = filteredSales.length;

  function printReceipt(sale: any) {
    const features = 'menubar=no,toolbar=no,location=no,status=no,width=400,height=600';
    const win = window.open('', '_blank', features);
    if (!win) return;
    
    const itemsHtml = (sale.items || []).map((it: any) => 
      `<tr>
        <td>${it.product_name || it.product}</td>
        <td style="text-align: center;">${it.quantity}</td>
        <td style="text-align: right;">₵${parseFloat(it.unit_price||0).toFixed(2)}</td>
        <td style="text-align: right;">₵${parseFloat(it.subtotal||0).toFixed(2)}</td>
      </tr>`
    ).join('');
    
    const subtotal = parseFloat(sale.total_amount || 0) - parseFloat(sale.tax_amount || 0);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${sale.receipt_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 350px; 
              margin: 0 auto; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 15px; 
            }
            .store-name { font-size: 16px; font-weight: bold; }
            .store-info { font-size: 10px; margin-top: 5px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0; 
            }
            th, td { 
              padding: 3px 5px; 
              text-align: left; 
              border-bottom: 1px dotted #999; 
              font-size: 11px;
            }
            th { font-weight: bold; }
            .total-section { 
              border-top: 2px solid #000; 
              padding-top: 10px; 
              margin-top: 15px; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
            }
            .grand-total { 
              font-weight: bold; 
              font-size: 14px; 
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 10px; 
              border-top: 1px dotted #999;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">BabyJoy Ghana</div>
            <div class="store-info">
              123 Oxford Street, Osu<br>
              Accra, Ghana<br>
              Tel: +233 30 123 4567<br>
              Email: info@babyjoy.com.gh
            </div>
          </div>
          
          <div style="margin: 15px 0; font-size: 11px;">
            <strong>Receipt: ${sale.receipt_number}</strong><br>
            Date: ${new Date(sale.created_at).toLocaleString()}<br>
            ${sale.customer_name ? `Customer: ${sale.customer_name}<br>` : ''}
            ${sale.customer_phone ? `Phone: ${sale.customer_phone}<br>` : ''}
            Payment: ${sale.payment_method || 'Cash'}<br>
            Cashier: ${sale.cashier_name || 'Staff'}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₵${subtotal.toFixed(2)}</span>
            </div>
            ${sale.discount_amount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-₵${parseFloat(sale.discount_amount || 0).toFixed(2)}</span>
            </div>` : ''}
            ${sale.tax_amount > 0 ? `
            <div class="total-row">
              <span>Tax (15%):</span>
              <span>₵${parseFloat(sale.tax_amount || 0).toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>₵${parseFloat(sale.total_amount||0).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            Thank you for shopping with us!<br>
            Visit us again soon!<br><br>
            <small>VAT Reg: GH123456789</small>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => { 
                window.print(); 
                setTimeout(() => window.close(), 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  function exportToCSV() {
    const headers = ['Receipt', 'Date', 'Customer', 'Items', 'Payment Method', 'Subtotal', 'Tax', 'Total'];
    const csvData = filteredSales.map((sale: any) => [
      sale.receipt_number,
      new Date(sale.created_at).toLocaleDateString(),
      sale.customer_name || 'Walk-in',
      (sale.items || []).length,
      sale.payment_method || 'Cash',
      (parseFloat(sale.total_amount || 0) - parseFloat(sale.tax_amount || 0)).toFixed(2),
      parseFloat(sale.tax_amount || 0).toFixed(2),
      parseFloat(sale.total_amount || 0).toFixed(2)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Loading sales data...</p>
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
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-red-500">Error loading sales: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoleBasedBreadcrumb currentPage="Sales" />
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Daily Sales</h1>
          <p className="text-muted-foreground">View sales grouped by date with daily totals</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards - Filtered Results */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {dateFilter ? 'Filtered Revenue' : 'Total Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
              {dateFilter && ' (filtered)'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Shown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedDates.length}</div>
            <p className="text-xs text-muted-foreground">
              {dateFilter ? 'Filtered period' : 'Total days with sales'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(sortedDates.length > 0 ? totalRevenue / sortedDates.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search receipts or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-input rounded-md w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              />
            </div>
            {(searchTerm || dateFilter) && (
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setDateFilter(""); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Grouped by Date */}
      <div className="space-y-4">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const daySales = salesByDate[date];
            const dayTotal = dailyTotals[date];
            const isToday = new Date(date).toDateString() === new Date().toDateString();
            const isYesterday = new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString();
            
            let dateLabel = new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            
            if (isToday) dateLabel = `Today - ${dateLabel}`;
            else if (isYesterday) dateLabel = `Yesterday - ${dateLabel}`;
            
            return (
              <Card key={date}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {dateLabel}
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(dayTotal.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dayTotal.transactions} transaction{dayTotal.transactions !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="px-3 py-2 font-medium text-sm">Time</th>
                          <th className="px-3 py-2 font-medium text-sm">Receipt</th>
                          <th className="px-3 py-2 font-medium text-sm">Customer</th>
                          <th className="px-3 py-2 font-medium text-sm">Items</th>
                          <th className="px-3 py-2 font-medium text-sm">Payment</th>
                          <th className="px-3 py-2 font-medium text-sm">Total</th>
                          <th className="px-3 py-2 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySales.map((sale: any) => (
                          <tr key={sale.id} className="border-b hover:bg-muted/50">
                            <td className="px-3 py-2 text-sm">
                              {new Date(sale.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="px-3 py-2 font-mono text-sm">{sale.receipt_number}</td>
                            <td className="px-3 py-2 text-sm">
                              <div>
                                {sale.customer_name || 'Walk-in'}
                                {sale.customer_phone && (
                                  <>
                                    <br />
                                    <span className="text-xs text-muted-foreground">{sale.customer_phone}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm">{(sale.items || []).length}</td>
                            <td className="px-3 py-2 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {sale.payment_method || 'Cash'}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-semibold">{formatCurrency(parseFloat(sale.total_amount || 0))}</td>
                            <td className="px-3 py-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => printReceipt(sale)}
                                className="flex items-center gap-1"
                              >
                                <Printer className="h-3 w-3" />
                                Print
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchTerm || dateFilter ? 'No sales match your filters' : 'No sales found'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}