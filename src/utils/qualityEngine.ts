import type { HviAnaliz } from '../types/domain';

export interface ParametreAgirlik {
  parametre: string;
  label: string;
  agirlik: number;
}

export const varsayilanAgirliklar: ParametreAgirlik[] = [
  { parametre: 'micronaire', label: 'MIC (Micronaire)', agirlik: 17 },
  { parametre: 'length', label: 'UHML - Lif Uzunluğu', agirlik: 15 },
  { parametre: 'strength', label: 'STR - Mukavemet', agirlik: 13 },
  { parametre: 'uniformity', label: 'UI - Uniformity Index', agirlik: 11 },
  { parametre: 'sfi', label: 'SFI - Kısa Lif Oranı', agirlik: 9 },
  { parametre: 'sci', label: 'SCI - Eğirme Tutarlılığı', agirlik: 8 },
  { parametre: 'colorGrade', label: 'Color Grade - Renk Sınıfı', agirlik: 7 },
  { parametre: 'leafGrade', label: 'Leaf Grade - Yaprak Derecesi', agirlik: 6 },
  { parametre: 'trashArea', label: 'Trash Area - Çöp Alanı', agirlik: 5 },
  { parametre: 'trashCount', label: 'Trash Count - Çöp Sayısı', agirlik: 4 },
  { parametre: 'elongation', label: 'ELG - Uzama', agirlik: 3 },
  { parametre: 'rd', label: 'Rd - Renk Derecesi', agirlik: 1 },
  { parametre: 'plusB', label: '+b - Sarılık', agirlik: 1 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeRange(value: number, min: number, max: number): number {
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function normalizeMicronaire(value: number): number {
  const idealMin = 3.5;
  const idealMax = 4.9;
  const idealMid = (idealMin + idealMax) / 2;
  if (value >= idealMin && value <= idealMax) {
    const distanceFromMid = Math.abs(value - idealMid) / (idealMax - idealMid);
    return clamp(100 - distanceFromMid * 20, 80, 100);
  }
  if (value < idealMin) {
    const distance = idealMin - value;
    return clamp(80 - distance * 50, 0, 80);
  }
  if (value <= 5.5) {
    const distance = value - idealMax;
    return clamp(80 - distance * 30, 40, 80);
  }
  const distance = value - 5.5;
  return clamp(40 - distance * 30, 0, 40);
}

function normalizeUHML(value: number): number {
  if (value < 25) {
    return clamp(((value - 20) / (25 - 20)) * 40, 0, 40);
  }
  if (value < 27) {
    return 40 + ((value - 25) / (27 - 25)) * 20;
  }
  if (value <= 30) {
    return 60 + ((value - 27) / (30 - 27)) * 25;
  }
  return clamp(85 + ((value - 30) / 4) * 15, 85, 100);
}

function normalizeUI(value: number): number {
  if (value < 77) {
    return clamp(((value - 70) / (77 - 70)) * 40, 0, 40);
  }
  if (value < 80) {
    return 40 + ((value - 77) / (80 - 77)) * 20;
  }
  if (value <= 83) {
    return 60 + ((value - 80) / (83 - 80)) * 25;
  }
  return clamp(85 + ((value - 83) / 4) * 15, 85, 100);
}

function normalizeSFI(value: number): number {
  if (value < 7) {
    return clamp(100 - (value / 7) * 15, 85, 100);
  }
  if (value < 10) {
    return 85 - ((value - 7) / (10 - 7)) * 25;
  }
  if (value <= 12) {
    return 60 - ((value - 10) / (12 - 10)) * 20;
  }
  return clamp(40 - ((value - 12) / 4) * 40, 0, 40);
}

function normalizeSTR(value: number): number {
  if (value < 25) {
    return clamp(((value - 20) / (25 - 20)) * 40, 0, 40);
  }
  if (value < 28) {
    return 40 + ((value - 25) / (28 - 25)) * 20;
  }
  if (value <= 31) {
    return 60 + ((value - 28) / (31 - 28)) * 25;
  }
  return clamp(85 + ((value - 31) / 4) * 15, 85, 100);
}

function normalizeELG(value: number): number {
  const idealMin = 5;
  const idealMax = 8;
  if (value >= idealMin && value <= idealMax) {
    const idealMid = (idealMin + idealMax) / 2;
    const distanceFromMid = Math.abs(value - idealMid) / (idealMax - idealMid);
    return clamp(100 - distanceFromMid * 20, 80, 100);
  }
  const distance = value < idealMin ? idealMin - value : value - idealMax;
  return clamp(80 - distance * 25, 0, 80);
}

export function calculateQualityScore(hvi: HviAnaliz, weights: ParametreAgirlik[]): number {
  const agirlikMap = new Map(weights.map((w) => [w.parametre, w.agirlik]));

  const skorlar: Record<string, number> = {
    micronaire: normalizeMicronaire(hvi.micronaire),
    length: normalizeUHML(hvi.length),
    strength: normalizeSTR(hvi.strength),
    uniformity: normalizeUI(hvi.uniformity),
    sfi: normalizeSFI(hvi.sfi),
    sci: normalizeRange(hvi.sci, 90, 180),
    colorGrade: 100 - normalizeRange(hvi.colorGrade, 10, 50),
    leafGrade: 100 - normalizeRange(hvi.leafGrade, 1, 7),
    trashArea: 100 - normalizeRange(hvi.trashArea, 0.5, 3),
    trashCount: 100 - normalizeRange(hvi.trashCount, 10, 50),
    elongation: normalizeELG(hvi.elongation),
    rd: normalizeRange(hvi.rd, 60, 85),
    plusB: 100 - normalizeRange(hvi.plusB, 7, 10.5),
  };

  let toplamAgirlik = 0;
  let agirlikliToplam = 0;

  for (const [parametre, skor] of Object.entries(skorlar)) {
    const agirlik = agirlikMap.get(parametre) ?? 0;
    toplamAgirlik += agirlik;
    agirlikliToplam += skor * agirlik;
  }

  if (toplamAgirlik === 0) return 0;

  return Math.round(agirlikliToplam / toplamAgirlik);
}
