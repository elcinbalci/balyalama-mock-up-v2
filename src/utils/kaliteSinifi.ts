export interface KaliteSinifBilgi {
  sinif: string;
  label: string;
  color: string;
  dot: string;
}

export const sinifTablosu: { min: number; max: number | null; bilgi: KaliteSinifBilgi }[] = [
  { min: 95, max: 100, bilgi: { sinif: 'A+', label: 'A+ · Premium', color: '#15803d', dot: '#22c55e' } },
  { min: 90, max: 95, bilgi: { sinif: 'A', label: 'A · Yüksek Kalite', color: '#0d9488', dot: '#2dd4bf' } },
  { min: 85, max: 90, bilgi: { sinif: 'B', label: 'B · Standart', color: '#1d4ed8', dot: '#3b82f6' } },
  { min: 80, max: 85, bilgi: { sinif: 'C', label: 'C · Orta Kalite', color: '#b45309', dot: '#f59e0b' } },
  { min: -Infinity, max: null, bilgi: { sinif: 'D', label: 'D · Düşük Kalite', color: '#b91c1c', dot: '#ef4444' } },
];

export function kaliteSinifiBul(skor: number | null): KaliteSinifBilgi | null {
  if (skor === null) return null;
  const eslesen = sinifTablosu.find((satir) => skor >= satir.min);
  return eslesen ? eslesen.bilgi : null;
}

export function sinifAraligiMetni(satir: { min: number; max: number | null }): string {
  if (satir.min === -Infinity) return `< ${satir.max}`;
  return `${satir.min}-${satir.max}`;
}
