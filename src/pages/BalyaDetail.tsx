import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import AgirlikPaneli from '../components/AgirlikPaneli';
import HareketTimeline from '../components/HareketTimeline';
import QrCodePreview from '../components/QrCodePreview';
import ReferansAraliklariModal from '../components/ReferansAraliklariModal';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import { currentUser } from '../data/mockUser';
import { hviParametreleri } from './HviNew';
import type { HviAnaliz } from '../types/domain';
import { balyaDurumMeta } from '../types/domain';
import type { ParametreAgirlik } from '../utils/qualityEngine';
import { kaliteSinifiBul } from '../utils/kaliteSinifi';
import { referansAraliklari, kademeBantlari, bantAraligiMetni, bantBul } from '../utils/referansAraliklari';
import './BalyaDetail.css';

type HviFormState = Record<string, string>;

const bosForm: HviFormState = hviParametreleri.reduce((acc, param) => {
  acc[param.id] = '';
  return acc;
}, {} as HviFormState);

function BalyaDetail() {
  const { balyaId } = useParams<{ balyaId: string }>();
  const { balyalar, hviAnalizleri, hareketGecmisi, hviTopluEkle, kaliteSkoruHesapla } = useData();
  const balya = balyalar.find((item) => item.balyaId === balyaId);
  const hareketler = hareketGecmisi
    .filter((kayit) => kayit.balyaId === balyaId)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));

  const [yenidenGir, setYenidenGir] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<HviFormState>(bosForm);
  const [kalitePaneliAcik, setKalitePaneliAcik] = useState(false);
  const [referansModalAcik, setReferansModalAcik] = useState(false);

  const mevcutAnaliz = hviAnalizleri.find((analiz) => analiz.balyaId === balyaId);

  if (!balya) {
    return (
      <AppLayout>
      <div className="balya-detail-page">
        <AppHeader title="Balya Bulunamadı" />
        <main className="balya-detail-content">
          <p>Aradığınız balya kaydı bulunamadı.</p>
          <Link className="back-link" to="/balyalar">
            ← Balya listesine dön
          </Link>
        </main>
      </div>
      </AppLayout>
    );
  }

  const alanGuncelle = (id: string, deger: string) => {
    setForm((mevcut) => ({ ...mevcut, [id]: deger }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const degerler = hviParametreleri.reduce((acc, param) => {
      acc[param.id] = Number(form[param.id]);
      return acc;
    }, {} as Record<string, number>);

    const analiz: HviAnaliz = {
      id: 'HVI-' + Date.now(),
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
    };

    hviTopluEkle([analiz]);
    setSubmitted(true);
    setYenidenGir(false);
    setForm(bosForm);
  };

  const handleKaliteHesapla = (agirliklar: ParametreAgirlik[]) => {
    kaliteSkoruHesapla([balya.balyaId], agirliklar);
    setKalitePaneliAcik(false);
  };

  const kimlikBilgileri: { label: string; value: string }[] = [
    { label: 'Balya ID', value: balya.balyaId },
    { label: 'Barkod', value: balya.barkod },
    { label: 'Lot No', value: balya.lotNo },
    { label: 'Küme ID', value: balya.kumeId ?? '—' },
    { label: 'Ön Serim ID', value: balya.onSerimId ?? '—' },
    { label: 'Serim ID', value: balya.serimId ?? '—' },
  ];

  const lokasyon: { label: string; value: string }[] = [
    { label: 'Ana Depo', value: balya.anaDepo },
    { label: 'Ara Depo', value: balya.araDepo ?? '—' },
    { label: 'Raf', value: balya.raf || '—' },
    { label: 'Satır', value: balya.satir || '—' },
    { label: 'Kolon', value: balya.kolon || '—' },
  ];

  const urunBilgisi: { label: string; value: string }[] = [
    { label: 'Menşei', value: balya.mensei },
    { label: 'Üretici', value: balya.uretici },
    { label: 'Brüt Ağırlık', value: `${balya.brutAgirlik.toLocaleString('tr-TR')} ${balya.birim}` },
    { label: 'Net Ağırlık', value: `${balya.netAgirlik.toLocaleString('tr-TR')} ${balya.birim}` },
    { label: 'Birim', value: balya.birim },
  ];

  const formGoster = balya.kaliteSkoru === null || yenidenGir;

  return (
    <AppLayout>
    <div className="balya-detail-page">
      <AppHeader title={balya.balyaId} subtitle="Balya Detayları" />

      <main className="balya-detail-content">
        <Link className="back-link" to="/balyalar">
          ← Balya listesine dön
        </Link>

        <div className="balya-detail-card">
          <section className="balya-detail-section">
            <h3>Kimlik Bilgileri</h3>
            <div className="balya-detail-grid">
              {kimlikBilgileri.map((field) => (
                <div className="balya-detail-field" key={field.label}>
                  <span className="field-label">{field.label}</span>
                  <span className="field-value">{field.value}</span>
                </div>
              ))}
              <div className="balya-detail-field">
                <span className="field-label">QR Kod</span>
                <QrCodePreview value={balya.qrKod} />
              </div>
            </div>
          </section>

          <section className="balya-detail-section">
            <h3>Lokasyon</h3>
            <div className="balya-detail-grid">
              {lokasyon.map((field) => (
                <div className="balya-detail-field" key={field.label}>
                  <span className="field-label">{field.label}</span>
                  <span className="field-value">{field.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="balya-detail-section">
            <h3>Ürün Bilgisi</h3>
            <div className="balya-detail-grid">
              {urunBilgisi.map((field) => (
                <div className="balya-detail-field" key={field.label}>
                  <span className="field-label">{field.label}</span>
                  <span className="field-value">{field.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="balya-detail-section">
            <h3>Durum</h3>
            <StatusBadge {...balyaDurumMeta[balya.durum]} />
          </section>

          <section className="balya-detail-section">
            <div className="hvi-section-header">
              <h3>HVI Testi Sonucu Gir</h3>
              {mevcutAnaliz && (
                <button
                  type="button"
                  className="referans-araliklari-btn"
                  onClick={() => setReferansModalAcik(true)}
                >
                  Referans Aralıkları
                </button>
              )}
            </div>

            {!formGoster && mevcutAnaliz && (
              <div className="hvi-ozet-card">
                <div className="balya-detail-grid">
                  <div className="balya-detail-field">
                    <span className="field-label">Kalite Skoru</span>
                    <span className="field-value">{mevcutAnaliz.kaliteSkoru ?? '—'}</span>
                  </div>
                  <div className="balya-detail-field">
                    <span className="field-label">Kalite Sınıfı</span>
                    <span className="field-value">
                      {(() => {
                        const sinif = kaliteSinifiBul(mevcutAnaliz.kaliteSkoru);
                        return sinif ? <StatusBadge label={sinif.label} color={sinif.color} dot={sinif.dot} /> : '—';
                      })()}
                    </span>
                  </div>
                  <div className="balya-detail-field">
                    <span className="field-label">Analiz Tarihi</span>
                    <span className="field-value">{mevcutAnaliz.analizTarihi}</span>
                  </div>
                  <div className="balya-detail-field">
                    <span className="field-label">Analizi Yapan</span>
                    <span className="field-value">{mevcutAnaliz.analiziYapan}</span>
                  </div>
                </div>
                <div className="hvi-ozet-actions">
                  {balya.kaliteSkoru === null && (
                    <button
                      type="button"
                      className="kalite-hesapla-btn"
                      onClick={() => setKalitePaneliAcik(true)}
                    >
                      Kalite Skorunu Hesapla
                    </button>
                  )}
                  <button
                    type="button"
                    className="hvi-yeniden-gir-btn"
                    onClick={() => setYenidenGir(true)}
                  >
                    Yeniden Gir
                  </button>
                </div>

                <div className="hvi-degerler-table-wrapper">
                  <table className="hvi-degerler-table">
                    <thead>
                      <tr>
                        <th>Parametre</th>
                        <th>Ölçülen Değer</th>
                        <th>Referans Aralığı</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hviParametreleri.map((param) => {
                        const deger = (mevcutAnaliz as unknown as Record<string, number>)[param.id];
                        const bantlar = kademeBantlari[param.id];

                        if (bantlar) {
                          const bulunanBant = bantBul(bantlar, deger);
                          const enIyiBant = bantlar[bantlar.length - 1];
                          const enIdeal = bulunanBant.label === enIyiBant.label || bulunanBant.label.toLowerCase().includes('ideal');
                          return (
                            <tr key={param.id}>
                              <td>{param.label}</td>
                              <td>{deger}</td>
                              <td>{bantlar.map((bant) => bantAraligiMetni(bant)).join(' / ')}</td>
                              <td className={enIdeal ? 'hvi-durum-iyi' : 'hvi-durum-orta'}>
                                {bulunanBant.label}
                              </td>
                            </tr>
                          );
                        }

                        const aralik = referansAraliklari[param.id];
                        const disinda = aralik ? deger < aralik.min || deger > aralik.max : false;
                        return (
                          <tr key={param.id}>
                            <td>{param.label}</td>
                            <td>{deger}</td>
                            <td>{aralik ? `${aralik.min} - ${aralik.max}` : '—'}</td>
                            <td className={aralik ? (disinda ? 'hvi-durum-disinda' : 'hvi-durum-iyi') : 'hvi-durum-notr'}>
                              {aralik ? (disinda ? 'Aralık Dışında' : 'Aralıkta') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {formGoster && (
              <form className="hvi-form-grid-wrapper" onSubmit={handleSubmit}>
                <div className="hvi-form-grid">
                  {hviParametreleri.map((param) => (
                    <div className="form-field" key={param.id}>
                      <label htmlFor={param.id}>{param.label}</label>
                      <input
                        id={param.id}
                        type="number"
                        step="0.01"
                        required
                        value={form[param.id]}
                        onChange={(event) => alanGuncelle(param.id, event.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="hvi-form-actions">
                  {mevcutAnaliz && (
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setYenidenGir(false)}
                    >
                      Vazgeç
                    </button>
                  )}
                  <button type="submit" className="submit-btn">
                    Kaydet
                  </button>
                </div>

                {submitted && <p className="success-msg">Analiz kaydedildi.</p>}
              </form>
            )}
          </section>

          <section className="balya-detail-section balya-detail-section-last">
            <h3>Hareket Geçmişi</h3>
            <HareketTimeline kayitlar={hareketler} />
          </section>
        </div>
      </main>

      {kalitePaneliAcik && (
        <div className="hvi-panel-backdrop" onClick={() => setKalitePaneliAcik(false)}>
          <div className="hvi-panel-card" onClick={(event) => event.stopPropagation()}>
            <AgirlikPaneli onHesapla={handleKaliteHesapla} onIptal={() => setKalitePaneliAcik(false)} />
          </div>
        </div>
      )}

      {referansModalAcik && mevcutAnaliz && (
        <ReferansAraliklariModal analiz={mevcutAnaliz} onKapat={() => setReferansModalAcik(false)} />
      )}
    </div>
    </AppLayout>
  );
}

export default BalyaDetail;
