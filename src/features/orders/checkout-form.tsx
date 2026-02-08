"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useOrderStore } from "@/store/orders";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FulfillmentType } from "@/types";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const submitOrder = useOrderStore((s) => s.submitOrder);

  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNotes, setAddressNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (!phone.trim()) {
      setError("Telefono numeris privalomas.");
      return;
    }
    if (fulfillment === "delivery" && !street.trim()) {
      setError("Pristatymo adresas privalomas.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const orderId = await submitOrder({
        items,
        fulfillmentType: fulfillment,
        deliveryAddress:
          fulfillment === "delivery"
            ? { street, city, postal_code: postalCode, notes: addressNotes }
            : null,
        contactPhone: phone,
        notes,
        totalAmount: getTotal(),
      });

      clearCart();
      router.push(`/tracking?id=${orderId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepavyko pateikti užsakymo."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fulfillment type */}
      <div>
        <h2 className="mb-2 font-semibold text-gray-900">Gavimo būdas</h2>
        <div className="flex gap-2">
          {(["pickup", "delivery"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFulfillment(type)}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                fulfillment === type
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {type === "pickup" ? "Atsiėmimas" : "Pristatymas"}
            </button>
          ))}
        </div>
      </div>

      {/* Contact phone */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Telefono numeris
        </label>
        <Input
          type="tel"
          placeholder="+370 600 00000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Delivery address */}
      {fulfillment === "delivery" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Pristatymo adresas</h2>
          <Input
            placeholder="Gatvė"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Miestas"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Pašto kodas"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-32"
            />
          </div>
          <Input
            placeholder="Pristatymo pastabos (pvz. vartų kodas)"
            value={addressNotes}
            onChange={(e) => setAddressNotes(e.target.value)}
          />
        </div>
      )}

      {/* Order notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Užsakymo pastabos (neprivaloma)
        </label>
        <Textarea
          placeholder="Specialūs pageidavimai..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="space-y-1 text-sm">
          {items.map((item) => (
            <div key={item.cart_key} className="flex justify-between">
              <span>
                {item.quantity}x {item.product_name}
              </span>
              <span>{formatPrice(item.item_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-bold">
          <span>Iš viso</span>
          <span className="text-orange-600">{formatPrice(getTotal())}</span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Pateikiama..." : "Pateikti užsakymą"}
      </Button>
    </form>
  );
}
