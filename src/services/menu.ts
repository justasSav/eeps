import type { Category } from "@/types";
import { hardcodedMenu } from "@/data/menu";

export function getMenu(): Category[] {
  return hardcodedMenu;
}
