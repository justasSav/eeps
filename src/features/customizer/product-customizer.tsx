"use client";

import { useState } from "react";
import type { Product, ModifierGroup, OrderItemModifiers } from "@/types";
import { formatPrice, calculateModifiersCost } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Minus, Plus, Check } from "lucide-react";

interface ProductCustomizerProps {
  product: Product;
  onClose: () => void;
}

export function ProductCustomizer({ product, onClose }: ProductCustomizerProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<OrderItemModifiers>(() => {
    const initial: OrderItemModifiers = {};
    for (const group of product.modifier_groups) {
      if (group.min_required === 1 && group.max_allowed === 1 && group.options.length > 0) {
        initial[group.name] = group.options[0].name;
      } else if (group.max_allowed > 1) {
        initial[group.name] = [] as string[];
      }
    }
    return initial;
  });

  const modifiersCost = calculateModifiersCost(selections, product.modifier_groups);
  const unitPrice = product.base_price + modifiersCost;
  const totalPrice = unitPrice * quantity;

  function handleSingleSelect(groupName: string, optionName: string) {
    setSelections((prev) => ({ ...prev, [groupName]: optionName }));
  }

  function handleMultiToggle(group: ModifierGroup, optionName: string) {
    setSelections((prev) => {
      const current = (prev[group.name] as string[]) || [];
      if (current.includes(optionName)) {
        return { ...prev, [group.name]: current.filter((n) => n !== optionName) };
      }
      if (current.length >= group.max_allowed) return prev;
      return { ...prev, [group.name]: [...current, optionName] };
    });
  }

  function isValid(): boolean {
    for (const group of product.modifier_groups) {
      if (group.min_required > 0) {
        const sel = selections[group.name];
        if (!sel) return false;
        if (Array.isArray(sel) && sel.length < group.min_required) return false;
      }
    }
    return true;
  }

  function handleAddToCart() {
    if (!isValid()) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      base_price: product.base_price,
      modifiers: selections,
      item_total: totalPrice,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Description & tags */}
        <p className="text-sm text-gray-600">{product.description}</p>
        {product.dietary_tags.length > 0 && (
          <div className="mt-2 flex gap-1">
            {product.dietary_tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "spicy" ? "spicy" : tag === "vegetarian" ? "vegetarian" : "default"}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Base price: {formatPrice(product.base_price)}
        </p>

        {/* Modifier groups */}
        <div className="mt-6 space-y-6">
          {product.modifier_groups.map((group) => {
            const isSingle = group.max_allowed === 1;
            const currentMulti = (selections[group.name] as string[]) || [];

            return (
              <div key={group.id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <span className="text-xs text-gray-500">
                    {group.min_required > 0
                      ? `Required${!isSingle ? ` (min ${group.min_required})` : ""}`
                      : `Optional (up to ${group.max_allowed})`}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.options.map((option) => {
                    const isSelected = isSingle
                      ? selections[group.name] === option.name
                      : currentMulti.includes(option.name);

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          isSingle
                            ? handleSingleSelect(group.name, option.name)
                            : handleMultiToggle(group, option.name)
                        }
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={isSelected ? "font-medium text-gray-900" : "text-gray-700"}>
                            {option.name}
                          </span>
                        </div>
                        {option.price_mod > 0 && (
                          <span className="text-xs text-gray-500">
                            +{formatPrice(option.price_mod)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: quantity + add to cart */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="mb-3 flex items-center justify-center gap-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-lg font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={!isValid()}
        >
          Add to Cart — {formatPrice(totalPrice)}
        </Button>
      </div>
    </div>
  );
}
