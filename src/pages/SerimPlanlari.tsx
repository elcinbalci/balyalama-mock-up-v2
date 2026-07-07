import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import { serimDurumMeta } from '../types/domain';
import './SerimPlanlari.css';

const DUZEN_ONERILERI: { x: number; y: number }[] = [
  { x: 4, y: 30 },
  { x: 3, y: 40 },
  { x: 8, y: 15 },
  { x: 6, y: 20 },
];

interface OnSerimOzet {
  onSerimId: string;
  kalanBalya: number;
}

function SerimPlanlari() {
  const { lots, balyalar, onSerimPlanlari, serimPlanlari, serimPlaniOlustur } = useData();
  const [olusturmaAcik, setOlusturmaAcik] = useState(false);
  const [seciliLot, setSeciliLot] = useState(lots[0]?.lotNo ?? '');
  const [secilenOnSerimler, setSecilenOnSerimler] = useState<Set<string>>(new Set());
  const [x, setX] = useState(6);
  const [y, setY] = useState(20);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [sonOlusturulanId, setSonOlusturulanId] = useState<string | null>(null);

  useEffect(() => {
    setSecilenOnSerimler(new Set());
    setHataMesaji(null);
  }, [seciliLot]);

  const lotOnSerimleri = useMemo(
    () => onSerimPlanlari.filter((plan) => plan.lotNo === seciliLot),
    [onSerimPlanlari, seciliLot]
  );

  const onSerimOzetleri = useMemo<OnSerimOzet[]>(() => {
    return lotOnSerimleri.map((plan) => {
      const kalanBalya = balyalar.filter(
        (balya) => balya.onSerimId === plan.onSerimId && balya.serimId === null
      ).length;
      return { onSerimId: plan.onSerimId, kalanBalya };
    });
  }, [lotOnSerimleri, balyalar]);

  const toplamKullanilabilirBalya = useMemo(
    () =>
      onSerimOzetleri
        .filter((ozet) => secilenOnSerimler.has(ozet.onSerimId))
        .reduce((toplam, ozet) => toplam + ozet.kalanBalya, 0),
    [onSerimOzetleri, secilenOnSerimler]
  );

  const istenenToplam = x * y;
  const acikta = Math.max(0, toplamKullanilabilirBalya - istenenToplam);

  const sonOlusturulanPlan = sonOlusturulanId
    ? serimPlanlari.find((plan) => plan.serimId === sonOlusturulanId)
    : null;

  const onSerimToggle = (onSerimId: string) => {
    setSecilenOnSerimler((mevcut) => {
      const yeni = new Set(mevcut);
      if (yeni.has(onSerimId)) {
        yeni.delete(onSerimId);
      } else {
        yeni.add(onSerimId);
      }
      return yeni;
    });
  };

  const formuSifirla = () => {
    setSecilenOnSerimler(new Set());
    setX(6);
    setY(20);
    setHataMesaji(null);
    setSonOlusturulanId(null);
  };

  const handleOlusturmaAc = () => {
    formuSifirla();
    setOlusturmaAcik(true);
  };

  const handlePlanOlustur = () => {
    setHataMesaji(null);
    const { plan, hata } = serimPlaniOlustur({
      lotNo: seciliLot,
      onSerimIdler: Array.from(secilenOnSerimler),
      x,
      y,
    });

    if (!plan) {
      setHataMesaji(hata);
      setSonOlusturulanId(null);
      return;
    }

    setSonOlusturulanId(plan.serimId);
    setSecilenOnSerimler(new Set());
  };

  return (
    <AppLayout>
      <div className="serim-planlari-page">
        <AppHeader
          title="Serim Planları"
          subtitle="Ön serimlerden harman hattına gidecek balyaların X × Y fiziksel dizilim planını oluştur"
        />
        <main className="serim-planlari-content">
          <div className="serim-liste-header">
            <h2>Oluşturulmuş Serim Planları</h2>
            <button className="plan-olustur-button" onClick={handleOlusturmaAc}>
              + Serim Planı Oluştur
            </button>
          </div>

          <div className="plan-gecmisi-panel">
            {serimPlanlari.length === 0 ? (
              <p className="bos-mesaj">Henüz hiç serim planı oluşturulmadı.</p>
            ) : (
              <div className="sonuc-table-wrapper">
                <table className="sonuc-table">
                  <thead>
                    <tr>
                      <th>Serim ID</th>
                      <th>Lot No</th>
                      <th>Ön Serim(ler)</th>
                      <th>Düzen</th>
                      <th>Toplam Balya</th>
                      <th>Oluşturma Tarihi</th>
                      <th>Oluşturan</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serimPlanlari.map((plan) => (
                      <tr key={plan.serimId}>
                        <td>{plan.serimId}</td>
                        <td>{plan.lotNo}</td>
                        <td>{plan.onSerimIdler.join(', ')}</td>
                        <td>
                          {plan.x} × {plan.y}
                        </td>
                        <td>{plan.toplamBalya}</td>
                        <td>{plan.olusturmaTarihi}</td>
                        <td>{plan.olusturanKullanici}</td>
                        <td>
                          <StatusBadge {...serimDurumMeta[plan.durum]} />
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
        <div className="serim-modal-backdrop" onClick={() => setOlusturmaAcik(false)}>
          <div className="serim-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="serim-modal-header">
              <h3>Yeni Serim Planı</h3>
              <button
                type="button"
                className="serim-modal-kapat"
                onClick={() => setOlusturmaAcik(false)}
              >
                ✕
              </button>
            </div>

            <div className="serim-panel">
              <div className="panel-satiri">
                <span className="panel-label">Lot</span>
                <select value={seciliLot} onChange={(e) => setSeciliLot(e.target.value)}>
                  {lots.map((lot) => (
                    <option key={lot.lotNo} value={lot.lotNo}>
                      {lot.lotNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-blok">
                <span className="panel-label">Ön Serim Seçimi</span>
                {onSerimOzetleri.length === 0 ? (
                  <p className="bos-mesaj-inline">
                    Bu lot için henüz ön serim planı yok. Önce Ön Serim Planları ekranından bir plan
                    oluşturun.
                  </p>
                ) : (
                  <div className="onserim-secim-listesi">
                    {onSerimOzetleri.map((ozet) => (
                      <label className="onserim-secim-satiri" key={ozet.onSerimId}>
                        <input
                          type="checkbox"
                          checked={secilenOnSerimler.has(ozet.onSerimId)}
                          onChange={() => onSerimToggle(ozet.onSerimId)}
                          disabled={ozet.kalanBalya === 0}
                        />
                        <span className="onserim-secim-id">{ozet.onSerimId}</span>
                        <span className="onserim-secim-sayi">{ozet.kalanBalya} kalan balya</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel-blok">
                <span className="panel-label">Serim Düzeni Önerileri</span>
                <div className="duzen-oneri-listesi">
                  {DUZEN_ONERILERI.map((oneri) => (
                    <button
                      key={`${oneri.x}x${oneri.y}`}
                      type="button"
                      className={x === oneri.x && y === oneri.y ? 'duzen-chip active' : 'duzen-chip'}
                      onClick={() => {
                        setX(oneri.x);
                        setY(oneri.y);
                      }}
                    >
                      {oneri.x} × {oneri.y} = {oneri.x * oneri.y}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-satiri">
                <span className="panel-label">Serim Alanı</span>
                <div className="xy-girisi">
                  <label>
                    X
                    <input
                      type="number"
                      min={1}
                      value={x}
                      onChange={(e) => setX(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Y
                    <input
                      type="number"
                      min={1}
                      value={y}
                      onChange={(e) => setY(Number(e.target.value))}
                    />
                  </label>
                  <span className="xy-toplam">
                    Satır {x} × Sütun {y} = Toplam <strong>{istenenToplam}</strong> balya
                  </span>
                </div>
              </div>

              <p className="uygun-balya-bilgisi">
                Seçilen ön serimlerde <strong>{toplamKullanilabilirBalya}</strong> kullanılabilir balya
                var. Sistem <strong>{istenenToplam}</strong> balya seçecek
                {toplamKullanilabilirBalya > 0 && (
                  <>
                    , <strong className={acikta > 0 ? 'acikta-vurgu' : ''}>{acikta}</strong> balya açıkta
                    kalacak
                  </>
                )}
                .
              </p>

              <button className="plan-olustur-button" onClick={handlePlanOlustur}>
                Serim Planı Oluştur
              </button>

              {hataMesaji && <p className="hata-msg">{hataMesaji}</p>}

              {sonOlusturulanPlan && (
                <div className="sonuc-panel">
                  <h2>
                    {sonOlusturulanPlan.serimId} oluşturuldu ({sonOlusturulanPlan.x} ×{' '}
                    {sonOlusturulanPlan.y})
                  </h2>
                  <div className="sonuc-table-wrapper">
                    <table className="sonuc-table">
                      <thead>
                        <tr>
                          <th>Pozisyon</th>
                          <th>Balya</th>
                          <th>Küme</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sonOlusturulanPlan.detay.map((satir) => (
                          <tr key={satir.siraNo}>
                            <td>
                              X{satir.xPozisyon}-Y{satir.yPozisyon}
                            </td>
                            <td>{satir.balyaId}</td>
                            <td>{satir.kumeId ?? '—'}</td>
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

export default SerimPlanlari;
