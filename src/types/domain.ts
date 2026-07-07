// Tanımlamalar Modülü

export type DepoTuru = 'Depo' | 'Ara Depo' | 'Serim Deposu';

export interface Depo {
  id: string;
  depoAdi: string;
  depoTuru: DepoTuru;
  kod: string;
  aciklama: string;
  aktif: boolean;
  baglıAnaDepoId: string | null;
}

// LOT Yönetimi

export type LotDurum =
  | 'Yeni'
  | 'Depoda'
  | 'Analiz'
  | 'Planlandı'
  | 'Tamamlandı';

export const lotDurumMeta: Record<LotDurum, { label: string; color: string; dot: string }> = {
  Yeni: { label: 'Yeni', color: '#a16207', dot: '#eab308' },
  Depoda: { label: 'Depoda', color: '#1d4ed8', dot: '#3b82f6' },
  Analiz: { label: 'Analiz', color: '#15803d', dot: '#22c55e' },
  Planlandı: { label: 'Planlandı', color: '#7e22ce', dot: '#a855f7' },
  Tamamlandı: { label: 'Tamamlandı', color: '#475569', dot: '#94a3b8' },
};

export interface Lot {
  lotNo: string;
  girisTarihi: string;
  menseiUlke: string;
  tedarikci: string;
  depo: string;
  balyaSayisi: number;
  birim: string;
  aciklama: string;
  durum: LotDurum;
}

// Balya Yönetimi

export type BalyaDurum =
  | 'Yeni'
  | 'Depoda'
  | 'Ara Depoda'
  | 'Analiz Bekleniyor'
  | 'Analiz Gerçekleşti'
  | 'Kalite Hesaplandı'
  | 'Kümelendi'
  | 'Ön Serimde'
  | 'Serimde'
  | 'Kullanıldı'
  | 'Pasif';

export const balyaDurumMeta: Record<BalyaDurum, { label: string; color: string; dot: string }> = {
  Yeni: { label: 'Yeni', color: '#a16207', dot: '#eab308' },
  Depoda: { label: 'Depoda', color: '#1d4ed8', dot: '#3b82f6' },
  'Ara Depoda': { label: 'Ara Depoda', color: '#0369a1', dot: '#38bdf8' },
  'Analiz Bekleniyor': { label: 'Analiz Bekleniyor', color: '#b45309', dot: '#f59e0b' },
  'Analiz Gerçekleşti': { label: 'Analiz Gerçekleşti', color: '#15803d', dot: '#22c55e' },
  'Kalite Hesaplandı': { label: 'Kalite Hesaplandı', color: '#0d9488', dot: '#2dd4bf' },
  Kümelendi: { label: 'Kümelendi', color: '#7e22ce', dot: '#a855f7' },
  'Ön Serimde': { label: 'Ön Serimde', color: '#be185d', dot: '#f472b6' },
  Serimde: { label: 'Serimde', color: '#4338ca', dot: '#818cf8' },
  Kullanıldı: { label: 'Kullanıldı', color: '#475569', dot: '#94a3b8' },
  Pasif: { label: 'Pasif', color: '#71717a', dot: '#a1a1aa' },
};

export interface Balya {
  balyaId: string;
  barkod: string;
  qrKod: string;
  lotNo: string;
  kumeId: string | null;
  onSerimId: string | null;
  serimId: string | null;
  anaDepo: string;
  araDepo: string | null;
  raf: string;
  satir: string;
  kolon: string;
  mensei: string;
  uretici: string;
  brutAgirlik: number;
  netAgirlik: number;
  birim: string;
  kaliteSkoru: number | null;
  durum: BalyaDurum;
}

// HVI Analiz Modülü

export type HviGirisTipi = 'Excel' | 'Manuel';

export interface HviAnaliz {
  id: string;
  balyaId: string;
  analizTarihi: string;
  analiziYapan: string;
  girisTipi: HviGirisTipi;
  micronaire: number;
  length: number;
  uniformity: number;
  strength: number;
  elongation: number;
  sci: number;
  moisture: number;
  rd: number;
  plusB: number;
  trashCount: number;
  trashArea: number;
  sfi: number;
  maturity: number;
  reflectance: number;
  colorGrade: number;
  leafGrade: number;
  kaliteSkoru: number | null;
  analizDurumu: 'Tamamlandı' | 'Beklemede' | 'Hatalı';
  aciklama: string;
}

// Ön Serim Planları

export type OnSerimPlanTipi = 140 | 180 | 200 | 'Özel';

export type OnSerimDurum = 'Taslak' | 'Hazır' | 'Üretimde' | 'Tamamlandı' | 'İptal';

export const onSerimDurumMeta: Record<OnSerimDurum, { label: string; color: string; dot: string }> = {
  Taslak: { label: 'Taslak', color: '#71717a', dot: '#a1a1aa' },
  Hazır: { label: 'Hazır', color: '#1d4ed8', dot: '#3b82f6' },
  Üretimde: { label: 'Üretimde', color: '#be185d', dot: '#f472b6' },
  Tamamlandı: { label: 'Tamamlandı', color: '#15803d', dot: '#22c55e' },
  İptal: { label: 'İptal', color: '#b91c1c', dot: '#ef4444' },
};

export interface OnSerimPlani {
  onSerimId: string;
  lotNo: string;
  onSerimAdi: string;
  secilenKumeIdler: string[];
  planTipi: OnSerimPlanTipi;
  balyaIdler: string[];
  ortalamaUHML: number | null;
  ortalamaMIC: number | null;
  ortalamaSTR: number | null;
  ortalamaUI: number | null;
  ortalamaSFI: number | null;
  olusturmaTarihi: string;
  olusturanKullanici: string;
  durum: OnSerimDurum;
  aciklama: string;
}

// Serim Planları

export type SerimDurum = 'Hazır' | 'Üretimde' | 'Tamamlandı';

export const serimDurumMeta: Record<SerimDurum, { label: string; color: string; dot: string }> = {
  Hazır: { label: 'Hazır', color: '#1d4ed8', dot: '#3b82f6' },
  Üretimde: { label: 'Üretimde', color: '#be185d', dot: '#f472b6' },
  Tamamlandı: { label: 'Tamamlandı', color: '#15803d', dot: '#22c55e' },
};

export interface SerimDetaySatiri {
  balyaId: string;
  kumeId: string | null;
  xPozisyon: number;
  yPozisyon: number;
  siraNo: number;
}

export interface SerimPlani {
  serimId: string;
  lotNo: string;
  onSerimIdler: string[];
  x: number;
  y: number;
  toplamBalya: number;
  detay: SerimDetaySatiri[];
  durum: SerimDurum;
  olusturmaTarihi: string;
  olusturanKullanici: string;
}

// Barkod / Etiket Modülü

export interface BarkodEtiket {
  id: string;
  barkodNo: string;
  qrKod: string;
  basimTarihi: string;
  basanKullanici: string;
  balyaId: string;
}

// Hareket Geçmişi

export interface HareketGecmisi {
  id: string;
  tarih: string;
  balyaId: string;
  lotNo: string;
  islem: string;
  eskiDurum: string;
  yeniDurum: string;
  kullanici: string;
  aciklama: string;
}
