import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterModal from '../components/FilterModal';
import { useData } from '../context/DataContext';
import type { BalyaDurum } from '../types/domain';
import { balyaDurumMeta } from '../types/domain';
import { kaliteSinifiBul } from '../utils/kaliteSinifi';
import './BalyaList.css';

function BalyaList() {
  const { balyalar } = useData();
  const [arama, setArama] = useState('');
  const [secimliDurumlar, setSecimliDurumlar] = useState<BalyaDurum[]>([]);
  const [filtreModalAcik, setFiltreModalAcik] = useState(false);

  const filteredBalyalar = useMemo(() => {
    let sonuc = balyalar;
    if (secimliDurumlar.length > 0) {
      sonuc = sonuc.filter((balya) => secimliDurumlar.includes(balya.durum));
    }
    if (arama.trim() !== '') {
      const aramaKucuk = arama.trim().toLowerCase();
      sonuc = sonuc.filter(
        (balya) =>
          balya.balyaId.toLowerCase().includes(aramaKucuk) ||
          balya.lotNo.toLowerCase().includes(aramaKucuk) ||
          balya.anaDepo.toLowerCase().includes(aramaKucuk) ||
          (balya.araDepo?.toLowerCase().includes(aramaKucuk) ?? false)
      );
    }
    return sonuc;
  }, [secimliDurumlar, arama, balyalar]);

  return (
    <AppLayout>
    <div className="balya-list-page">
      <AppHeader title="Balya Yönetimi" subtitle="Tüm balyaları görüntüle ve durumlarını takip et" />

      <main className="balya-list-content">
        <div className="balya-list-toolbar">
          <SearchFilterBar
            searchValue={arama}
            onSearchChange={setArama}
            searchPlaceholder="Balya ID, lot no, depo ara..."
            activeFilterCount={secimliDurumlar.length}
            onFilterClick={() => setFiltreModalAcik(true)}
          />
        </div>

        <div className="balya-table-wrapper">
          <table className="balya-table">
            <thead>
              <tr>
                <th>Balya ID</th>
                <th>Lot No</th>
                <th>Ana Depo</th>
                <th>Ara Depo</th>
                <th>Kalite Skoru</th>
                <th>Sınıf</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalyalar.map((balya) => {
                const sinif = kaliteSinifiBul(balya.kaliteSkoru);
                return (
                  <tr key={balya.balyaId}>
                    <td>
                      <Link className="balya-link" to={`/balyalar/${balya.balyaId}`}>
                        {balya.balyaId}
                      </Link>
                    </td>
                    <td>{balya.lotNo}</td>
                    <td>{balya.anaDepo}</td>
                    <td>{balya.araDepo ?? '—'}</td>
                    <td>{balya.kaliteSkoru ?? '—'}</td>
                    <td>{sinif ? <StatusBadge label={sinif.sinif} color={sinif.color} dot={sinif.dot} /> : '—'}</td>
                    <td>
                      <StatusBadge {...balyaDurumMeta[balya.durum]} />
                    </td>
                  </tr>
                );
              })}
              {filteredBalyalar.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Bu duruma ait balya bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {filtreModalAcik && (
        <FilterModal
          title="Duruma Göre Filtrele"
          options={(Object.keys(balyaDurumMeta) as BalyaDurum[]).map((d) => ({ value: d, label: balyaDurumMeta[d].label }))}
          selected={secimliDurumlar}
          onApply={(s) => setSecimliDurumlar(s as BalyaDurum[])}
          onClose={() => setFiltreModalAcik(false)}
        />
      )}
    </div>
    </AppLayout>
  );
}

export default BalyaList;
