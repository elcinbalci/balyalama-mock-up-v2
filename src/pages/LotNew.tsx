import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import QrCodePreview from '../components/QrCodePreview';
import { useData } from '../context/DataContext';
import { currentUser } from '../data/mockUser';
import type { Balya, Lot } from '../types/domain';
import './LotNew.css';

interface LotOzet {
  girisTarihi: string;
  menseiUlke: string;
  lotNumarasi: string;
  balyaAdedi: string;
  birim: string;
}

interface BalyaSatiri {
  sira: number;
  barkod: string;
  qrKod: string;
  anaDepo: string;
  araDepo: string;
  raf: string;
  satir: string;
  kolon: string;
}

const bosOzet: LotOzet = {
  girisTarihi: '',
  menseiUlke: '',
  lotNumarasi: '',
  balyaAdedi: '',
  birim: '',
};

function satirlariOlustur(ozet: LotOzet): BalyaSatiri[] {
  const adet = Number(ozet.balyaAdedi);
  if (!adet || adet <= 0) return [];
  const siraSayisi = Math.min(adet, 5000);
  const lotNo = ozet.lotNumarasi || 'LOT';
  return Array.from({ length: siraSayisi }, (_, index) => {
    const barkod = `${lotNo}-${String(index + 1).padStart(3, '0')}`;
    return {
      sira: index + 1,
      barkod,
      qrKod: barkod,
      anaDepo: '',
      araDepo: '',
      raf: '',
      satir: '',
      kolon: '',
    };
  });
}

function LotNew() {
  const navigate = useNavigate();
  const { lotVeBalyalarEkle } = useData();
  const [ozet, setOzet] = useState<LotOzet>(bosOzet);
  const [satirlar, setSatirlar] = useState<BalyaSatiri[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [qrGosterilenSatir, setQrGosterilenSatir] = useState<BalyaSatiri | null>(null);
  const [eksikAlanUyarisi, setEksikAlanUyarisi] = useState(false);

  const eksikAlanlar = useMemo(() => {
    const eksikler: string[] = [];
    if (ozet.girisTarihi.trim() === '') eksikler.push('Tarih');
    if (ozet.menseiUlke.trim() === '') eksikler.push('Ülke Menşei');
    if (ozet.lotNumarasi.trim() === '') eksikler.push('Lot Numarası');
    if (Number(ozet.balyaAdedi) <= 0) eksikler.push('Balya Adedi');
    if (ozet.birim.trim() === '') eksikler.push('Birim');
    return eksikler;
  }, [ozet]);

  const ozetGecerli = eksikAlanlar.length === 0;

  const alanGuncelle = (alan: keyof LotOzet, deger: string) => {
    setOzet((mevcut) => ({ ...mevcut, [alan]: deger }));
  };

  const satirlariUret = () => {
    if (!ozetGecerli) {
      setEksikAlanUyarisi(true);
      return;
    }
    setEksikAlanUyarisi(false);
    setSatirlar(satirlariOlustur(ozet));
  };

  const handleOzetKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      satirlariUret();
    }
  };

  const satirAlanGuncelle = (
    sira: number,
    alan: keyof Omit<BalyaSatiri, 'sira' | 'barkod'>,
    deger: string
  ) => {
    setSatirlar((mevcut) =>
      mevcut.map((satir) => (satir.sira === sira ? { ...satir, [alan]: deger } : satir))
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const yeniLot: Lot = {
      lotNo: ozet.lotNumarasi,
      girisTarihi: ozet.girisTarihi,
      menseiUlke: ozet.menseiUlke,
      tedarikci: '',
      depo: satirlar[0]?.anaDepo || '',
      balyaSayisi: satirlar.length,
      birim: ozet.birim,
      aciklama: '',
      durum: 'Depoda',
    };

    const yeniBalyalar: Balya[] = satirlar.map((satir) => ({
      balyaId: satir.barkod,
      barkod: satir.barkod,
      qrKod: satir.qrKod,
      lotNo: ozet.lotNumarasi,
      kumeId: null,
      onSerimId: null,
      serimId: null,
      anaDepo: satir.anaDepo,
      araDepo: satir.araDepo || null,
      raf: satir.raf,
      satir: satir.satir,
      kolon: satir.kolon,
      mensei: ozet.menseiUlke,
      uretici: '',
      brutAgirlik: 0,
      netAgirlik: 0,
      birim: ozet.birim,
      kaliteSkoru: null,
      durum: 'Analiz Bekleniyor',
    }));

    lotVeBalyalarEkle(yeniLot, yeniBalyalar);
    setSubmitted(true);
    setTimeout(() => navigate('/lots'), 900);
  };

  return (
    <AppLayout>
      <div className="lot-new-page">
        <AppHeader title="Yeni LOT Oluştur" subtitle="Kamyon geldiğinde yeni bir LOT kaydı oluştur" />

        <main className="lot-new-content">
          <Link className="back-link" to="/lots">
            ← LOT listesine dön
          </Link>

          <div className="lot-ozet-card" onKeyDown={handleOzetKeyDown}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="girisTarihi">Tarih</label>
                <input
                  id="girisTarihi"
                  type="date"
                  value={ozet.girisTarihi}
                  onChange={(event) => alanGuncelle('girisTarihi', event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Oluşturan Kullanıcı</label>
                <input value={currentUser.adSoyad} readOnly disabled />
              </div>

              <div className="form-field">
                <label htmlFor="menseiUlke">Ülke Menşei</label>
                <input
                  id="menseiUlke"
                  placeholder="Örn. Türkiye"
                  value={ozet.menseiUlke}
                  onChange={(event) => alanGuncelle('menseiUlke', event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="lotNumarasi">Lot Numarası</label>
                <input
                  id="lotNumarasi"
                  placeholder="LOT202600150"
                  value={ozet.lotNumarasi}
                  onChange={(event) => alanGuncelle('lotNumarasi', event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="balyaAdedi">Balya Adedi</label>
                <input
                  id="balyaAdedi"
                  type="number"
                  min={1}
                  placeholder="2000"
                  value={ozet.balyaAdedi}
                  onChange={(event) => alanGuncelle('balyaAdedi', event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="birim">Birim</label>
                <select
                  id="birim"
                  required
                  value={ozet.birim}
                  onChange={(event) => alanGuncelle('birim', event.target.value)}
                >
                  <option value="" disabled>
                    Birim seçin
                  </option>
                  <option value="Adet">Adet</option>
                  <option value="Kg">Kg</option>
                  <option value="Ton">Ton</option>
                </select>
              </div>
            </div>

            <div className="ozet-actions">
              <span className="ozet-hint">
                Bilgileri doldurup <kbd>Enter</kbd> tuşuna basın — balya adedi kadar detay satırı otomatik oluşur.
              </span>
              <button type="button" className="submit-btn" onClick={satirlariUret}>
                Satırları Oluştur
              </button>
            </div>

            {eksikAlanUyarisi && !ozetGecerli && (
              <p className="eksik-alan-uyarisi">
                Lütfen şu alanları doldurun: {eksikAlanlar.join(', ')}
              </p>
            )}
          </div>

          {satirlar.length > 0 && (
            <form className="balya-tablo-card" onSubmit={handleSubmit}>
              <div className="balya-tablo-header">
                <h3>Balya Detay Girişi</h3>
                <span className="balya-tablo-count">{satirlar.length} satır</span>
              </div>

              <div className="balya-tablo-scroll">
                <table className="balya-tablo">
                  <thead>
                    <tr>
                      <th className="sticky-col">Sıra</th>
                      <th className="sticky-col-2">Barkod</th>
                      <th>QR Kod</th>
                      <th>Ana Depo</th>
                      <th>Ara Depo</th>
                      <th>Raf</th>
                      <th>Satır</th>
                      <th>Kolon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {satirlar.map((satir) => (
                      <tr key={satir.sira}>
                        <td className="sticky-col">{satir.sira}</td>
                        <td className="sticky-col-2">
                          <span className="satir-barkod">{satir.barkod}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="qr-goster-btn"
                            onClick={() => setQrGosterilenSatir(satir)}
                          >
                            ▦ QR
                          </button>
                        </td>
                        <td>
                          <select
                            value={satir.anaDepo}
                            onChange={(event) => satirAlanGuncelle(satir.sira, 'anaDepo', event.target.value)}
                          >
                            <option value="">Seçin</option>
                            <option value="Depo 1">Depo 1</option>
                            <option value="Depo 2">Depo 2</option>
                            <option value="Depo 3">Depo 3</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={satir.araDepo}
                            onChange={(event) => satirAlanGuncelle(satir.sira, 'araDepo', event.target.value)}
                          >
                            <option value="">—</option>
                            <option value="Ara Depo A">Ara Depo A</option>
                            <option value="Ara Depo B">Ara Depo B</option>
                            <option value="Ara Depo C">Ara Depo C</option>
                          </select>
                        </td>
                        <td>
                          <input
                            value={satir.raf}
                            placeholder="R1"
                            onChange={(event) => satirAlanGuncelle(satir.sira, 'raf', event.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            value={satir.satir}
                            placeholder="S1"
                            onChange={(event) => satirAlanGuncelle(satir.sira, 'satir', event.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            value={satir.kolon}
                            placeholder="K1"
                            onChange={(event) => satirAlanGuncelle(satir.sira, 'kolon', event.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions">
                <Link to="/lots" className="cancel-btn">
                  Vazgeç
                </Link>
                <button type="submit" className="submit-btn">
                  LOT ve Balyaları Kaydet
                </button>
              </div>

              {submitted && (
                <p className="success-msg">
                  LOT ve {satirlar.length} balya oluşturuldu, yönlendiriliyorsunuz…
                </p>
              )}
            </form>
          )}
        </main>

        {qrGosterilenSatir && (
          <div className="qr-modal-backdrop" onClick={() => setQrGosterilenSatir(null)}>
            <div className="qr-modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="qr-modal-header">
                <h3>Balya #{qrGosterilenSatir.sira}</h3>
                <button
                  type="button"
                  className="qr-modal-kapat"
                  onClick={() => setQrGosterilenSatir(null)}
                >
                  ✕
                </button>
              </div>
              <QrCodePreview value={qrGosterilenSatir.qrKod} />
              <span className="satir-barkod">{qrGosterilenSatir.barkod}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default LotNew;
