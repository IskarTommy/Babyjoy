import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { QuickActionBar } from "@/components/RoleBasedNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <QuickActionBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
