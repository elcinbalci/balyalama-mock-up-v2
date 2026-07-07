import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import HareketTimeline from '../components/HareketTimeline';
import { mockHareketGecmisi } from '../data/mockHareketGecmisi';
import './HareketGecmisiList.css';

function HareketGecmisiList() {
  const [balyaFiltre, setBalyaFiltre] = useState('');

  const filtreliKayitlar = useMemo(() => {
    const sirali = [...mockHareketGecmisi].sort((a, b) => a.tarih.localeCompare(b.tarih));
    if (!balyaFiltre.trim()) return sirali;
    return sirali.filter((kayit) =>
      kayit.balyaId.toLowerCase().includes(balyaFiltre.trim().toLowerCase())
    );
  }, [balyaFiltre]);

  return (
    <AppLayout>
    <div className="hareket-gecmisi-page">
      <AppHeader title="Hareket Geçmişi" subtitle="Balyaların durum değişikliklerini zaman çizelgesinde takip et" />

      <main className="hareket-gecmisi-content">
        <div className="hareket-gecmisi-toolbar">
          <input
            type="text"
            className="balya-filter-input"
            placeholder="Balya ID ile filtrele"
            value={balyaFiltre}
            onChange={(event) => setBalyaFiltre(event.target.value)}
          />
        </div>

        <HareketTimeline kayitlar={filtreliKayitlar} />
      </main>
    </div>
    </AppLayout>
  );
}

export default HareketGecmisiList;
