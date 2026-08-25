import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { getAllBlogs } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

export default async function BlogPage() {
  const blogs = await getAllBlogs(12);

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

  return (
    <div className="py-8 md:py-12 pb-24 md:pb-12">
      <Container>
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-shop-orange/10 text-shop-orange">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <Title className="text-xl md:text-2xl font-extrabold">Tech Insights & Buying Guides</Title>
              <p className="text-xs text-slate-500 font-medium">
                Discover the latest news, product reviews, and tech guides from Nirosha India experts.
              </p>
            </div>
          </div>

          {/* 3-Column Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, idx) => {
              const id = blog._id || blog.slug?.current || blog.slug || `blog-${idx}`;
              const slugStr = blog.slug?.current || blog.slug || "#";
              const title = blog.title || "Latest Electronics Trends";
              const intro = blog.intro || blog.excerpt || "Explore cutting-edge gadgets and tech innovations with our detailed buying guides.";
              const dateFormatted = blog.publishedAt || blog.publishedDate
                ? format(new Date(blog.publishedAt || blog.publishedDate), "dd MMM yyyy")
                : "25 Aug 2026";

              const imgUrl = getImageUrl(blog.mainImage || blog.image);

              const categoryName = Array.isArray(blog.blogCategories)
                ? blog.blogCategories[0]
                : typeof blog.blogCategories === "string"
                ? blog.blogCategories
                : "Gadgets";

              return (
                <article
                  key={id}
                  className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail Image */}
                  <Link href={`/blog/${slugStr}`} className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden block">
                    <Image
                      src={imgUrl}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-shop-orange/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Tag className="h-3 w-3" />
                      <span>{categoryName}</span>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateFormatted}</span>
                      </div>

                      <Link href={`/blog/${slugStr}`}>
                        <h2 className="text-base font-extrabold text-shop-dark dark:text-slate-100 group-hover:text-shop-orange transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h2>
                      </Link>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {intro}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${slugStr}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-shop-orange hover:text-amber-600 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
