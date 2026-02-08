"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Category, Product } from "@/types";
import { getMenu } from "@/services/menu";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCartStore } from "@/store/cart";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories: Category[] = getMenu();

export function MenuList() {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  function getQuantity(productId: string): number {
    const item = cartItems.find((i) => i.cart_key === productId);
    return item ? item.quantity : 0;
  }
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingTo = useRef(false);

  function handleAdd(product: Product) {
    addItem({
      product_id: product.id,
      product_name: product.name,
      base_price: product.base_price,
      item_total: product.base_price,
    });
  }

  // Scroll to a category section when a pill is clicked
  const scrollToCategory = useCallback((categoryId: string) => {
    const el = sectionRefs.current.get(categoryId);
    if (!el) return;

    isScrollingTo.current = true;
    setActiveCategory(categoryId);

    // Offset for navbar (56px) + sticky category bar (~52px)
    const offset = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });

    // Reset the scrolling flag after animation completes
    setTimeout(() => {
      isScrollingTo.current = false;
    }, 800);
  }, []);

  // Track which category is currently in view using IntersectionObserver
  useEffect(() => {
    const sections = Array.from(sectionRefs.current.entries());
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;

        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setActiveCategory(id);
        }
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [searchQuery]);

  const filteredCategories = categories
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

      {/* Sticky category navigation */}
      <div className="sticky top-14 z-40 -mx-4 bg-gray-50 px-4 py-2">
        <CategoryFilter
          categories={categories}
          activeId={activeCategory}
          onSelect={scrollToCategory}
        />
      </div>

      {/* Products grouped by category */}
      {filteredCategories.map((cat) => (
        <section
          key={cat.id}
          data-category-id={cat.id}
          ref={(el) => {
            if (el) sectionRefs.current.set(cat.id, el);
          }}
        >
          <h2 className="mb-2 text-lg font-bold text-gray-900">{cat.name}</h2>
          <div className="divide-y divide-gray-200">
            {cat.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAdd}
                quantity={getQuantity(product.id)}
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
