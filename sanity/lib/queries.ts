import { client } from "./client";
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_PRODUCTS } from "./mockData";

// GROQ Queries strings
export const getAllProductsQuery = `*[_type == "product" && is_active != false] | order(_createdAt desc) {
  _id,
  name,
  title,
  slug,
  is_active,
  "brand": brand-> {
    _id,
    name,
    title,
    slug,
    logo,
    image,
    description
  },
  "category": category-> {
    _id,
    name,
    title,
    slug,
    description
  },
  description,
  variants[] {
    name,
    sku,
    upc,
    price_cents,
    compare_at_price_cents,
    is_serialized,
    images[] {
      asset-> {
        _id,
        url
      }
    },
    specs[] {
      key,
      value
    }
  },
  price,
  discount,
  stock,
  status,
  productType,
  images
}`;

export const getProductBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  title,
  slug,
  is_active,
  "brand": brand-> {
    _id,
    name,
    title,
    slug,
    logo,
    image,
    description
  },
  "category": category-> {
    _id,
    name,
    title,
    slug,
    description,
    "parent": parent-> {
      _id,
      name,
      title,
      slug
    }
  },
  description,
  variants[] {
    name,
    sku,
    upc,
    price_cents,
    compare_at_price_cents,
    is_serialized,
    images[] {
      asset-> {
        _id,
        url
      }
    },
    specs[] {
      key,
      value
    }
  },
  price,
  discount,
  stock,
  status,
  productType,
  images
}`;

export const getCategoriesWithSubcategoriesQuery = `*[_type == "category" && !defined(parent)] | order(name asc, title asc) {
  _id,
  name,
  title,
  slug,
  description,
  image,
  isFeatured,
  "subcategories": *[_type == "category" && references(^._id)] | order(name asc, title asc) {
    _id,
    name,
    title,
    slug,
    description,
    image
  },
  "productCount": count(*[_type == "product" && references(^._id)])
}`;

// Fetch user orders by Clerk UserId
export async function getMyOrders(userId: string) {
  try {
    if (!userId) return [];
    const query = `*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc) {
      _id,
      orderNumber,
      stripeCheckoutSessionId,
      stripePaymentIntentId,
      clerkUserId,
      customerName,
      customerEmail,
      currency,
      totalPrice,
      status,
      orderDate,
      address,
      products[] {
        _key,
        quantity,
        product-> {
          _id,
          name,
          title,
          slug,
          images,
          image,
          price,
          description
        }
      }
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query, { userId } as any);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

// Fetch categories with inventory count
export async function getCategories(quantity?: number) {
  try {
    const range = quantity ? `[0...${quantity}]` : "";
    const query = `*[_type == "category"] | order(title asc) ${range} {
      _id,
      title,
      name,
      slug,
      description,
      image,
      isFeatured,
      "productCount": count(*[_type == "product" && references(^._id)])
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query);
    if (Array.isArray(data) && data.length > 0) return data;
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  } catch {
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  }
}

// Fetch all brands
export async function getAllBrands() {
  try {
    const query = `*[_type == "brand"] | order(title asc) {
      _id,
      title,
      name,
      slug,
      image,
      logo,
      description
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query);
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_BRANDS;
  } catch {
    return MOCK_BRANDS;
  }
}

// Fetch hot deals products
export async function getDealProducts() {
  try {
    const query = `*[_type == "product" && (status == "hot" || isFeatured == true)] | order(_createdAt desc) {
      _id,
      name,
      title,
      slug,
      images,
      description,
      price,
      discount,
      stock,
      status,
      productType,
      isFeatured,
      "categories": categories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query);
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

// Fetch single product by slug
export async function getProductBySlug(slug: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any>(getProductBySlugQuery, { slug } as any);
    if (data && (data.name || data.title)) return data;
    
    // Local fallback matching requested slug or first mock item
    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match || MOCK_PRODUCTS[0];
  } catch {
    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match || MOCK_PRODUCTS[0];
  }
}

// Fetch products assigned to a category slug
export async function getProductsByCategory(categorySlug: string) {
  try {
    const query = `*[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc) {
      _id,
      name,
      title,
      slug,
      images,
      description,
      price,
      discount,
      stock,
      status,
      productType,
      isFeatured,
      "categories": categories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query, { categorySlug } as any);
    if (Array.isArray(data) && data.length > 0) return data;
    const fallback = MOCK_PRODUCTS.filter((p) =>
      p.category.toLowerCase().includes(categorySlug.toLowerCase()) || true
    );
    return fallback;
  } catch {
    const fallback = MOCK_PRODUCTS.filter((p) =>
      p.category.toLowerCase().includes(categorySlug.toLowerCase()) || true
    );
    return fallback;
  }
}
