// Students store their display preference as "Texto", "Pictograma",
// "Imagenes reales" or "Por defecto" (sometimes as an array or a joined string).
// Normalise it to one of: 'texto' | 'pictograma' | 'real'.
export function getViewMode(preferenciasVista) {
  const raw = Array.isArray(preferenciasVista) ? preferenciasVista[0] : preferenciasVista;
  const value = String(raw || '').split(',')[0].trim().toLowerCase();
  if (value === 'texto') return 'texto';
  if (value.startsWith('imagenes reales') || value.startsWith('imágenes reales')) return 'real';
  return 'pictograma';
}
