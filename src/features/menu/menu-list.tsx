"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Category, Product } from "@/types";
import { getMenu } from "@/services/menu";
import { CategoryFilter } from "./category-filter";
import { ProductCard } from "./product-card";
import { useCartStore } from "@/store/cart";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function MenuList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    getMenu()
      .then((data) => {
        setCategories(data);
        setActiveCategory(data[0]?.id ?? null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Nepavyko užkrauti meniu."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function getQuantity(productId: string): number {
    const item = cartItems.find((i) => i.cart_key === productId);
    return item ? item.quantity : 0;
  }
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const visibleSections = useRef<Set<string>>(new Set());
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

    visibleSections.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;

        // Update the set of currently visible sections
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-category-id");
          if (!id) return;
          if (entry.isIntersecting) {
            visibleSections.current.add(id);
          } else {
            visibleSections.current.delete(id);
          }
        });

        // Pick the topmost visible section in menu order
        const topmost = categories.find((c) =>
          visibleSections.current.has(c.id)
        );
        if (topmost) setActiveCategory(topmost.id);
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [searchQuery, categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

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
