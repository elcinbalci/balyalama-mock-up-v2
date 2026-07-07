import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import { useData } from '../context/DataContext';
import { currentUser } from '../data/mockUser';
import type { HviAnaliz } from '../types/domain';
import './HviNew.css';

export const hviParametreleri: { id: string; label: string }[] = [
  { id: 'micronaire', label: 'MIC (Micronaire)' },
  { id: 'length', label: 'UHML - Lif Uzunluğu (mm)' },
  { id: 'strength', label: 'STR - Mukavemet (g/tex)' },
  { id: 'uniformity', label: 'UI - Uniformity Index (%)' },
  { id: 'sfi', label: 'SFI - Kısa Lif Oranı (%)' },
  { id: 'sci', label: 'SCI - Eğirme Tutarlılığı' },
  { id: 'colorGrade', label: 'Color Grade - Renk Sınıfı' },
  { id: 'leafGrade', label: 'Leaf Grade - Yaprak Derecesi' },
  { id: 'trashArea', label: 'Trash Area - Çöp Alanı (%)' },
  { id: 'trashCount', label: 'Trash Count - Çöp Sayısı (adet)' },
  { id: 'elongation', label: 'ELG - Uzama (%)' },
  { id: 'rd', label: 'Rd - Renk Derecesi' },
  { id: 'plusB', label: '+b - Sarılık' },
  { id: 'moisture', label: 'Moisture (%) — ikincil' },
  { id: 'maturity', label: 'Maturity — ikincil' },
  { id: 'reflectance', label: 'Reflectance — ikincil' },
];

const rastgeleAraliklar: Record<string, [number, number]> = {
  micronaire: [3.5, 4.9],
  length: [26, 33],
  uniformity: [78, 87],
  strength: [24, 36],
  elongation: [4.5, 7.5],
  sci: [100, 170],
  moisture: [6.5, 9],
  rd: [68, 82],
  plusB: [7.5, 9.5],
  trashCount: [15, 45],
  trashArea: [0.6, 2.5],
  sfi: [5, 7.5],
  maturity: [0.75, 0.92],
  reflectance: [68, 80],
  colorGrade: [15, 45],
  leafGrade: [1.5, 5],
};

function rastgeleDeger(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

type SatirForm = Record<string, string>;
type TabloForm = Record<string, SatirForm>;

const bosSatirForm: SatirForm = hviParametreleri.reduce((acc, param) => {
  acc[param.id] = '';
  return acc;
}, {} as SatirForm);

function HviNew() {
  const navigate = useNavigate();
  const { balyalar, hviTopluEkle } = useData();
  const [mode, setMode] = useState<'manuel' | 'excel'>('manuel');
  const [submitted, setSubmitted] = useState(false);
  const [kayitSayisi, setKayitSayisi] = useState(0);
  const [excelSonuc, setExcelSonuc] = useState<number | null>(null);
  const [tabloForm, setTabloForm] = useState<TabloForm>({});

  const bekleyenBalyalar = balyalar.filter((balya) => balya.durum === 'Analiz Bekleniyor');

  const satirAlanGuncelle = (balyaId: string, paramId: string, deger: string) => {
    setTabloForm((mevcut) => ({
      ...mevcut,
      [balyaId]: {
        ...(mevcut[balyaId] ?? bosSatirForm),
        [paramId]: deger,
      },
    }));
  };

  const handleTabloKaydet = (event: React.FormEvent) => {
    event.preventDefault();

    const analizler: HviAnaliz[] = [];

    bekleyenBalyalar.forEach((balya, index) => {
      const satir = tabloForm[balya.balyaId];
      if (!satir) return;
      const tumAlanlarDolu = hviParametreleri.every((param) => satir[param.id]?.trim() !== '');
      if (!tumAlanlarDolu) return;

      const degerler = hviParametreleri.reduce((acc, param) => {
        acc[param.id] = Number(satir[param.id]);
        return acc;
      }, {} as Record<string, number>);

      analizler.push({
        id: 'HVI-' + Date.now() + '-' + index,
        balyaId: balya.balyaId,
        analizTarihi: new Date().toISOString().slice(0, 10),
        analiziYapan: currentUser.adSoyad,
        girisTipi: 'Manuel',
        micronaire: degerler.micronaire,
        length: degerler.length,
        uniformity: degerler.uniformity,
        strength: degerler.strength,
        elongation: degerler.elongation,
        sci: degerler.sci,
        moisture: degerler.moisture,
        rd: degerler.rd,
        plusB: degerler.plusB,
        trashCount: degerler.trashCount,
        trashArea: degerler.trashArea,
        sfi: degerler.sfi,
        maturity: degerler.maturity,
        reflectance: degerler.reflectance,
        colorGrade: degerler.colorGrade,
        leafGrade: degerler.leafGrade,
        kaliteSkoru: null,
        analizDurumu: 'Tamamlandı',
        aciklama: '',
      });
    });

    if (analizler.length === 0) return;

    hviTopluEkle(analizler);
    setKayitSayisi(analizler.length);
    setSubmitted(true);
    setTabloForm({});
    setTimeout(() => navigate('/hvi-analizleri'), 1200);
  };

  const handleExcelImport = () => {
    const analizler: HviAnaliz[] = bekleyenBalyalar.map((balya, index) => {
      const degerler = hviParametreleri.reduce((acc, param) => {
        const [min, max] = rastgeleAraliklar[param.id];
        acc[param.id] = rastgeleDeger(min, max);
        return acc;
      }, {} as Record<string, number>);

      return {
        id: 'HVI-' + Date.now() + '-' + index,
        balyaId: balya.balyaId,
        analizTarihi: new Date().toISOString().slice(0, 10),
        analiziYapan: currentUser.adSoyad,
        girisTipi: 'Excel',
        micronaire: degerler.micronaire,
        length: degerler.length,
        uniformity: degerler.uniformity,
        strength: degerler.strength,
        elongation: degerler.elongation,
        sci: degerler.sci,
        moisture: degerler.moisture,
        rd: degerler.rd,
        plusB: degerler.plusB,
        trashCount: degerler.trashCount,
        trashArea: degerler.trashArea,
        sfi: degerler.sfi,
        maturity: degerler.maturity,
        reflectance: degerler.reflectance,
        colorGrade: degerler.colorGrade,
        leafGrade: degerler.leafGrade,
        kaliteSkoru: null,
        analizDurumu: 'Tamamlandı',
        aciklama: '',
      };
    });

    if (analizler.length > 0) {
      hviTopluEkle(analizler);
    }
    setExcelSonuc(analizler.length);
  };

  return (
    <AppLayout>
    <div className="hvi-new-page">
      <AppHeader title="Yeni HVI Analizi" subtitle="Tüm balyalar için manuel giriş yapın veya Excel ile toplu içe aktarın" />

      <main className="hvi-new-content">
        <Link className="back-link" to="/hvi-analizleri">
          ← HVI listesine dön
        </Link>

        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'manuel' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('manuel')}
          >
            Manuel Giriş
          </button>
          <button
            type="button"
            className={mode === 'excel' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('excel')}
          >
            Excel ile İçe Aktar
          </button>
        </div>

        {mode === 'manuel' && (
          <>
            {bekleyenBalyalar.length === 0 && (
              <div className="hvi-new-card">
                <p>Analiz bekleyen balya bulunmuyor.</p>
              </div>
            )}

            {bekleyenBalyalar.length > 0 && (
              <form className="hvi-tablo-card" onSubmit={handleTabloKaydet}>
                <div className="hvi-tablo-header">
                  <h3>Analiz Bekleyen Balyalar</h3>
                  <span className="hvi-tablo-count">{bekleyenBalyalar.length} balya</span>
                </div>

                <div className="hvi-tablo-scroll">
                  <table className="hvi-tablo">
                    <thead>
                      <tr>
                        <th className="sticky-col">Balya ID</th>
                        {hviParametreleri.map((param) => (
                          <th key={param.id}>{param.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bekleyenBalyalar.map((balya) => (
                        <tr key={balya.balyaId}>
                          <td className="sticky-col">
                            <span className="satir-balya-id">{balya.balyaId}</span>
                          </td>
                          {hviParametreleri.map((param) => (
                            <td key={param.id}>
                              <input
                                type="number"
                                step="0.01"
                                value={tabloForm[balya.balyaId]?.[param.id] ?? ''}
                                onChange={(event) =>
                                  satirAlanGuncelle(balya.balyaId, param.id, event.target.value)
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="form-actions">
                  <Link to="/hvi-analizleri" className="cancel-btn">
                    Vazgeç
                  </Link>
                  <button type="submit" className="submit-btn">
                    Tümünü Kaydet
                  </button>
                </div>

                {submitted && (
                  <p className="success-msg">
                    {kayitSayisi} balya için HVI verisi kaydedildi, durumları 'Analiz Gerçekleşti' olarak güncellendi.
                  </p>
                )}
              </form>
            )}
          </>
        )}

        {mode === 'excel' && (
          <div className="hvi-new-card">
            <div className="excel-steps">
              <div className="excel-step">
                <div className="excel-step-number">1</div>
                <div className="excel-step-label">Excel Yükle</div>
              </div>
              <div className="excel-step-line" />
              <div className="excel-step">
                <div className="excel-step-number">2</div>
                <div className="excel-step-label">Kolon Eşleştir</div>
              </div>
              <div className="excel-step-line" />
              <div className="excel-step">
                <div className="excel-step-number">3</div>
                <div className="excel-step-label">Önizleme</div>
              </div>
              <div className="excel-step-line" />
              <div className="excel-step">
                <div className="excel-step-number">4</div>
                <div className="excel-step-label">İçe Aktar</div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="excelFile">Excel Dosyası Seç</label>
              <input id="excelFile" type="file" accept=".xlsx,.xls,.csv" />
            </div>

            <p className="excel-hint">
              İçe Aktar butonuna basıldığında "Analiz Bekleniyor" durumundaki tüm balyalara ({bekleyenBalyalar.length} balya) otomatik gerçekçi HVI değerleri atanacaktır.
            </p>

            <div className="form-actions">
              <button
                type="button"
                className="submit-btn"
                onClick={handleExcelImport}
                disabled={bekleyenBalyalar.length === 0}
              >
                İçe Aktar
              </button>
            </div>

            {excelSonuc !== null && (
              <p className="success-msg">{excelSonuc} kayıt başarıyla işlendi.</p>
            )}
          </div>
        )}
      </main>
    </div>
    </AppLayout>
  );
}

export default HviNew;
