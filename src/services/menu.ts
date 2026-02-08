import type { Category, Product } from "@/types";
import { supabase } from "@/lib/supabase";

export async function getMenu(): Promise<Category[]> {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (catError) {
    throw new Error(`Failed to fetch categories: ${catError.message}`);
  }

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true);

  if (prodError) {
    throw new Error(`Failed to fetch products: ${prodError.message}`);
  }

  const result: Category[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    sort_order: cat.sort_order,
    products: (products ?? [])
      .filter((p) => p.category_id === cat.id)
      .map(
        (p): Product => ({
          id: p.id,
          category_id: p.category_id,
          name: p.name,
          description: p.description,
          base_price: p.base_price,
          image_url: p.image_url ?? null,
          is_available: p.is_available,
          dietary_tags: p.dietary_tags ?? [],
        })
      ),
  }));

  return result;
}
