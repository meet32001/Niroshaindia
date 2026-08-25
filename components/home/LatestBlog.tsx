import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { Title, SubText } from "@/components/ui/text";
import { getLatestBlogs } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

export async function LatestBlog() {
  const blogs = await getLatestBlogs();

  return (
    <section className="space-y-4 pt-4">
      <div>
        <Title>Latest Tech Articles & News</Title>
        <SubText>Stay updated with buying guides, gadget reviews, and industry insights.</SubText>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {blogs.map((blog, index) => {
          const rawSlug = typeof blog.slug === "string" ? blog.slug : blog.slug?.current;
          const slug = rawSlug || "article-details";
          const formattedDate = dayjs(blog.publishedAt || new Date()).format("MMM DD, YYYY");

          let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          if (typeof blog.mainImage === "string") {
            imageUrl = blog.mainImage;
          } else if (blog.mainImage?.asset) {
            try {
              imageUrl = urlFor(blog.mainImage).url();
            } catch {
              imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
            }
          }

          const categories = Array.isArray(blog.categories)
            ? blog.categories
            : Array.isArray(blog.blogCategories)
            ? blog.blogCategories
            : ["Electronics"];

          return (
            <div
              key={blog._id || blog.id || index}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Link href={`/blog/${slug}`} className="block w-full h-full relative">
                  <Image
                    src={imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div className="space-y-2">
                  {/* Meta: Categories & Date */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-shop-orange uppercase tracking-wide line-clamp-1">
                      {categories.slice(0, 2).join(", ")}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3>
                    <Link
                      href={`/blog/${slug}`}
                      className="text-sm md:text-base font-bold text-shop-dark dark:text-slate-100 hover:text-shop-orange line-clamp-2 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/blog/${slug}`}
                    className="text-xs font-semibold text-shop-orange hover:underline inline-flex items-center gap-1"
                  >
                    Read Full Article →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
