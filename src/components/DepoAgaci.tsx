import type { Depo } from '../types/domain';
import './DepoAgaci.css';

function DepoAgaci({ depolar }: { depolar: Depo[] }) {
  const anaDepolar = depolar.filter((depo) => depo.depoTuru === 'Depo');
  const bagliDepoBul = (anaDepoId: string) =>
    depolar.filter((depo) => depo.baglıAnaDepoId === anaDepoId);
  const sahipsizDepolar = depolar.filter(
    (depo) => depo.depoTuru !== 'Depo' && !anaDepolar.some((ana) => ana.id === depo.baglıAnaDepoId)
  );

  return (
    <div className="depo-agaci">
      {anaDepolar.map((anaDepo) => {
        const altDepolar = bagliDepoBul(anaDepo.id);
        return (
          <div className="agac-dal-grubu" key={anaDepo.id}>
            <div className={anaDepo.aktif ? 'agac-node agac-node-ana' : 'agac-node agac-node-ana pasif'}>
              <span className="agac-node-tur">Ana Depo</span>
              <span className="agac-node-ad">{anaDepo.depoAdi}</span>
              <span className="agac-node-kod">{anaDepo.kod}</span>
              <span className={anaDepo.aktif ? 'aktif-badge aktif' : 'aktif-badge pasif'}>
                <span className="aktif-dot" />
                {anaDepo.aktif ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            {altDepolar.length > 0 && (
              <div className="agac-altlar">
                {altDepolar.map((alt) => (
                  <div className="agac-node-wrapper" key={alt.id}>
                    <div className="agac-baglanti" />
                    <div className={alt.aktif ? 'agac-node' : 'agac-node pasif'}>
                      <span className="agac-node-tur">{alt.depoTuru}</span>
                      <span className="agac-node-ad">{alt.depoAdi}</span>
                      <span className="agac-node-kod">{alt.kod}</span>
                      <span className={alt.aktif ? 'aktif-badge aktif' : 'aktif-badge pasif'}>
                        <span className="aktif-dot" />
                        {alt.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {sahipsizDepolar.length > 0 && (
        <div className="agac-dal-grubu">
          <div className="agac-node agac-node-ana agac-node-sahipsiz">
            <span className="agac-node-tur">Bağlantısız</span>
            <span className="agac-node-ad">Ana depoya bağlı olmayan tanımlar</span>
          </div>
          <div className="agac-altlar">
            {sahipsizDepolar.map((alt) => (
              <div className="agac-node-wrapper" key={alt.id}>
                <div className="agac-baglanti" />
                <div className={alt.aktif ? 'agac-node' : 'agac-node pasif'}>
                  <span className="agac-node-tur">{alt.depoTuru}</span>
                  <span className="agac-node-ad">{alt.depoAdi}</span>
                  <span className="agac-node-kod">{alt.kod}</span>
                  <span className={alt.aktif ? 'aktif-badge aktif' : 'aktif-badge pasif'}>
                    <span className="aktif-dot" />
                    {alt.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DepoAgaci;
