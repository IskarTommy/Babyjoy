import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, CreditCard, Bell, Shield, Printer, Database } from "lucide-react";

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Hafshat Kidz",
    storeAddress: "123 Liberation Road, Accra, Ghana",
    storePhone: "+233 24 123 4567",
    storeEmail: "info@babyjoy.com.gh",
    currency: "GHS",
    taxRate: "12.5"
  });

  const [posSettings, setPosSettings] = useState({
    receiptFooter: "Thank you for shopping with us!",
    autoOpenCashDrawer: true,
    printReceipts: true,
    askForCustomerInfo: false
  });

  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    dailySalesReport: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log("Saving store settings:", storeSettings);
  };

  const handleSavePosSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving POS settings:", posSettings);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving notification settings:", notifications);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your store preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveStoreSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({...storeSettings, storeEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="GHS">GHS (₵)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({...storeSettings, taxRate: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
              <Button type="submit">Save Store Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* POS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              POS Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePosSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Receipt Footer Message</label>
                <input
                  type="text"
                  value={posSettings.receiptFooter}
                  onChange={(e) => setPosSettings({...posSettings, receiptFooter: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Thank you message for receipts"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-open Cash Drawer</label>
                    <p className="text-xs text-muted-foreground">Automatically open cash drawer after sale</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={posSettings.autoOpenCashDrawer}
                    onChange={(e) => setPosSettings({...posSettings, autoOpenCashDrawer: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Print Receipts</label>
                    <p className="text-xs text-muted-foreground">Automatically print receipts after sale</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={posSettings.printReceipts}
                    onChange={(e) => setPosSettings({...posSettings, printReceipts: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Ask for Customer Info</label>
                    <p className="text-xs text-muted-foreground">Prompt for customer details during checkout</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={posSettings.askForCustomerInfo}
                    onChange={(e) => setPosSettings({...posSettings, askForCustomerInfo: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
              </div>
              <Button type="submit">Save POS Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Low Stock Alerts</label>
                    <p className="text-xs text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={(e) => setNotifications({...notifications, lowStockAlerts: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Daily Sales Report</label>
                    <p className="text-xs text-muted-foreground">Receive daily sales summary</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dailySalesReport}
                    onChange={(e) => setNotifications({...notifications, dailySalesReport: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsNotifications}
                    onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
              </div>
              <Button type="submit">Save Notification Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Backup Data</h4>
                <p className="text-sm text-muted-foreground">Export your store data for backup</p>
                <Button variant="outline">Export Data</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Import Data</h4>
                <p className="text-sm text-muted-foreground">Import products or sales data</p>
                <Button variant="outline">Import Data</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Clear Cache</h4>
                <p className="text-sm text-muted-foreground">Clear application cache and temporary files</p>
                <Button variant="outline">Clear Cache</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Reset Settings</h4>
                <p className="text-sm text-muted-foreground">Reset all settings to default values</p>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Reset Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
