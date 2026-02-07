import { supabase } from "@/lib/supabase";
import type { Category, Product, ModifierGroup, ModifierOption } from "@/types";

export async function fetchMenu(): Promise<Category[]> {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (catError) throw catError;

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("name");

  if (prodError) throw prodError;

  const { data: modifierGroups, error: mgError } = await supabase
    .from("modifier_groups")
    .select("*")
    .order("sort_order");

  if (mgError) throw mgError;

  const { data: modifierOptions, error: moError } = await supabase
    .from("modifier_options")
    .select("*")
    .order("sort_order");

  if (moError) throw moError;

  // Build nested structure
  const optionsByGroup = new Map<string, ModifierOption[]>();
  for (const opt of modifierOptions ?? []) {
    const list = optionsByGroup.get(opt.group_id) ?? [];
    list.push({
      id: opt.id,
      name: opt.name,
      price_mod: opt.price_mod,
    });
    optionsByGroup.set(opt.group_id, list);
  }

  const groupsByProduct = new Map<string, ModifierGroup[]>();
  for (const mg of modifierGroups ?? []) {
    const list = groupsByProduct.get(mg.product_id) ?? [];
    list.push({
      id: mg.id,
      name: mg.name,
      min_required: mg.min_required,
      max_allowed: mg.max_allowed,
      options: optionsByGroup.get(mg.id) ?? [],
    });
    groupsByProduct.set(mg.product_id, list);
  }

  const productsByCategory = new Map<string, Product[]>();
  for (const p of products ?? []) {
    const list = productsByCategory.get(p.category_id) ?? [];
    list.push({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      base_price: p.base_price,
      image_url: p.image_url,
      is_available: p.is_available,
      dietary_tags: p.dietary_tags ?? [],
      modifier_groups: groupsByProduct.get(p.id) ?? [],
    });
    productsByCategory.set(p.category_id, list);
  }

  return (categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    sort_order: cat.sort_order,
    products: productsByCategory.get(cat.id) ?? [],
  }));
}
