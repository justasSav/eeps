"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryFilter({
  categories,
  activeId,
  onSelect,
}: CategoryFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Auto-scroll the active pill into view
  useEffect(() => {
    if (!activeId) return;
    const btn = buttonRefs.current.get(activeId);
    if (btn && containerRef.current) {
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          ref={(el) => {
            if (el) buttonRefs.current.set(cat.id, el);
          }}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeId === cat.id
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
