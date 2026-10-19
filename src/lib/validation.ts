import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required")
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(1).max(20).default(1)
});

export const updateCartSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(20)
});

export const couponSchema = z.object({ code: z.string().min(1), subtotal: z.number().min(0) });

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(3, "Write a few words")
});

export const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(3),
    country: z.string().min(1)
  }),
  shippingMethod: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["stripe", "razorpay", "cod"])
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5)
});

export const productCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  brand: z.string().optional(),
  basePrice: z.number().positive(),
  gender: z.enum(["MEN", "WOMEN", "ACCESSORIES", "UNISEX"]),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  material: z.string().optional(),
  care: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isLimited: z.boolean().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), isVideo: z.boolean().optional() })).optional(),
        variants: z.array(z.object({
          color: z.string(), size: z.string(), price: z.number().positive(), compareAtPrice: z.number().optional(), stock: z.number().int().min(0), sku: z.string().optional(), weight: z.number().optional()
        })).min(1)
});
