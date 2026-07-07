import { useMemo, useState } from 'react';
import { varsayilanAgirliklar } from '../utils/qualityEngine';
import type { ParametreAgirlik } from '../utils/qualityEngine';
import { referansAraligiMetni } from '../utils/referansAraliklari';
import './AgirlikPaneli.css';

interface AgirlikPaneliProps {
  onHesapla: (agirliklar: ParametreAgirlik[]) => void;
  onIptal: () => void;
}

function AgirlikPaneli({ onHesapla, onIptal }: AgirlikPaneliProps) {
  const [agirliklar, setAgirliklar] = useState<ParametreAgirlik[]>(varsayilanAgirliklar);

  const toplamAgirlik = useMemo(
    () => agirliklar.reduce((toplam, a) => toplam + a.agirlik, 0),
    [agirliklar]
  );

  const toplamGecerli = toplamAgirlik === 100;

  const handleAgirlikDegistir = (parametre: string, deger: number) => {
    setAgirliklar((onceki) =>
      onceki.map((a) => (a.parametre === parametre ? { ...a, agirlik: deger } : a))
    );
  };

  const handleSifirla = () => {
    setAgirliklar(varsayilanAgirliklar);
  };

  return (
    <div className="agirlik-paneli">
      <div className="agirlik-paneli-header">
        <h3>Parametre Ağırlıkları</h3>
        <button type="button" className="link-button" onClick={handleSifirla}>
          Varsayılana Sıfırla
        </button>
      </div>

      <div className="agirlik-satirlari">
        <div className="agirlik-satiri agirlik-satiri-baslik">
          <div>Parametre</div>
          <div>Referans Aralığı</div>
          <div>Ağırlık (%)</div>
        </div>
        {agirliklar.map((a) => (
          <div className="agirlik-satiri" key={a.parametre}>
            <div className="agirlik-label">{a.label}</div>
            <div className="agirlik-referans">{referansAraligiMetni(a.parametre)}</div>
            <input
              type="number"
              className="agirlik-input"
              min={0}
              max={100}
              value={a.agirlik}
              onChange={(event) => handleAgirlikDegistir(a.parametre, Number(event.target.value))}
            />
          </div>
        ))}
      </div>

      <div className={toplamGecerli ? 'agirlik-toplam gecerli' : 'agirlik-toplam gecersiz'}>
        Toplam: %{toplamAgirlik} {toplamGecerli ? '— hesaplamaya hazır' : '— toplam 100 olmalı'}
      </div>

      <div className="agirlik-paneli-actions">
        <button type="button" className="cancel-btn" onClick={onIptal}>
          Vazgeç
        </button>
        <button
          type="button"
          className="submit-btn"
          disabled={!toplamGecerli}
          onClick={() => onHesapla(agirliklar)}
        >
          Hesapla
        </button>
      </div>
    </div>
  );
}

export default AgirlikPaneli;
