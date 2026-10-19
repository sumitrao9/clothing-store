import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"
];

const COLORS = ["Black", "White", "Beige", "Charcoal", "Sand", "Olive", "Navy", "Brown"];
const MEN_SIZES = ["S", "M", "L", "XL"];
const WOMEN_SIZES = ["XS", "S", "M", "L"];
const ACC_SIZES = ["ONE SIZE"];

function img(i: number) { return IMG[i % IMG.length]; }

async function main() {
  console.log("Seeding database…");

  // Clean in dependency order
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.refund.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.category.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.address.deleteMany(),
    prisma.order.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.newsletter.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.user.deleteMany()
  ]);

  // ADMIN
  await prisma.user.create({
    data: { email: "admin@maison-atelier.com", name: "Store Admin", role: "ADMIN", passwordHash: await bcrypt.hash("admin12345", 12), emailVerified: new Date() }
  });

  // Categories
  const catMen = await prisma.category.create({ data: { slug: "men", name: "Men", gender: "MEN", description: "Considered essentials for the modern wardrobe.", image: img(3), sortOrder: 1 } });
  const catWomen = await prisma.category.create({ data: { slug: "women", name: "Women", gender: "WOMEN", description: "Fluid, feminine, and precise.", image: img(4), sortOrder: 2 } });
  const catAcc = await prisma.category.create({ data: { slug: "accessories", name: "Accessories", gender: "ACCESSORIES", description: "The finishing details.", image: img(9), sortOrder: 3 } });

  // Collections
  const colSummer = await prisma.collection.create({ data: { slug: "summer-26", name: "Summer '26", season: "Summer 2026", description: "Light layers and sun-bleached tones.", heroImage: img(5), sortOrder: 1 } });
  const colEssentials = await prisma.collection.create({ data: { slug: "essentials", name: "Essentials", season: "Year-round", description: "The building blocks of every wardrobe.", heroImage: img(1), sortOrder: 2 } });
  const colStreet = await prisma.collection.create({ data: { slug: "street-form", name: "Street Form", season: "FW 2026", description: "Oversized, graphic, and unapologetic.", heroImage: img(8), sortOrder: 3 } });
  const colMidnight = await prisma.collection.create({ data: { slug: "midnight", name: "Midnight Collection", season: "Evening", description: "After-dark dressing in deepest tones.", heroImage: img(6), sortOrder: 4 } });
  const colNew = await prisma.collection.create({ data: { slug: "new-season", name: "New Season", season: "2026", description: "The latest drop.", heroImage: img(2), sortOrder: 5 } });

  type T = { name: string; desc: string; price: number; compare?: number; gender: any; cat: any; collection?: any; tags: string[]; material: string; colors: string[]; sizes: string[]; isNew?: boolean; isBest?: boolean; isLimited?: boolean; isFeatured?: boolean; isTrending?: boolean };
  const products: T[] = [
    { name: "Oversized Black Tee", desc: "A heavyweight cotton tee with a relaxed drop-shoulder silhouette.", price: 48, compare: 60, gender: "MEN", cat: catMen, collection: colNew, tags: ["tee", "basics"], material: "100% Combed Cotton", colors: ["Black", "White", "Sand"], sizes: MEN_SIZES, isNew: true, isBest: true, isFeatured: true, isTrending: true },
    { name: "Relaxed Linen Shirt", desc: "Breathable European linen with mother-of-pearl buttons.", price: 95, gender: "MEN", cat: catMen, collection: colSummer, tags: ["shirt", "linen"], material: "Linen", colors: ["White", "Beige", "Olive"], sizes: MEN_SIZES, isNew: true },
    { name: "Tailored Wool Trousers", desc: "Sharp pleated trousers in Italian virgin wool.", price: 160, gender: "MEN", cat: catMen, collection: colEssentials, tags: ["trousers", "tailoring"], material: "Virgin Wool", colors: ["Charcoal", "Navy", "Black"], sizes: MEN_SIZES, isBest: true },
    { name: "Bomber Jacket", desc: "Cropped bomber in matte technical nylon with ribbed trims.", price: 220, compare: 260, gender: "MEN", cat: catMen, collection: colStreet, tags: ["jacket", "outerwear"], material: "Nylon", colors: ["Black", "Olive"], sizes: MEN_SIZES, isLimited: true },
    { name: "Selvedge Denim Jeans", desc: "14oz Japanese selvedge, tapered leg.", price: 180, gender: "MEN", cat: catMen, collection: colEssentials, tags: ["jeans", "denim"], material: "Selvedge Denim", colors: ["Navy", "Black"], sizes: MEN_SIZES },
    { name: "Cashmere Hoodie", desc: "Ultra-soft cashmere blend hoodie.", price: 240, gender: "MEN", cat: catMen, collection: colMidnight, tags: ["hoodie", "knit"], material: "Cashmere Blend", colors: ["Charcoal", "Beige"], sizes: MEN_SIZES, isBest: true, isTrending: true },
    { name: "Boxy Knit Sweatshirt", desc: "Boxy crew in brushed-back fleece.", price: 110, gender: "MEN", cat: catMen, collection: colStreet, tags: ["sweatshirt"], material: "Cotton Fleece", colors: ["Sand", "Black", "Olive"], sizes: MEN_SIZES, isNew: true },
    { name: "Pleated Mini Skirt", desc: "Accordion-pleat mini with satin finish.", price: 120, gender: "WOMEN", cat: catWomen, collection: colSummer, tags: ["skirt"], material: "Poly-Satin", colors: ["Beige", "Black"], sizes: WOMEN_SIZES, isNew: true, isTrending: true },
    { name: "Silk Slip Dress", desc: "Bias-cut silk slip with adjustable straps.", price: 210, compare: 250, gender: "WOMEN", cat: catWomen, collection: colMidnight, tags: ["dress", "silk"], material: "Silk", colors: ["Black", "Sand"], sizes: WOMEN_SIZES, isFeatured: true, isLimited: true },
    { name: "Oversized White Shirt", desc: "Crisp poplin shirt, boyfriend fit.", price: 90, gender: "WOMEN", cat: catWomen, collection: colEssentials, tags: ["shirt"], material: "Cotton Poplin", colors: ["White", "Blue"], sizes: WOMEN_SIZES, isBest: true },
    { name: "Cropped Denim Jacket", desc: "Rigid denim jacket, cropped and boxy.", price: 165, gender: "WOMEN", cat: catWomen, collection: colStreet, tags: ["jacket", "denim"], material: "Denim", colors: ["Blue", "Black"], sizes: WOMEN_SIZES },
    { name: "Ribbed Knit Top", desc: "Fine-gauge ribbed top with high neck.", price: 75, gender: "WOMEN", cat: catWomen, collection: colNew, tags: ["top", "knit"], material: "Merino", colors: ["Beige", "Black", "Olive"], sizes: WOMEN_SIZES, isNew: true },
    { name: "Wide-Leg Trousers", desc: "Fluid viscose trousers with pressed crease.", price: 140, gender: "WOMEN", cat: catWomen, collection: colSummer, tags: ["trousers"], material: "Viscose", colors: ["Sand", "Charcoal"], sizes: WOMEN_SIZES },
    { name: "Leather Tote Bag", desc: "Vegetable-tanned leather tote, roomy interior.", price: 320, gender: "ACCESSORIES", cat: catAcc, collection: colEssentials, tags: ["bag", "leather"], material: "Full-grain Leather", colors: ["Brown", "Black"], sizes: ACC_SIZES, isBest: true, isFeatured: true },
    { name: "Structured Cap", desc: "Six-panel cap in washed cotton twill.", price: 45, gender: "ACCESSORIES", cat: catAcc, collection: colStreet, tags: ["cap"], material: "Cotton Twill", colors: ["Black", "Beige", "Olive"], sizes: ACC_SIZES },
    { name: "Leather Belt", desc: "Boxcalf belt with brushed nickel buckle.", price: 85, gender: "ACCESSORIES", cat: catAcc, collection: colEssentials, tags: ["belt"], material: "Boxcalf Leather", colors: ["Brown", "Black"], sizes: ACC_SIZES },
    { name: "Minimal Watch", desc: "38mm steel case, sapphire crystal.", price: 380, gender: "ACCESSORIES", cat: catAcc, collection: colMidnight, tags: ["watch"], material: "Stainless Steel", colors: ["Silver", "Black"], sizes: ACC_SIZES, isLimited: true },
    { name: "Gold Hoop Earrings", desc: "14k gold-filled hoops, 20mm.", price: 95, gender: "ACCESSORIES", cat: catAcc, collection: colMidnight, tags: ["jewelry"], material: "Gold-filled", colors: ["Gold"], sizes: ACC_SIZES, isTrending: true },
    { name: "Quilted Liner Jacket", desc: "Lightweight quilted liner, packable.", price: 175, gender: "MEN", cat: catMen, collection: colStreet, tags: ["jacket"], material: "Recycled Poly", colors: ["Black", "Olive"], sizes: MEN_SIZES, isNew: true },
    { name: "Pleated Wide Trouser", desc: "High-rise pleated trouser in wool blend.", price: 155, gender: "WOMEN", cat: catWomen, collection: colEssentials, tags: ["trousers"], material: "Wool Blend", colors: ["Charcoal", "Beige"], sizes: WOMEN_SIZES },
    { name: "Graphic Print Tee", desc: "Limited print tee on heavy jersey.", price: 55, compare: 70, gender: "MEN", cat: catMen, collection: colStreet, tags: ["tee"], material: "Jersey", colors: ["White", "Black"], sizes: MEN_SIZES, isLimited: true },
    { name: "Satin Slip Skirt", desc: "Bias-cut satin midi skirt.", price: 130, gender: "WOMEN", cat: catWomen, collection: colMidnight, tags: ["skirt"], material: "Satin", colors: ["Black", "Sand"], sizes: WOMEN_SIZES, isNew: true },
    { name: "Chunky Knit Sweater", desc: "Oversized cable knit in lambswool.", price: 195, gender: "MEN", cat: catMen, collection: colEssentials, tags: ["sweater", "knit"], material: "Lambswool", colors: ["Beige", "Charcoal", "Olive"], sizes: MEN_SIZES, isBest: true },
    { name: "Tailored Blazer", desc: "Single-breasted blazer, half-canvas construction.", price: 290, gender: "WOMEN", cat: catWomen, collection: colMidnight, tags: ["blazer", "tailoring"], material: "Wool", colors: ["Black", "Navy"], sizes: WOMEN_SIZES, isFeatured: true, isLimited: true },
    { name: "Cargo Trousers", desc: "Relaxed cargo with utility pockets.", price: 145, gender: "MEN", cat: catMen, collection: colStreet, tags: ["trousers", "cargo"], material: "Cotton Twill", colors: ["Olive", "Black", "Sand"], sizes: MEN_SIZES },
    { name: "Knit Midi Dress", desc: "Ribbed knit midi with slit.", price: 175, gender: "WOMEN", cat: catWomen, collection: colSummer, tags: ["dress", "knit"], material: "Cotton Knit", colors: ["Beige", "Black"], sizes: WOMEN_SIZES, isTrending: true },
    { name: "Denim Shorts", desc: "High-rise denim shorts, vintage wash.", price: 85, gender: "WOMEN", cat: catWomen, collection: colSummer, tags: ["shorts"], material: "Denim", colors: ["Blue", "Black"], sizes: WOMEN_SIZES },
    { name: "Baseball Jersey", desc: "Loose baseball jersey in soft jersey.", price: 90, gender: "MEN", cat: catMen, collection: colStreet, tags: ["top"], material: "Jersey", colors: ["White", "Black", "Olive"], sizes: MEN_SIZES },
    { name: "Crossbody Bag", desc: "Compact crossbody in pebbled leather.", price: 245, gender: "ACCESSORIES", cat: catAcc, collection: colEssentials, tags: ["bag"], material: "Pebbled Leather", colors: ["Brown", "Black", "Beige"], sizes: ACC_SIZES, isBest: true },
    { name: "Wool Beanie", desc: "Ribbed beanie in merino wool.", price: 40, gender: "ACCESSORIES", cat: catAcc, collection: colMidnight, tags: ["beanie"], material: "Merino", colors: ["Black", "Beige", "Olive"], sizes: ACC_SIZES },
    { name: "Silk Scarf", desc: "Hand-rolled silk twill scarf, 90cm.", price: 120, gender: "ACCESSORIES", cat: catAcc, collection: colSummer, tags: ["scarf"], material: "Silk Twill", colors: ["Sand", "Navy"], sizes: ACC_SIZES },
    { name: "Slim Fit Shirt", desc: "Slim poplin shirt with spread collar.", price: 88, gender: "MEN", cat: catMen, collection: colEssentials, tags: ["shirt"], material: "Cotton", colors: ["White", "Blue", "Charcoal"], sizes: MEN_SIZES },
    { name: "Pleated Wide-Leg Jumpsuit", desc: "One-piece pleated jumpsuit.", price: 230, gender: "WOMEN", cat: catWomen, collection: colMidnight, tags: ["jumpsuit"], material: "Viscose", colors: ["Black", "Beige"], sizes: WOMEN_SIZES, isLimited: true }
  ];

  let created = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + (i + 1);
    const basePrice = p.price;
    const createdP = await prisma.product.create({
      data: {
        slug, name: p.name, description: p.desc, brand: "Maison Atelier", basePrice,
        gender: p.gender, categoryId: p.cat.id, collectionId: p.collection?.id || null,
        material: p.material, care: "Dry clean or cold hand wash. Lay flat to dry.", tags: p.tags,
        isNew: !!p.isNew, isBestSeller: !!p.isBest, isLimited: !!p.isLimited, isFeatured: !!p.isFeatured, isTrending: !!p.isTrending,
        images: { create: [0, 1, 2].map((k) => ({ url: img(i + k), alt: p.name, sortOrder: k })) },
        variants: {
          create: p.colors.flatMap((c) => p.sizes.map((s) => ({
            sku: `${slug}-${c.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${s}`.toUpperCase(),
            color: c, size: s, price: basePrice, compareAtPrice: p.compare ?? null,
            stock: Math.floor(5 + Math.random() * 25)
          })))
        }
      }
    });
    created++;
    if (i % 8 === 0) console.log(`  created ${created}/${products.length}`);
  }
  console.log(`Created ${created} products.`);

  // Reviews (approved) on first few products
  const allProducts = await prisma.product.findMany({ take: 6 });
  const reviewData = [
    { r: 5, t: "Perfect fit", b: "Exactly as described, the fabric is incredible." },
    { r: 5, t: "Love it", b: "My new favourite piece. Gets compliments constantly." },
    { r: 4, t: "Great quality", b: "Runs slightly large but beautiful make." },
    { r: 5, t: "Worth it", b: "Premium feel and fast delivery." }
  ];
  for (const p of allProducts) {
    const rd = reviewData[Math.floor(Math.random() * reviewData.length)];
    await prisma.review.create({ data: { productId: p.id, userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id, rating: rd.r, title: rd.t, body: rd.b, status: "APPROVED", verified: true } });
  }
  // Recompute aggregates
  const reviewed = await prisma.product.findMany({ where: { reviews: { some: {} } } });
  for (const p of reviewed) {
    const agg = await prisma.review.aggregate({ where: { productId: p.id, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: p.id }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  }

  // Sample customers + orders
  const c1 = await prisma.user.create({ data: { email: "priya@example.com", name: "Priya Nair", passwordHash: await bcrypt.hash("password123", 12), emailVerified: new Date() } });
  const c2 = await prisma.user.create({ data: { email: "rohan@example.com", name: "Rohan Mehta", passwordHash: await bcrypt.hash("password123", 12), emailVerified: new Date() } });
  await prisma.address.create({ data: { userId: c1.id, line1: "12 Marine Drive", city: "Mumbai", state: "MH", postalCode: "400001", country: "India", phone: "9999999999", isDefault: true } });

  const sampleProducts = await prisma.product.findMany({ take: 4, include: { variants: true } });
  for (const [cust, num] of [[c1, "MA-2026-100001"], [c2, "MA-2026-100002"]] as [any, string][]) {
    const items = sampleProducts.slice(0, 2).map((p) => {
      const v = p.variants[0];
      return { productId: p.id, variantId: v.id, name: p.name, sku: v.sku, color: v.color, size: v.size, price: v.price, quantity: 1, image: "" };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const order = await prisma.order.create({
      data: {
        orderNumber: num, userId: cust.id, email: cust.email, name: cust.name, phone: "9999999999",
        status: "DELIVERED", paymentStatus: "SUCCEEDED", provider: "STRIPE",
        subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal,
        addressSnapshot: { line1: "12 Marine Drive", city: "Mumbai", state: "MH", postalCode: "400001", country: "India" },
        items: { create: items.map((it) => ({ productId: it.productId, variantId: it.variantId, name: it.name, sku: it.sku, color: it.color, size: it.size, price: it.price, quantity: it.quantity })) },
        payments: { create: { provider: "STRIPE", providerPaymentId: "pi_sample_" + num, amount: subtotal, status: "SUCCEEDED", method: "card" } },
        shipments: { create: { status: "DELIVERED", trackingNumber: "MA" + num.slice(-6) } }
      }
    });
    // verified review from purchase
    await prisma.review.create({ data: { userId: cust.id, productId: items[0].productId, orderId: order.id, rating: 5, title: "Lovely", body: "Arrived quickly and fits perfectly.", status: "APPROVED", verified: true } });
    // decrement a bit of stock to reflect the sale
    for (const it of items) {
      await prisma.$executeRawUnsafe(`UPDATE "ProductVariant" SET stock = GREATEST(0, stock - $1) WHERE id = $2`, it.quantity, it.variantId);
    }
  }

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 0, maxUses: 500, perUserLimit: 1, active: true },
      { code: "SAVE20", type: "PERCENT", value: 20, minOrder: 120, maxUses: 200, perUserLimit: 1, active: true },
      { code: "FREESHIP", type: "FIXED", value: 9.99, minOrder: 50, maxUses: 300, perUserLimit: 5, active: true }
    ]
  });

  // Newsletter + contact sample
  await prisma.newsletter.create({ data: { email: "subscriber@example.com" } });
  await prisma.contactMessage.create({ data: { name: "Aanya", email: "aanya@example.com", subject: "Stock query", message: "Will the Silk Slip Dress restock in Black?" } });

  console.log("Seed complete ✅");
  console.log("Admin login: admin@maison-atelier.com / admin12345");
  console.log("Sample user: priya@example.com / password123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
