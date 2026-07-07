export interface ReferansAralik {
  min: number;
  max: number;
}

export interface KademeBant {
  label: string;
  min: number;
  max: number;
}

export const referansAraliklari: Record<string, ReferansAralik> = {
  elongation: { min: 4, max: 8 },
  sci: { min: 90, max: 180 },
  moisture: { min: 6, max: 10 },
  rd: { min: 60, max: 85 },
  plusB: { min: 7, max: 10.5 },
  trashCount: { min: 10, max: 50 },
  trashArea: { min: 0.5, max: 3 },
  maturity: { min: 0.7, max: 0.95 },
  reflectance: { min: 65, max: 82 },
  colorGrade: { min: 10, max: 50 },
  leafGrade: { min: 1, max: 6 },
};

export const kademeBantlari: Record<string, KademeBant[]> = {
  micronaire: [
    { label: 'Çok ince/olgunlaşmamış', min: -Infinity, max: 3.0 },
    { label: 'İdeal', min: 3.5, max: 4.9 },
    { label: 'Kalın', min: 5.0, max: 5.5 },
    { label: 'Çok kalın', min: 5.5, max: Infinity },
  ],
  length: [
    { label: 'Kısa', min: -Infinity, max: 25 },
    { label: 'Orta', min: 25, max: 27 },
    { label: 'İyi', min: 28, max: 30 },
    { label: 'Çok iyi', min: 30, max: Infinity },
  ],
  uniformity: [
    { label: 'Düşük', min: -Infinity, max: 77 },
    { label: 'Orta', min: 77, max: 80 },
    { label: 'İyi', min: 80, max: 83 },
    { label: 'Çok iyi', min: 83, max: Infinity },
  ],
  sfi: [
    { label: 'Çok iyi', min: -Infinity, max: 7 },
    { label: 'İyi', min: 7, max: 10 },
    { label: 'Orta', min: 10, max: 12 },
    { label: 'Düşük kalite', min: 12, max: Infinity },
  ],
  strength: [
    { label: 'Düşük', min: -Infinity, max: 25 },
    { label: 'Orta', min: 25, max: 28 },
    { label: 'İyi', min: 29, max: 31 },
    { label: 'Çok iyi', min: 31, max: Infinity },
  ],
};

export function bantBul(bantlar: KademeBant[], deger: number): KademeBant {
  const eslesen = bantlar.find((bant) => deger >= bant.min && deger <= bant.max);
  if (eslesen) return eslesen;

  let enYakin = bantlar[0];
  let enKucukMesafe = Infinity;
  bantlar.forEach((bant) => {
    const mesafe = deger < bant.min ? bant.min - deger : deger - bant.max;
    if (mesafe < enKucukMesafe) {
      enKucukMesafe = mesafe;
      enYakin = bant;
    }
  });
  return enYakin;
}

export function bantAraligiMetni(bant: KademeBant): string {
  if (bant.min === -Infinity) return `< ${bant.max}`;
  if (bant.max === Infinity) return `> ${bant.min}`;
  return `${bant.min}-${bant.max}`;
}

export function referansAraligiMetni(parametreId: string): string {
  const bantlar = kademeBantlari[parametreId];
  if (bantlar) {
    return bantlar.map((bant) => `${bant.label}: ${bantAraligiMetni(bant)}`).join(' · ');
  }
  const aralik = referansAraliklari[parametreId];
  if (aralik) {
    return `${aralik.min} - ${aralik.max}`;
  }
  return '—';
}
