import { defineQuery } from "next-sanity";

// Query all featured products
export const ALL_FEATURED_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && isFeatured == true] | order(name asc) {
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    status,
    productType,
    isFeatured,
    description,
    "images": images[].asset->url,
    category->{
      _id,
      title,
      slug
    },
    brand->{
      _id,
      title,
      slug
    }
  }
`);

// Query products by category slug
export const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "product" && category->slug.current == $categorySlug] | order(name asc) {
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    status,
    productType,
    "images": images[].asset->url,
    category->{
      title,
      slug
    }
  }
`);

// Query single product by slug
export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    status,
    productType,
    description,
    "images": images[].asset->url,
    category->{
      title,
      slug
    },
    brand->{
      title,
      slug,
      "logoUrl": image.asset->url
    }
  }
`);

// Query all categories
export const ALL_CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    priceRange,
    isFeatured,
    "imageUrl": image.asset->url
  }
`);

// Query all blogs
export const ALL_BLOGS_QUERY = defineQuery(`
  *[_type == "blog"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    isLatest,
    "mainImageUrl": mainImage.asset->url,
    author->{
      name,
      "avatarUrl": image.asset->url
    }
  }
`);
