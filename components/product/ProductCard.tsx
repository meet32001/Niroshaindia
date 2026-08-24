import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { Product } from "@/types";
import { Star, ShoppingCart } from "lucide-react";

export function ProductCard({
  title,
  category,
  price,
  discountPrice,
  rating,
  reviewsCount,
  tag,
}: Product) {
  return (
    <Card className="group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:border-shop-orange/50">
      <CardHeader className="p-0 relative bg-slate-50 dark:bg-slate-900 aspect-square flex items-center justify-center">
        {tag && (
          <Badge className="absolute top-3 left-3 bg-shop-orange text-white hover:bg-shop-orange text-[10px] font-semibold px-2 py-0.5 z-10">
            {tag}
          </Badge>
        )}
        <div className="w-full h-full flex items-center justify-center p-6 text-slate-400 group-hover:scale-105 transition-transform duration-300">
          <span className="text-xs font-medium text-slate-400">Electronics Asset Placeholder</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <span className="text-[11px] font-medium text-shop-orange uppercase tracking-wider">
          {category}
        </span>
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-shop-orange transition-colors">
          {title}
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{rating}</span>
          <span>({reviewsCount})</span>
        </div>

        <PriceFormatter
          amount={price}
          originalAmount={discountPrice}
          className="pt-1"
        />
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button size="sm" className="w-full bg-shop-dark hover:bg-shop-orange text-white gap-2 transition-colors">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
