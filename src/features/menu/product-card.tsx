"use client";

import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  quantity?: number;
}

export function ProductCard({ product, onAdd, quantity = 0 }: ProductCardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 py-4",
        quantity > 0 && "border-l-4 border-l-blue-500 pl-3"
      )}
    >
      <div className="flex flex-1 flex-col">
        <h3 className="text-base font-bold text-gray-900">
          {quantity > 0 && (
            <span className="text-blue-600">{quantity} × </span>
          )}
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <span className="mt-1.5 block text-sm font-semibold text-orange-600">
          {formatPrice(product.base_price)}
        </span>
        {product.dietary_tags.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {product.dietary_tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "aštrus" ? "spicy" : tag === "vegetariškas" ? "vegetarian" : "default"}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-2">
          <Button size="sm" onClick={() => onAdd(product)}>
            <Plus className="h-4 w-4" />
            Pridėti
          </Button>
        </div>
      </div>
      <div className="h-24 w-24 shrink-0 self-start overflow-hidden rounded-xl bg-gray-100">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
