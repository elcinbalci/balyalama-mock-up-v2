import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterModal from '../components/FilterModal';
import { useData } from '../context/DataContext';
import type { LotDurum } from '../types/domain';
import { lotDurumMeta } from '../types/domain';
import './LotList.css';

function LotList() {
  const { lots } = useData();
  const [arama, setArama] = useState('');
  const [secimliDurumlar, setSecimliDurumlar] = useState<LotDurum[]>([]);
  const [filtreModalAcik, setFiltreModalAcik] = useState(false);

  const filteredLots = useMemo(() => {
    let sonuc = lots;
    if (secimliDurumlar.length > 0) {
      sonuc = sonuc.filter((lot) => secimliDurumlar.includes(lot.durum));
    }
    if (arama.trim() !== '') {
      const aramaKucuk = arama.trim().toLowerCase();
      sonuc = sonuc.filter(
        (lot) =>
          lot.lotNo.toLowerCase().includes(aramaKucuk) ||
          lot.tedarikci.toLowerCase().includes(aramaKucuk) ||
          lot.menseiUlke.toLowerCase().includes(aramaKucuk)
      );
    }
    return sonuc;
  }, [secimliDurumlar, arama, lots]);

  return (
    <AppLayout>
    <div className="lot-list-page">
      <AppHeader title="LOT Yönetimi" subtitle="Tüm kamyon LOT'larını görüntüle ve yönet" />

      <main className="lot-list-content">
        <div className="lot-list-toolbar">
          <SearchFilterBar
            searchValue={arama}
            onSearchChange={setArama}
            searchPlaceholder="Lot no, tedarikçi, menşei ara..."
            activeFilterCount={secimliDurumlar.length}
            onFilterClick={() => setFiltreModalAcik(true)}
          />

          <Link to="/lots/new" className="new-lot-btn">
            + Yeni LOT
          </Link>
        </div>

        <div className="lot-table-wrapper">
          <table className="lot-table">
            <thead>
              <tr>
                <th>Lot No</th>
                <th>Giriş Tarihi</th>
                <th>Menşei Ülke</th>
                <th>Tedarikçi</th>
                <th>Depo</th>
                <th>Balya Sayısı</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {filteredLots.map((lot) => (
                <tr key={lot.lotNo}>
                  <td>
                    <Link className="lot-link" to={`/lots/${lot.lotNo}`}>
                      {lot.lotNo}
                    </Link>
                  </td>
                  <td>{lot.girisTarihi}</td>
                  <td>{lot.menseiUlke}</td>
                  <td>{lot.tedarikci}</td>
                  <td>{lot.depo}</td>
                  <td>{lot.balyaSayisi.toLocaleString('tr-TR')}</td>
                  <td>
                    <StatusBadge {...lotDurumMeta[lot.durum]} />
                  </td>
                </tr>
              ))}
              {filteredLots.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Bu duruma ait LOT bulunamadı.
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
          options={(Object.keys(lotDurumMeta) as LotDurum[]).map((d) => ({ value: d, label: lotDurumMeta[d].label }))}
          selected={secimliDurumlar}
          onApply={(s) => setSecimliDurumlar(s as LotDurum[])}
          onClose={() => setFiltreModalAcik(false)}
        />
      )}
    </div>
    </AppLayout>
  );
}

export default LotList;
