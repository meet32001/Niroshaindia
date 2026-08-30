import Link from "next/link";
import { getLatestBlogs } from "@/sanity/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export async function LatestBlog() {
  const blogs = await getLatestBlogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Latest Blog Posts
        </h1>
        <p className="text-sm text-slate-500">
          Stay updated with news, electronics guides, and gadget tips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog._id} className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {blog.publishedAt ? (
                  <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                ) : null}
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                <Link href={`/blog/${blog.slug?.current || blog._id}`} className="hover:text-emerald-600 transition-colors">
                  {blog.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {blog.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
