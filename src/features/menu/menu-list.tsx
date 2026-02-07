"use client";

import { useState } from "react";
import type { Category, Product } from "@/types";
import { getMenu } from "@/services/menu";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCartStore } from "@/store/cart";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories: Category[] = getMenu();

export function MenuList() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd(product: Product) {
    addItem({
      product_id: product.id,
      product_name: product.name,
      base_price: product.base_price,
      item_total: product.base_price,
    });
  }

  const filteredCategories = categories
    .filter((cat) => !activeCategory || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      products: cat.products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.products.length > 0);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Ieškoti meniu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter pills */}
      <CategoryFilter
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Products grouped by category */}
      {filteredCategories.map((cat) => (
        <section key={cat.id}>
          <h2 className="mb-2 text-lg font-bold text-gray-900">{cat.name}</h2>
          <div className="divide-y divide-gray-200">
            {cat.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredCategories.length === 0 && (
        <p className="py-8 text-center text-gray-500">Nieko nerasta.</p>
      )}
    </div>
  );
}
