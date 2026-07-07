import type { HviAnaliz } from '../types/domain';
import { referansAraliklari, kademeBantlari, bantBul } from './referansAraliklari';

export type UygunlukDurum = 'iyi' | 'uyari' | 'ihlal' | 'kritik';

export const uygunlukDurumMeta: Record<UygunlukDurum, { label: string; renk: string }> = {
  iyi: { label: '≤ %2 sapma · İyi', renk: '#0ca30c' },
  uyari: { label: '%2-5 sapma · Uyarı', renk: '#fab219' },
  ihlal: { label: '%5-10 sapma · İhlal', renk: '#ec835a' },
  kritik: { label: '> %10 sapma · Kritik', renk: '#d03b3b' },
};

const IDEAL_BANT_INDEX: Record<string, number> = {
  micronaire: 1,
  length: 3,
  uniformity: 3,
  sfi: 0,
  strength: 3,
};

export function parametreUygunlukDurumu(parametreId: string, deger: number): UygunlukDurum {
  const bantlar = kademeBantlari[parametreId];

  if (bantlar) {
    const idealIndex = IDEAL_BANT_INDEX[parametreId] ?? bantlar.length - 1;
    const bulunanBant = bantBul(bantlar, deger);
    const bulunanIndex = bantlar.indexOf(bulunanBant);
    const uzaklik = Math.abs(bulunanIndex - idealIndex);

    if (uzaklik === 0) return 'iyi';
    if (uzaklik === 1) return 'uyari';
    if (uzaklik === 2) return 'ihlal';
    return 'kritik';
  }

  const aralik = referansAraliklari[parametreId];
  if (!aralik) return 'iyi';

  if (deger >= aralik.min && deger <= aralik.max) return 'iyi';

  const genislik = aralik.max - aralik.min;
  const disaTasma = deger < aralik.min ? aralik.min - deger : deger - aralik.max;
  const oran = genislik > 0 ? disaTasma / genislik : 1;

  if (oran <= 0.05) return 'uyari';
  if (oran <= 0.15) return 'ihlal';
  return 'kritik';
}

export function hviDegerAl(hvi: HviAnaliz, parametreId: string): number {
  return (hvi as unknown as Record<string, number>)[parametreId];
}
