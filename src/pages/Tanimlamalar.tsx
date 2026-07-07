import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import DepoAgaci from '../components/DepoAgaci';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterModal from '../components/FilterModal';
import { mockDepolar } from '../data/mockDepolar';
import type { DepoTuru } from '../types/domain';
import './Tanimlamalar.css';

function Tanimlamalar() {
  const [arama, setArama] = useState('');
  const [secimliTurler, setSecimliTurler] = useState<DepoTuru[]>([]);
  const [filtreModalAcik, setFiltreModalAcik] = useState(false);
  const [gorunum, setGorunum] = useState<'tablo' | 'agac'>('tablo');

  const filteredDepolar = useMemo(() => {
    let sonuc = mockDepolar;
    if (secimliTurler.length > 0) {
      sonuc = sonuc.filter((depo) => secimliTurler.includes(depo.depoTuru));
    }
    if (arama.trim() !== '') {
      const aramaKucuk = arama.trim().toLowerCase();
      sonuc = sonuc.filter(
        (depo) =>
          depo.depoAdi.toLowerCase().includes(aramaKucuk) ||
          depo.kod.toLowerCase().includes(aramaKucuk) ||
          depo.aciklama.toLowerCase().includes(aramaKucuk)
      );
    }
    return sonuc;
  }, [secimliTurler, arama]);

  const turler: DepoTuru[] = ['Depo', 'Ara Depo', 'Serim Deposu'];

  return (
    <AppLayout>
    <div className="tanimlamalar-page">
      <AppHeader title="Depolar" subtitle="Tanımlamalar / Depo, ara depo ve serim alanı tanımlarını yönet" />

      <main className="tanimlamalar-content">
        <div className="tanimlamalar-toolbar">
          {gorunum === 'tablo' && (
            <SearchFilterBar
              searchValue={arama}
              onSearchChange={setArama}
              searchPlaceholder="Depo adı, kod, açıklama ara..."
              activeFilterCount={secimliTurler.length}
              onFilterClick={() => setFiltreModalAcik(true)}
            />
          )}

          <div className="tanimlamalar-toolbar-sag">
            <div className="gorunum-toggle">
              <button
                type="button"
                className={gorunum === 'tablo' ? 'gorunum-btn active' : 'gorunum-btn'}
                onClick={() => setGorunum('tablo')}
              >
                Tablo Görünümü
              </button>
              <button
                type="button"
                className={gorunum === 'agac' ? 'gorunum-btn active' : 'gorunum-btn'}
                onClick={() => setGorunum('agac')}
              >
                Ağaç Görünümü
              </button>
            </div>

            <button type="button" className="new-tanim-btn">
              + Yeni Tanım
            </button>
          </div>
        </div>

        {gorunum === 'tablo' ? (
          <div className="tanimlamalar-table-wrapper">
            <table className="tanimlamalar-table">
              <thead>
                <tr>
                  <th>Depo Adı</th>
                  <th>Depo Türü</th>
                  <th>Kod</th>
                  <th>Açıklama</th>
                  <th>Aktif</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepolar.map((depo) => (
                  <tr key={depo.id}>
                    <td>{depo.depoAdi}</td>
                    <td>{depo.depoTuru}</td>
                    <td>{depo.kod}</td>
                    <td>{depo.aciklama}</td>
                    <td>
                      <span className={depo.aktif ? 'aktif-badge aktif' : 'aktif-badge pasif'}>
                        <span className="aktif-dot" />
                        {depo.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredDepolar.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Bu türe ait tanım bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <DepoAgaci depolar={mockDepolar} />
        )}
      </main>

      {filtreModalAcik && (
        <FilterModal
          title="Türe Göre Filtrele"
          options={turler.map((tur) => ({ value: tur, label: tur }))}
          selected={secimliTurler}
          onApply={(s) => setSecimliTurler(s as DepoTuru[])}
          onClose={() => setFiltreModalAcik(false)}
        />
      )}
    </div>
    </AppLayout>
  );
}

export default Tanimlamalar;
