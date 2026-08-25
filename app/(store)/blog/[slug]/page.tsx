import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { Calendar, ArrowLeft, Tag, Share2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { getSingleBlog, getBlogCategories, getOtherBlogs } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

const ptComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="text-2xl md:text-3xl font-extrabold text-shop-dark dark:text-slate-100 my-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl md:text-2xl font-bold text-shop-dark dark:text-slate-100 my-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-shop-dark dark:text-slate-100 my-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-shop-orange pl-4 italic text-slate-600 dark:text-slate-300 my-4 bg-shop-orange/5 p-3 rounded-r-xl">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 my-3">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside text-sm md:text-base space-y-1.5 my-3 text-slate-700 dark:text-slate-300">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside text-sm md:text-base space-y-1.5 my-3 text-slate-700 dark:text-slate-300">{children}</ol>,
  },
};

export default async function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = await params;
  const blog = await getSingleBlog(slug);

  if (!blog) {
    notFound();
  }

  const [categories, otherBlogs] = await Promise.all([
    getBlogCategories(),
    getOtherBlogs(slug),
  ]);

  const getImageUrl = (img: unknown) => {
    if (!img) return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80";
    if (typeof img === "string") return img;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((img as any)?.asset) {
      try {
        return urlFor(img).url();
      } catch {
        return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80";
      }
    }
    return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80";
  };

  const heroImgUrl = getImageUrl(blog.mainImage || blog.image);
  const authorImgUrl = getImageUrl(blog.author?.image);
  const title = blog.title || "Electronics Article";
  const dateFormatted = blog.publishedAt || blog.publishedDate
    ? format(new Date(blog.publishedAt || blog.publishedDate), "dd MMMM yyyy")
    : "25 August 2026";

  const categoryName = Array.isArray(blog.blogCategories)
    ? blog.blogCategories[0]
    : typeof blog.blogCategories === "string"
    ? blog.blogCategories
    : "Gadgets";

  return (
    <div className="py-8 md:py-12 pb-24 md:pb-12">
      <Container>
        <div className="space-y-6">
          {/* Back Navigation Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-shop-orange transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog Catalog</span>
          </Link>

          {/* Main 2-Column Article & Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2-Column: Article Details */}
            <article className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              {/* Hero Image */}
              <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={heroImgUrl}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-shop-orange/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{categoryName}</span>
                </div>
              </div>

              {/* Title & Metadata Header */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h1 className="text-2xl md:text-4xl font-extrabold text-shop-dark dark:text-slate-100 leading-tight">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  {/* Author Block */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={authorImgUrl}
                        alt={blog.author?.name || "Author"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {blog.author?.name || "Nirosha Tech Team"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{dateFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 hover:text-shop-orange cursor-pointer">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intro / Excerpt */}
              {blog.intro && (
                <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  {blog.intro}
                </p>
              )}

              {/* Portable Text Body */}
              <div className="prose dark:prose-invert max-w-none">
                {Array.isArray(blog.body) ? (
                  <PortableText value={blog.body} components={ptComponents} />
                ) : (
                  <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {typeof blog.body === "string"
                      ? blog.body
                      : "Welcome to Nirosha India's in-depth electronics blog guide. In this article, we dive into performance features, battery longevity, camera capabilities, and overall value propositions to help you choose the best electronics."}
                  </p>
                )}
              </div>
            </article>

            {/* Right 1-Column: Sidebar */}
            <div className="lg:col-span-1">
              <BlogSidebar categories={categories} recentPosts={otherBlogs} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
