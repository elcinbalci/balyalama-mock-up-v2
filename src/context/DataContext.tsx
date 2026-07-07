import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Balya,
  HareketGecmisi,
  HviAnaliz,
  Lot,
  OnSerimPlani,
  OnSerimPlanTipi,
  SerimDetaySatiri,
  SerimPlani,
} from '../types/domain';
import { mockLots } from '../data/mockLots';
import { mockBalyalar } from '../data/mockBalyalar';
import { mockHviAnalizleri } from '../data/mockHviAnalizleri';
import { mockHareketGecmisi } from '../data/mockHareketGecmisi';
import { mockOnSerimPlanlari } from '../data/mockOnSerimPlanlari';
import { mockSerimPlanlari } from '../data/mockSerimPlanlari';
import { currentUser } from '../data/mockUser';
import { calculateQualityScore } from '../utils/qualityEngine';
import type { ParametreAgirlik } from '../utils/qualityEngine';
import { generateClusters } from '../utils/clustering';
import type { KumeSonucu } from '../utils/clustering';

interface DataContextValue {
  lots: Lot[];
  balyalar: Balya[];
  hviAnalizleri: HviAnaliz[];
  hareketGecmisi: HareketGecmisi[];
  onSerimPlanlari: OnSerimPlani[];
  serimPlanlari: SerimPlani[];
  lotVeBalyalarEkle: (lot: Lot, balyalar: Balya[]) => void;
  hviAnalizEkle: (analiz: HviAnaliz) => void;
  hviTopluEkle: (analizler: HviAnaliz[]) => void;
  kaliteSkoruHesapla: (balyaIdler: string[], agirliklar: ParametreAgirlik[]) => void;
  kumeleriOlustur: () => KumeSonucu[];
  onSerimPlaniOlustur: (params: {
    lotNo: string;
    onSerimAdi: string;
    secilenKumeIdler: string[];
    planTipi: OnSerimPlanTipi;
    balyaSayisi: number;
    aciklama: string;
  }) => { plan: OnSerimPlani | null; hata: string | null };
  serimPlaniOlustur: (params: {
    lotNo: string;
    onSerimIdler: string[];
    x: number;
    y: number;
  }) => { plan: SerimPlani | null; hata: string | null };
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([...mockLots]);
  const [balyalar, setBalyalar] = useState<Balya[]>([...mockBalyalar]);
  const [hviAnalizleri, setHviAnalizleri] = useState<HviAnaliz[]>([...mockHviAnalizleri]);
  const [hareketGecmisi, setHareketGecmisi] = useState<HareketGecmisi[]>([...mockHareketGecmisi]);
  const [onSerimPlanlari, setOnSerimPlanlari] = useState<OnSerimPlani[]>([...mockOnSerimPlanlari]);
  const [serimPlanlari, setSerimPlanlari] = useState<SerimPlani[]>([...mockSerimPlanlari]);

  const lotVeBalyalarEkle = (lot: Lot, yeniBalyalar: Balya[]) => {
    setLots((mevcut) => [...mevcut, lot]);
    setBalyalar((mevcut) => [...mevcut, ...yeniBalyalar]);
  };

  const hviTopluEkle = (analizler: HviAnaliz[]) => {
    if (analizler.length === 0) return;

    setHviAnalizleri((mevcut) => [...mevcut, ...analizler]);

    const balyaIdSeti = new Set(analizler.map((analiz) => analiz.balyaId));

    setBalyalar((mevcut) =>
      mevcut.map((balya) =>
        balyaIdSeti.has(balya.balyaId) ? { ...balya, durum: 'Analiz Gerçekleşti' } : balya
      )
    );

    const yeniKayitlar: HareketGecmisi[] = analizler.map((analiz, index) => {
      const ilgiliBalya = balyalar.find((balya) => balya.balyaId === analiz.balyaId);
      const saat = new Date().toTimeString().slice(0, 5);
      return {
        id: 'HRK-' + Date.now() + '-' + index,
        tarih: analiz.analizTarihi + ' ' + saat,
        balyaId: analiz.balyaId,
        lotNo: ilgiliBalya?.lotNo ?? '',
        islem: 'HVI Analizi',
        eskiDurum: ilgiliBalya?.durum ?? 'Analiz Bekleniyor',
        yeniDurum: 'Analiz Gerçekleşti',
        kullanici: analiz.analiziYapan,
        aciklama: 'HVI verileri ' + analiz.girisTipi + ' yöntemiyle kaydedildi.',
      };
    });

    setHareketGecmisi((mevcut) => [...mevcut, ...yeniKayitlar]);
  };

  const hviAnalizEkle = (analiz: HviAnaliz) => {
    hviTopluEkle([analiz]);
  };

  const kaliteSkoruHesapla = (balyaIdler: string[], agirliklar: ParametreAgirlik[]) => {
    const hedefBalyalar = balyalar.filter((balya) =>
      balyaIdler.length > 0
        ? balyaIdler.includes(balya.balyaId)
        : balya.durum === 'Analiz Gerçekleşti'
    );

    const skorMap = new Map<string, number>();

    hedefBalyalar.forEach((balya) => {
      const hvi = hviAnalizleri.find((analiz) => analiz.balyaId === balya.balyaId);
      if (!hvi) return;
      const skor = calculateQualityScore(hvi, agirliklar);
      skorMap.set(balya.balyaId, skor);
    });

    if (skorMap.size === 0) return;

    setBalyalar((mevcut) =>
      mevcut.map((balya) =>
        skorMap.has(balya.balyaId)
          ? { ...balya, kaliteSkoru: skorMap.get(balya.balyaId)!, durum: 'Kalite Hesaplandı' }
          : balya
      )
    );

    setHviAnalizleri((mevcut) =>
      mevcut.map((analiz) =>
        skorMap.has(analiz.balyaId)
          ? { ...analiz, kaliteSkoru: skorMap.get(analiz.balyaId)! }
          : analiz
      )
    );

    const saat = new Date().toTimeString().slice(0, 5);
    const bugun = new Date().toISOString().slice(0, 10);
    const yeniKayitlar: HareketGecmisi[] = Array.from(skorMap.entries()).map(([balyaId, skor], index) => {
      const ilgiliBalya = balyalar.find((balya) => balya.balyaId === balyaId);
      return {
        id: 'HRK-' + Date.now() + '-' + index,
        tarih: bugun + ' ' + saat,
        balyaId,
        lotNo: ilgiliBalya?.lotNo ?? '',
        islem: 'Kalite Hesaplandı',
        eskiDurum: 'Analiz Gerçekleşti',
        yeniDurum: 'Kalite Hesaplandı',
        kullanici: 'Sistem',
        aciklama: 'Kalite skoru ' + skor + ' olarak hesaplandı.',
      };
    });

    setHareketGecmisi((mevcut) => [...mevcut, ...yeniKayitlar]);
  };

  const kumeleriOlustur = (): KumeSonucu[] => {
    const kumelenecekBalyalar = balyalar.filter(
      (balya) => balya.kumeId === null && hviAnalizleri.some((h) => h.balyaId === balya.balyaId)
    );

    if (kumelenecekBalyalar.length === 0) return [];

    const sonuclar = generateClusters(kumelenecekBalyalar, hviAnalizleri);

    const balyaKumeMap = new Map<string, string>();
    sonuclar.forEach((kume) => {
      kume.balyaIdler.forEach((balyaId) => balyaKumeMap.set(balyaId, kume.kumeId));
    });

    setBalyalar((mevcut) =>
      mevcut.map((balya) =>
        balyaKumeMap.has(balya.balyaId)
          ? { ...balya, kumeId: balyaKumeMap.get(balya.balyaId)!, durum: 'Kümelendi' }
          : balya
      )
    );

    const saat = new Date().toTimeString().slice(0, 5);
    const bugun = new Date().toISOString().slice(0, 10);
    const yeniKayitlar: HareketGecmisi[] = Array.from(balyaKumeMap.entries()).map(
      ([balyaId, kumeId], index) => {
        const ilgiliBalya = balyalar.find((balya) => balya.balyaId === balyaId);
        return {
          id: 'HRK-' + Date.now() + '-' + index,
          tarih: bugun + ' ' + saat,
          balyaId,
          lotNo: ilgiliBalya?.lotNo ?? '',
          islem: 'Kümelendi',
          eskiDurum: ilgiliBalya?.durum ?? 'Analiz Gerçekleşti',
          yeniDurum: 'Kümelendi',
          kullanici: 'Sistem',
          aciklama: kumeId + ' kümesine HVI parametrelerine göre atandı.',
        };
      }
    );

    setHareketGecmisi((mevcut) => [...mevcut, ...yeniKayitlar]);

    return sonuclar;
  };

  const onSerimPlaniOlustur = ({
    lotNo,
    onSerimAdi,
    secilenKumeIdler,
    planTipi,
    balyaSayisi,
    aciklama,
  }: {
    lotNo: string;
    onSerimAdi: string;
    secilenKumeIdler: string[];
    planTipi: OnSerimPlanTipi;
    balyaSayisi: number;
    aciklama: string;
  }): { plan: OnSerimPlani | null; hata: string | null } => {
    if (secilenKumeIdler.length === 0) {
      return { plan: null, hata: 'En az bir küme seçmelisiniz.' };
    }

    const kumeSeti = new Set(secilenKumeIdler);
    const uygunBalyalar = balyalar.filter(
      (balya) =>
        balya.lotNo === lotNo &&
        balya.kumeId !== null &&
        kumeSeti.has(balya.kumeId) &&
        balya.onSerimId === null
    );

    if (uygunBalyalar.length < balyaSayisi) {
      return {
        plan: null,
        hata: `Seçilen kümelerde ${uygunBalyalar.length} uygun balya var, ${balyaSayisi} balya için yeterli değil.`,
      };
    }

    const secilenBalyalar = uygunBalyalar.slice(0, balyaSayisi);
    const balyaIdler = secilenBalyalar.map((balya) => balya.balyaId);

    const hviDegerleri = secilenBalyalar
      .map((balya) => hviAnalizleri.find((h) => h.balyaId === balya.balyaId))
      .filter((h): h is HviAnaliz => h !== undefined);

    const hviOrtalama = (secici: (h: HviAnaliz) => number): number | null =>
      hviDegerleri.length > 0
        ? Math.round(
            (hviDegerleri.reduce((toplam, h) => toplam + secici(h), 0) / hviDegerleri.length) * 10
          ) / 10
        : null;

    const mevcutPlanSayisi = onSerimPlanlari.filter((plan) => plan.lotNo === lotNo).length;
    const onSerimId = 'ONS-' + lotNo.slice(-6) + '-' + String(mevcutPlanSayisi + 1).padStart(2, '0');
    const suAn = new Date();
    const bugun = suAn.toISOString().slice(0, 10);
    const saat = suAn.toTimeString().slice(0, 5);

    const yeniPlan: OnSerimPlani = {
      onSerimId,
      lotNo,
      onSerimAdi,
      secilenKumeIdler,
      planTipi,
      balyaIdler,
      ortalamaUHML: hviOrtalama((h) => h.length),
      ortalamaMIC: hviOrtalama((h) => h.micronaire),
      ortalamaSTR: hviOrtalama((h) => h.strength),
      ortalamaUI: hviOrtalama((h) => h.uniformity),
      ortalamaSFI: hviOrtalama((h) => h.sfi),
      olusturmaTarihi: bugun + ' ' + saat,
      olusturanKullanici: currentUser.adSoyad,
      durum: 'Taslak',
      aciklama,
    };

    const balyaIdSeti = new Set(balyaIdler);
    setBalyalar((mevcut) =>
      mevcut.map((balya) =>
        balyaIdSeti.has(balya.balyaId) ? { ...balya, onSerimId, durum: 'Ön Serimde' } : balya
      )
    );

    setOnSerimPlanlari((mevcut) => [...mevcut, yeniPlan]);

    const yeniKayitlar: HareketGecmisi[] = balyaIdler.map((balyaId, index) => ({
      id: 'HRK-' + Date.now() + '-' + index,
      tarih: bugun + ' ' + saat,
      balyaId,
      lotNo,
      islem: 'Ön Serim Planına Eklendi',
      eskiDurum: 'Kümelendi',
      yeniDurum: 'Ön Serimde',
      kullanici: currentUser.adSoyad,
      aciklama: onSerimId + ' ön serim planına (' + balyaSayisi + ' balyalık) eklendi.',
    }));

    setHareketGecmisi((mevcut) => [...mevcut, ...yeniKayitlar]);

    return { plan: yeniPlan, hata: null };
  };

  const serimPlaniOlustur = ({
    lotNo,
    onSerimIdler,
    x,
    y,
  }: {
    lotNo: string;
    onSerimIdler: string[];
    x: number;
    y: number;
  }): { plan: SerimPlani | null; hata: string | null } => {
    if (onSerimIdler.length === 0) {
      return { plan: null, hata: 'En az bir ön serim seçmelisiniz.' };
    }

    const toplamBalya = x * y;
    if (toplamBalya <= 0) {
      return { plan: null, hata: 'X ve Y değerleri geçerli bir toplam balya sayısı üretmeli.' };
    }

    const onSerimSeti = new Set(onSerimIdler);
    const uygunBalyalar = balyalar.filter(
      (balya) =>
        balya.lotNo === lotNo &&
        balya.onSerimId !== null &&
        onSerimSeti.has(balya.onSerimId) &&
        balya.serimId === null
    );

    if (uygunBalyalar.length < toplamBalya) {
      return {
        plan: null,
        hata: `Seçilen ön serimlerde ${uygunBalyalar.length} kullanılabilir balya var, ${toplamBalya} balya (${x}×${y}) için yeterli değil.`,
      };
    }

    const secilenBalyalar = uygunBalyalar.slice(0, toplamBalya);

    const mevcutSerimSayisi = serimPlanlari.filter((plan) => plan.lotNo === lotNo).length;
    const serimId = 'SRM-' + lotNo.slice(-6) + '-' + String(mevcutSerimSayisi + 1).padStart(2, '0');

    const detay: SerimDetaySatiri[] = [];
    let siraNo = 1;
    for (let xPoz = 1; xPoz <= x; xPoz += 1) {
      for (let yPoz = 1; yPoz <= y; yPoz += 1) {
        const balya = secilenBalyalar[siraNo - 1];
        detay.push({
          balyaId: balya.balyaId,
          kumeId: balya.kumeId,
          xPozisyon: xPoz,
          yPozisyon: yPoz,
          siraNo,
        });
        siraNo += 1;
      }
    }

    const suAn = new Date();
    const bugun = suAn.toISOString().slice(0, 10);
    const saat = suAn.toTimeString().slice(0, 5);

    const yeniPlan: SerimPlani = {
      serimId,
      lotNo,
      onSerimIdler,
      x,
      y,
      toplamBalya,
      detay,
      durum: 'Hazır',
      olusturmaTarihi: bugun + ' ' + saat,
      olusturanKullanici: currentUser.adSoyad,
    };

    const balyaIdSeti = new Set(secilenBalyalar.map((balya) => balya.balyaId));
    setBalyalar((mevcut) =>
      mevcut.map((balya) =>
        balyaIdSeti.has(balya.balyaId) ? { ...balya, serimId, durum: 'Kullanıldı' } : balya
      )
    );

    setSerimPlanlari((mevcut) => [...mevcut, yeniPlan]);

    const yeniKayitlar: HareketGecmisi[] = secilenBalyalar.map((balya, index) => ({
      id: 'HRK-' + Date.now() + '-' + index,
      tarih: bugun + ' ' + saat,
      balyaId: balya.balyaId,
      lotNo,
      islem: 'Serim Planına Eklendi',
      eskiDurum: 'Ön Serimde',
      yeniDurum: 'Kullanıldı',
      kullanici: currentUser.adSoyad,
      aciklama: serimId + ' serim planına (' + x + '×' + y + ' düzen) eklendi.',
    }));

    setHareketGecmisi((mevcut) => [...mevcut, ...yeniKayitlar]);

    return { plan: yeniPlan, hata: null };
  };

  return (
    <DataContext.Provider
      value={{
        lots,
        balyalar,
        hviAnalizleri,
        hareketGecmisi,
        onSerimPlanlari,
        serimPlanlari,
        lotVeBalyalarEkle,
        hviAnalizEkle,
        hviTopluEkle,
        kaliteSkoruHesapla,
        kumeleriOlustur,
        onSerimPlaniOlustur,
        serimPlaniOlustur,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData yalnızca DataProvider içinde kullanılabilir.');
  }
  return context;
}
