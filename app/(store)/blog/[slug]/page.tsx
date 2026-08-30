import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Title, SubText } from "@/components/ui/text";
import { getLatestBlogs } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

export interface SingleBlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SingleBlogPage({ params }: SingleBlogPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const blogs = await getLatestBlogs();
  const blog = blogs.find((b) => {
    const raw = typeof b.slug === "string" ? b.slug : b.slug?.current;
    return raw === slug;
  }) || blogs[0];

  const formattedDate = dayjs(blog?.publishedAt || new Date()).format("MMMM DD, YYYY");

  let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  if (typeof blog?.mainImage === "string") {
    imageUrl = blog.mainImage;
  } else if (blog?.mainImage?.asset) {
    try {
      imageUrl = urlFor(blog.mainImage).url();
    } catch {
      imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    }
  }

  return (
    <div className="py-8 md:py-12">
      <Container className="max-w-4xl space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-shop-orange hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <span className="inline-block text-xs font-bold text-shop-orange uppercase tracking-widest bg-shop-orange/10 px-3 py-1 rounded-full">
            {blog?.categories ? blog.categories.join(", ") : "Tech Insights"}
          </span>

          <Title className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {blog?.title || "Article Details"}
          </Title>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-shop-orange" />
              <span>By Nirosha Editorial Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-shop-orange" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <Image
            src={imageUrl}
            alt={blog?.title || "Blog Cover"}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4 text-sm md:text-base leading-relaxed">
          <SubText className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100">
            Consumer electronics are evolving rapidly in 2026, bringing AI-driven noise cancellation, high-efficiency GaN semiconductors, and smart connectivity into everyday devices.
          </SubText>

          <p>
            Whether upgrading your personal workstation or modernizing your home appliances, understanding hardware specifications, energy star ratings, and long-term domestic warranty policies ensures maximum performance and reliability.
          </p>

          <p>
            At Nirosha India, every featured brand and product undergoes strict quality audits before being listed. Explore our catalog or connect with our 24/7 customer support hotline for personalized purchase assistance.
          </p>
        </div>
      </Container>
    </div>
  );
}
