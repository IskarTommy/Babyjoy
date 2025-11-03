import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined, currency: string = "GHS"): string {
  // Convert to number and handle edge cases
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  
  // Handle NaN or invalid numbers
  if (isNaN(numAmount)) {
    return currency === "GHS" ? "₵0.00" : "$0.00";
  }
  
  if (currency === "GHS") {
    return `₵${numAmount.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numAmount);
}
