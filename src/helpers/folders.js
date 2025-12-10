import { supabase } from "../lib/supabaseClient";
import { slugify } from "./slugify";

export async function getCategoryFolder(categoryId) {
  if (!categoryId) return "general";

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (error || !data) return "general";

  return slugify(data.name); 
}
export async function getSubcategoryFolder(subcategoryId) {
  if (!subcategoryId) return null;

  const { data, error } = await supabase
    .from("subcategories")
    .select("name")
    .eq("id", subcategoryId)
    .single();

  if (error || !data) return null;

  return slugify(data.name);
}
