export function slugify(text) {
  return text
    .toString()
    .normalize("NFD") // elimina acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-") // espacios → guiones
    .replace(/[^a-z0-9-]/g, "") // solo letras/numeros
    .replace(/--+/g, "-") // evitar doble guion
    .trim();
}
