/**
 * Converte texto para slug amigável para URLs
 * Remove acentos, converte para minúsculas e substitui espaços por hífens
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decomposição Unicode para separar acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-"); // Remove hífens duplicados
}

/**
 * Converte slug de volta para formato de display
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}