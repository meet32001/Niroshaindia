import { client } from "./client";
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BLOGS, MOCK_PRODUCTS } from "./mockData";

// Fetch categories with inventory count
export async function getCategories(quantity?: number) {
  try {
    const range = quantity ? `[0...${quantity}]` : "";
    const query = `*[_type == "category"] | order(title asc) ${range} {
      _id,
      title,
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
      slug,
      image,
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

// Fetch latest blog posts
export async function getLatestBlogs() {
  try {
    const query = `*[_type == "blog" && isLatest == true] | order(publishedAt desc) [0...4] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      isLatest,
      "categories": categories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query);
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_BLOGS;
  } catch {
    return MOCK_BLOGS;
  }
}

// Fetch hot deals products
export async function getDealProducts() {
  try {
    const query = `*[_type == "product" && (status == "hot" || isFeatured == true)] | order(_createdAt desc) {
      _id,
      name,
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

// Fetch products assigned to a category slug
export async function getProductsByCategory(categorySlug: string) {
  try {
    const query = `*[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc) {
      _id,
      name,
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
