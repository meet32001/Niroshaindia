import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Tag, Calendar, ChevronRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

export interface BlogSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentPosts: any[];
}

export function BlogSidebar({ categories, recentPosts }: BlogSidebarProps) {
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
    <aside className="space-y-8">
      {/* Categories Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-shop-dark dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Tag className="h-4 w-4 text-shop-orange" />
          <span>Blog Categories</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat, idx) => {
            const title = typeof cat === "string" ? cat : cat.title || "Technology";
            return (
              <span
                key={idx}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-shop-orange hover:text-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                {title}
              </span>
            );
          })}
        </div>
      </div>

      {/* Recent Articles Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-shop-dark dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Calendar className="h-4 w-4 text-shop-orange" />
          <span>Recent Articles</span>
        </h3>

        <div className="space-y-4">
          {recentPosts.map((post) => {
            const title = post.title || "Electronics Article";
            const slugStr = post.slug?.current || post.slug || "#";
            const imgUrl = getImageUrl(post.mainImage || post.image);
            const dateFormatted = post.publishedAt
              ? format(new Date(post.publishedAt), "dd MMM yyyy")
              : "Recently Published";

            return (
              <Link
                key={post._id || slugStr}
                href={`/blog/${slugStr}`}
                className="group flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-2xl transition-colors"
              >
                <div className="relative h-14 w-14 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={title}
                    fill
                    sizes="56px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-shop-orange transition-colors line-clamp-2 leading-snug">
                    {title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {dateFormatted}
                  </span>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-shop-orange ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
