import type { HviAnaliz } from '../types/domain';
import { hviParametreleri } from '../pages/HviNew';
import { referansAraliklari, kademeBantlari, bantAraligiMetni, bantBul } from '../utils/referansAraliklari';
import './ReferansAraliklariModal.css';

interface ReferansAraliklariModalProps {
  analiz: HviAnaliz;
  onKapat: () => void;
}

function ReferansAraliklariModal({ analiz, onKapat }: ReferansAraliklariModalProps) {
  return (
    <div className="ra-modal-backdrop" onClick={onKapat}>
      <div className="ra-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="ra-modal-header">
          <h3>Referans Aralıkları — {analiz.balyaId}</h3>
          <button type="button" className="ra-modal-kapat" onClick={onKapat}>
            ✕
          </button>
        </div>

        <div className="ra-table-wrapper">
          <table className="ra-table">
            <thead>
              <tr>
                <th>Parametre</th>
                <th>Bu Balyanın Değeri</th>
                <th>Hangi Bantta</th>
                <th>Tüm Bantlar</th>
              </tr>
            </thead>
            <tbody>
              {hviParametreleri.map((param) => {
                const deger = (analiz as unknown as Record<string, number>)[param.id];
                const bantlar = kademeBantlari[param.id];

                if (bantlar) {
                  const bulunanBant = bantBul(bantlar, deger);
                  return (
                    <tr key={param.id}>
                      <td>{param.label}</td>
                      <td>{deger}</td>
                      <td>{`${bulunanBant.label} (${bantAraligiMetni(bulunanBant)})`}</td>
                      <td>
                        {bantlar.map((bant) => `${bant.label}: ${bantAraligiMetni(bant)}`).join(' · ')}
                      </td>
                    </tr>
                  );
                }

                const aralik = referansAraliklari[param.id];
                const disinda = aralik ? deger < aralik.min || deger > aralik.max : false;
                return (
                  <tr key={param.id} className={disinda ? 'ra-disinda' : ''}>
                    <td>{param.label}</td>
                    <td>{deger}</td>
                    <td colSpan={2}>{aralik ? `${aralik.min} - ${aralik.max}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReferansAraliklariModal;
