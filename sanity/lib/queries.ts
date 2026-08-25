import { client } from "./client";
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BLOGS, MOCK_PRODUCTS } from "./mockData";

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

// Fetch all blogs with optional quantity limit
export async function getAllBlogs(quantity: number = 12) {
  try {
    const query = `*[_type == 'blog'] | order(_createdAt desc)[0...$quantity] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      isLatest,
      intro,
      body,
      author-> {
        name,
        image,
        bio
      },
      "blogCategories": blogCategories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query, { quantity } as any);
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_BLOGS;
  } catch {
    return MOCK_BLOGS;
  }
}

// Fetch single blog post by slug
export async function getSingleBlog(slug: string) {
  try {
    const query = `*[_type == 'blog' && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      intro,
      body,
      author-> {
        name,
        image,
        bio
      },
      "blogCategories": blogCategories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any>(query, { slug } as any);
    if (data && data.title) return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = MOCK_BLOGS.find((b: any) => (typeof b.slug === "object" ? b.slug?.current === slug : b.slug === slug));
    return match || MOCK_BLOGS[0];
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = MOCK_BLOGS.find((b: any) => (typeof b.slug === "object" ? b.slug?.current === slug : b.slug === slug));
    return match || MOCK_BLOGS[0];
  }
}

// Fetch all blog categories
export async function getBlogCategories() {
  try {
    const query = `*[_type == 'blogCategory'] {
      _id,
      title,
      slug,
      description
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query);
    if (Array.isArray(data) && data.length > 0) return data;
    return [{ title: "Gadgets" }, { title: "Technology" }, { title: "Buying Guides" }, { title: "Audio" }];
  } catch {
    return [{ title: "Gadgets" }, { title: "Technology" }, { title: "Buying Guides" }, { title: "Audio" }];
  }
}

// Fetch other/related blogs excluding current slug
export async function getOtherBlogs(slug: string) {
  try {
    const query = `*[_type == 'blog' && slug.current != $slug] | order(_createdAt desc)[0...5] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      "blogCategories": blogCategories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any[]>(query, { slug } as any);
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_BLOGS.slice(0, 4);
  } catch {
    return MOCK_BLOGS.slice(0, 4);
  }
}

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

// Fetch single product by slug
export async function getProductBySlug(slug: string) {
  try {
    const query = `*[_type == "product" && slug.current == $slug][0] {
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
      "brand": brand->title,
      "categories": categories[]->title
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await client.fetch<any>(query, { slug } as any);
    if (data && data.name) return data;
    
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
