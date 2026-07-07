import type { Balya, HviAnaliz } from '../types/domain';

export interface KumeSonucu {
  kumeId: string;
  balyaIdler: string[];
  balyaSayisi: number;
  ortalamaUHML: number;
  ortalamaMIC: number;
  ortalamaSTR: number;
  ortalamaUI: number;
  ortalamaSFI: number;
  ortalamaKalite: number | null;
  minKalite: number | null;
  maksKalite: number | null;
}

const TOLERANS = {
  length: 0.5,
  micronaire: 0.2,
  strength: 1,
  uniformity: 1,
  sfi: 1,
};

interface KumelenecekBalya {
  balya: Balya;
  hvi: HviAnaliz;
}

function ayniKumedeMi(aday: KumelenecekBalya, kume: KumelenecekBalya[]): boolean {
  const temsilci = kume[0].hvi;
  return (
    Math.abs(aday.hvi.length - temsilci.length) <= TOLERANS.length &&
    Math.abs(aday.hvi.micronaire - temsilci.micronaire) <= TOLERANS.micronaire &&
    Math.abs(aday.hvi.strength - temsilci.strength) <= TOLERANS.strength &&
    Math.abs(aday.hvi.uniformity - temsilci.uniformity) <= TOLERANS.uniformity &&
    Math.abs(aday.hvi.sfi - temsilci.sfi) <= TOLERANS.sfi
  );
}

function ortalama(degerler: number[]): number {
  return Math.round((degerler.reduce((t, d) => t + d, 0) / degerler.length) * 10) / 10;
}

export function generateClusters(balyalar: Balya[], hviAnalizleri: HviAnaliz[]): KumeSonucu[] {
  const kumelenecekler: KumelenecekBalya[] = balyalar
    .map((balya) => {
      const hvi = hviAnalizleri.find((h) => h.balyaId === balya.balyaId);
      return hvi ? { balya, hvi } : null;
    })
    .filter((item): item is KumelenecekBalya => item !== null)
    .sort((a, b) => a.hvi.length - b.hvi.length);

  const kumeler: KumelenecekBalya[][] = [];

  kumelenecekler.forEach((aday) => {
    const uygunKume = kumeler.find((kume) => ayniKumedeMi(aday, kume));
    if (uygunKume) {
      uygunKume.push(aday);
    } else {
      kumeler.push([aday]);
    }
  });

  return kumeler
    .sort((a, b) => b.length - a.length)
    .map((kume, index) => {
      const skorluBalyalar = kume.filter((item) => item.balya.kaliteSkoru !== null);
      const skorlar = skorluBalyalar.map((item) => item.balya.kaliteSkoru as number);

      return {
        kumeId: `KUME-${String(101 + index)}`,
        balyaIdler: kume.map((item) => item.balya.balyaId),
        balyaSayisi: kume.length,
        ortalamaUHML: ortalama(kume.map((item) => item.hvi.length)),
        ortalamaMIC: ortalama(kume.map((item) => item.hvi.micronaire)),
        ortalamaSTR: ortalama(kume.map((item) => item.hvi.strength)),
        ortalamaUI: ortalama(kume.map((item) => item.hvi.uniformity)),
        ortalamaSFI: ortalama(kume.map((item) => item.hvi.sfi)),
        ortalamaKalite: skorlar.length > 0 ? ortalama(skorlar) : null,
        minKalite: skorlar.length > 0 ? Math.min(...skorlar) : null,
        maksKalite: skorlar.length > 0 ? Math.max(...skorlar) : null,
      };
    });
}
