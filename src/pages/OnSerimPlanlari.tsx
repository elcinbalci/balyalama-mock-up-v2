import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import type { OnSerimPlanTipi } from '../types/domain';
import { onSerimDurumMeta } from '../types/domain';
import './OnSerimPlanlari.css';

interface KumeOzet {
  kumeId: string;
  toplamBalya: number;
  uygunBalya: number;
}

function OnSerimPlanlari() {
  const { lots, balyalar, onSerimPlanlari, onSerimPlaniOlustur } = useData();
  const [olusturmaAcik, setOlusturmaAcik] = useState(false);
  const [seciliLot, setSeciliLot] = useState(lots[0]?.lotNo ?? '');
  const [secilenKumeler, setSecilenKumeler] = useState<Set<string>>(new Set());
  const [planTipi, setPlanTipi] = useState<OnSerimPlanTipi>(140);
  const [ozelSayi, setOzelSayi] = useState(150);
  const [onSerimAdi, setOnSerimAdi] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [sonOlusturulanId, setSonOlusturulanId] = useState<string | null>(null);

  useEffect(() => {
    setSecilenKumeler(new Set());
    setHataMesaji(null);
  }, [seciliLot]);

  const lotBalyalari = useMemo(
    () => balyalar.filter((balya) => balya.lotNo === seciliLot),
    [balyalar, seciliLot]
  );

  const kumeOzetleri = useMemo<KumeOzet[]>(() => {
    const gruplar = new Map<string, { toplam: number; uygun: number }>();
    lotBalyalari.forEach((balya) => {
      if (!balya.kumeId) return;
      const kayit = gruplar.get(balya.kumeId) ?? { toplam: 0, uygun: 0 };
      kayit.toplam += 1;
      if (balya.onSerimId === null) kayit.uygun += 1;
      gruplar.set(balya.kumeId, kayit);
    });
    return Array.from(gruplar.entries())
      .map(([kumeId, kayit]) => ({ kumeId, toplamBalya: kayit.toplam, uygunBalya: kayit.uygun }))
      .sort((a, b) => a.kumeId.localeCompare(b.kumeId));
  }, [lotBalyalari]);

  const toplamUygunBalya = useMemo(
    () =>
      kumeOzetleri
        .filter((kume) => secilenKumeler.has(kume.kumeId))
        .reduce((toplam, kume) => toplam + kume.uygunBalya, 0),
    [kumeOzetleri, secilenKumeler]
  );

  const istenenBalyaSayisi = planTipi === 'Özel' ? ozelSayi : planTipi;

  const balyaKumeMap = useMemo(() => {
    const harita = new Map<string, string | null>();
    balyalar.forEach((balya) => harita.set(balya.balyaId, balya.kumeId));
    return harita;
  }, [balyalar]);

  const sonOlusturulanPlan = sonOlusturulanId
    ? onSerimPlanlari.find((plan) => plan.onSerimId === sonOlusturulanId)
    : null;

  const kumeToggle = (kumeId: string) => {
    setSecilenKumeler((mevcut) => {
      const yeni = new Set(mevcut);
      if (yeni.has(kumeId)) {
        yeni.delete(kumeId);
      } else {
        yeni.add(kumeId);
      }
      return yeni;
    });
  };

  const formuSifirla = () => {
    setSecilenKumeler(new Set());
    setPlanTipi(140);
    setOzelSayi(150);
    setOnSerimAdi('');
    setAciklama('');
    setHataMesaji(null);
    setSonOlusturulanId(null);
  };

  const handleOlusturmaAc = () => {
    formuSifirla();
    setOlusturmaAcik(true);
  };

  const handleOlusturmaKapat = () => {
    setOlusturmaAcik(false);
  };

  const handlePlanOlustur = () => {
    setHataMesaji(null);
    const { plan, hata } = onSerimPlaniOlustur({
      lotNo: seciliLot,
      onSerimAdi,
      secilenKumeIdler: Array.from(secilenKumeler),
      planTipi,
      balyaSayisi: istenenBalyaSayisi,
      aciklama,
    });

    if (!plan) {
      setHataMesaji(hata);
      setSonOlusturulanId(null);
      return;
    }

    setSonOlusturulanId(plan.onSerimId);
    setSecilenKumeler(new Set());
    setOnSerimAdi('');
    setAciklama('');
  };

  return (
    <AppLayout>
      <div className="on-serim-page">
        <AppHeader
          title="Ön Serim Planları"
          subtitle="Kümeleme sonrası seçilen kümelerden üretimde birlikte kullanılacak balyaları planla"
        />
        <main className="on-serim-content">
          <div className="on-serim-liste-header">
            <h2>Oluşturulmuş Ön Serim Planları</h2>
            <button className="plan-olustur-button" onClick={handleOlusturmaAc}>
              + Ön Serim Planı Oluştur
            </button>
          </div>

          <div className="plan-gecmisi-panel">
            {onSerimPlanlari.length === 0 ? (
              <p className="bos-mesaj">Henüz hiç ön serim planı oluşturulmadı.</p>
            ) : (
              <div className="sonuc-table-wrapper">
                <table className="sonuc-table">
                  <thead>
                    <tr>
                      <th>Ön Serim ID</th>
                      <th>Lot No</th>
                      <th>Ad</th>
                      <th>Küme(ler)</th>
                      <th>Balya Sayısı</th>
                      <th>Oluşturma Tarihi</th>
                      <th>Oluşturan</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onSerimPlanlari.map((plan) => (
                      <tr key={plan.onSerimId}>
                        <td>{plan.onSerimId}</td>
                        <td>{plan.lotNo}</td>
                        <td>{plan.onSerimAdi || '—'}</td>
                        <td>{plan.secilenKumeIdler.join(', ')}</td>
                        <td>{plan.balyaIdler.length}</td>
                        <td>{plan.olusturmaTarihi}</td>
                        <td>{plan.olusturanKullanici}</td>
                        <td>
                          <StatusBadge {...onSerimDurumMeta[plan.durum]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {olusturmaAcik && (
        <div className="on-serim-modal-backdrop" onClick={handleOlusturmaKapat}>
          <div className="on-serim-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="on-serim-modal-header">
              <h3>Yeni Ön Serim Planı</h3>
              <button type="button" className="on-serim-modal-kapat" onClick={handleOlusturmaKapat}>
                ✕
              </button>
            </div>

            <div className="on-serim-panel">
              <div className="panel-satiri">
                <span className="panel-label">Lot</span>
                <select value={seciliLot} onChange={(e) => setSeciliLot(e.target.value)}>
                  {lots.map((lot) => (
                    <option key={lot.lotNo} value={lot.lotNo}>
                      {lot.lotNo}
                    </option>
                  ))}
                </select>
                <span className="lot-toplam-bilgisi">Toplam {lotBalyalari.length} balya</span>
              </div>

              <div className="panel-blok">
                <span className="panel-label">Küme Seç</span>
                {kumeOzetleri.length === 0 ? (
                  <p className="bos-mesaj-inline">
                    Bu lot için henüz oluşturulmuş küme yok. Önce Kümeleme ekranından kümeleri oluşturun.
                  </p>
                ) : (
                  <div className="kume-secim-listesi">
                    {kumeOzetleri.map((kume) => (
                      <label className="kume-secim-satiri" key={kume.kumeId}>
                        <input
                          type="checkbox"
                          checked={secilenKumeler.has(kume.kumeId)}
                          onChange={() => kumeToggle(kume.kumeId)}
                          disabled={kume.uygunBalya === 0}
                        />
                        <span className="kume-secim-id">{kume.kumeId}</span>
                        <span className="kume-secim-sayi">
                          {kume.uygunBalya} uygun / {kume.toplamBalya} toplam balya
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel-satiri">
                <span className="panel-label">Balya Sayısı</span>
                <div className="plan-tipi-secim">
                  {([140, 180, 200] as OnSerimPlanTipi[]).map((tip) => (
                    <button
                      key={tip}
                      className={planTipi === tip ? 'plan-chip active' : 'plan-chip'}
                      onClick={() => setPlanTipi(tip)}
                    >
                      {tip}
                    </button>
                  ))}
                  <button
                    className={planTipi === 'Özel' ? 'plan-chip active' : 'plan-chip'}
                    onClick={() => setPlanTipi('Özel')}
                  >
                    Özel
                  </button>
                  {planTipi === 'Özel' && (
                    <input
                      type="number"
                      className="ozel-sayi-input"
                      min={1}
                      value={ozelSayi}
                      onChange={(e) => setOzelSayi(Number(e.target.value))}
                    />
                  )}
                </div>
              </div>

              <p className="uygun-balya-bilgisi">
                Seçilen kümelerde <strong>{toplamUygunBalya}</strong> uygun balya var. Sistem{' '}
                <strong>{istenenBalyaSayisi}</strong> balya ayıracak.
              </p>

              <div className="panel-satiri">
                <span className="panel-label">Ön Serim Adı</span>
                <input
                  type="text"
                  className="on-serim-adi-input"
                  placeholder="Opsiyonel"
                  value={onSerimAdi}
                  onChange={(e) => setOnSerimAdi(e.target.value)}
                />
              </div>

              <div className="panel-satiri">
                <span className="panel-label">Açıklama</span>
                <input
                  type="text"
                  className="on-serim-adi-input"
                  placeholder="Opsiyonel"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                />
              </div>

              <button className="plan-olustur-button" onClick={handlePlanOlustur}>
                Ön Serim Planı Oluştur
              </button>

              {hataMesaji && <p className="hata-msg">{hataMesaji}</p>}

              {sonOlusturulanPlan && (
                <div className="sonuc-panel">
                  <h2>{sonOlusturulanPlan.onSerimId} oluşturuldu</h2>
                  <div className="ozet-satiri">
                    <span>
                      Seçilen Balya Sayısı: <strong>{sonOlusturulanPlan.balyaIdler.length}</strong>
                    </span>
                    <span>
                      Ortalama UHML: <strong>{sonOlusturulanPlan.ortalamaUHML ?? '—'}</strong>
                    </span>
                    <span>
                      Ortalama MIC: <strong>{sonOlusturulanPlan.ortalamaMIC ?? '—'}</strong>
                    </span>
                    <span>
                      Ortalama STR: <strong>{sonOlusturulanPlan.ortalamaSTR ?? '—'}</strong>
                    </span>
                    <span>
                      Ortalama UI: <strong>{sonOlusturulanPlan.ortalamaUI ?? '—'}</strong>
                    </span>
                    <span>
                      Ortalama SFI: <strong>{sonOlusturulanPlan.ortalamaSFI ?? '—'}</strong>
                    </span>
                  </div>
                  <div className="sonuc-table-wrapper">
                    <table className="sonuc-table">
                      <thead>
                        <tr>
                          <th>Balya ID</th>
                          <th>Küme ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sonOlusturulanPlan.balyaIdler.map((balyaId) => (
                          <tr key={balyaId}>
                            <td>{balyaId}</td>
                            <td>{balyaKumeMap.get(balyaId) ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default OnSerimPlanlari;
