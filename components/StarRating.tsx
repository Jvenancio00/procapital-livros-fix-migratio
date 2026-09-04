import { Star } from "lucide-react";

export default function StarRating({
  rating,
  reviewCount,
  size = 13,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-accent text-accent" : "text-line"}
            />
          );
        })}
      </div>
      <span className="text-xs text-foreground/50">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && ` (${reviewCount})`}
      </span>
    </div>
  );
}
