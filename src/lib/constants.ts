export const SITE = {
  name: "Maison Atelier",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  currency: "USD",
  currencySymbol: "$"
};

export const TAX_RATE = 0.0; // configure per region; 0 by default (display only)

// Flat shipping tiers (USD)
export const SHIPPING = {
  freeThreshold: 150,
  standard: 9.99,
  express: 19.99
};

export const GENDERS = ["MEN", "WOMEN", "ACCESSORIES", "UNISEX"] as const;

export const SIZES = {
  MEN: ["XS", "S", "M", "L", "XL", "XXL"],
  WOMEN: ["XS", "S", "M", "L", "XL"],
  ACCESSORIES: ["ONE SIZE", "S", "M", "L"]
};

export const COLORS = [
  "Black", "White", "Beige", "Charcoal", "Sand", "Olive", "Navy", "Brown", "Cream", "Grey"
];

export function formatPrice(value: number): string {
  return SITE.currencySymbol + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function calcShipping(subtotal: number): { standard: number; express: number } {
  const free = subtotal >= SHIPPING.freeThreshold;
  return {
    standard: free ? 0 : SHIPPING.standard,
    express: free ? SHIPPING.express - SHIPPING.standard : SHIPPING.express
  };
}

export function generateOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `MA-${y}-${rand}`;
}
