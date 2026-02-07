"use client";

import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      {product.image_url && (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <span className="shrink-0 font-semibold text-orange-600">
              {formatPrice(product.base_price)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
            {product.description}
          </p>
          {product.dietary_tags.length > 0 && (
            <div className="mt-1 flex gap-1">
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
        </div>
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => onAdd(product)}>
            <Plus className="h-4 w-4" />
            Pridėti
          </Button>
        </div>
      </div>
    </div>
  );
}
