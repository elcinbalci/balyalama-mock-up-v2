import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import QrCodePreview from '../components/QrCodePreview';
import SearchFilterBar from '../components/SearchFilterBar';
import { mockBarkodEtiketler } from '../data/mockBarkodEtiketler';
import './BarkodEtiketList.css';

function BarkodEtiketList() {
  const [arama, setArama] = useState('');

  const filteredEtiketler = useMemo(() => {
    if (arama.trim() === '') return mockBarkodEtiketler;
    const aramaKucuk = arama.trim().toLowerCase();
    return mockBarkodEtiketler.filter(
      (etiket) =>
        etiket.barkodNo.toLowerCase().includes(aramaKucuk) ||
        etiket.balyaId.toLowerCase().includes(aramaKucuk) ||
        etiket.basanKullanici.toLowerCase().includes(aramaKucuk)
    );
  }, [arama]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
    <div className="barkod-etiket-page">
      <AppHeader title="Barkod & Etiket" subtitle="Basılan balya etiketlerini görüntüle" />

      <main className="barkod-etiket-content">
        <div className="barkod-etiket-toolbar">
          <SearchFilterBar
            searchValue={arama}
            onSearchChange={setArama}
            searchPlaceholder="Barkod no, balya ID, basan kullanıcı ara..."
            activeFilterCount={0}
            onFilterClick={() => {}}
            hideFilterButton
          />
        </div>

        <div className="barkod-etiket-table-wrapper">
          <table className="barkod-etiket-table">
            <thead>
              <tr>
                <th>QR</th>
                <th>Barkod No</th>
                <th>Balya ID</th>
                <th>Basım Tarihi</th>
                <th>Basan Kullanıcı</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredEtiketler.map((etiket) => (
                <tr key={etiket.id}>
                  <td>
                    <QrCodePreview value={etiket.barkodNo} />
                  </td>
                  <td>{etiket.barkodNo}</td>
                  <td>{etiket.balyaId}</td>
                  <td>{etiket.basimTarihi}</td>
                  <td>{etiket.basanKullanici}</td>
                  <td>
                    <button type="button" className="print-btn" onClick={handlePrint}>
                      Etiketi Yazdır
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEtiketler.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Henüz basılmış etiket bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
    </AppLayout>
  );
}

export default BarkodEtiketList;
