// src/utils/slugify.js
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Separar acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Mantener letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-') // Eliminar múltiples guiones
    .replace(/^-+/, '') // Eliminar guiones al inicio
    .replace(/-+$/, ''); // Eliminar guiones al final
};
