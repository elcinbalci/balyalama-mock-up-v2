import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import { mockBalyalar } from '../data/mockBalyalar';
import { mockHviAnalizleri } from '../data/mockHviAnalizleri';
import { mockLots } from '../data/mockLots';
import './Dashboard.css';

const KATEGORIK_RENKLER = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const SEQUENTIAL_MAVI = ['#86b6ef', '#3987e5', '#256abf', '#0d366b'];

function gruplaVeSay<T>(items: T[], keyFn: (item: T) => string): { ad: string; sayi: number }[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([ad, sayi]) => ({ ad, sayi }));
}

function Dashboard() {
  const aktifLotSayisi = mockLots.filter((lot) => lot.durum !== 'Tamamlandı').length;
  const toplamBalya = mockBalyalar.length;
  const analizBekleyen = mockBalyalar.filter((b) => b.durum === 'Analiz Bekleniyor').length;
  const kaliteHesaplanan = mockBalyalar.filter((b) => b.kaliteSkoru !== null).length;
  const onSerimdeki = mockBalyalar.filter((b) => b.durum === 'Ön Serimde').length;
  const serimdeki = mockBalyalar.filter((b) => b.durum === 'Serimde').length;
  const kullanilan = mockBalyalar.filter((b) => b.durum === 'Kullanıldı').length;
  const pasif = mockBalyalar.filter((b) => b.durum === 'Pasif').length;

  const menseiVerisi = useMemo(() => gruplaVeSay(mockBalyalar, (b) => b.mensei), []);

  const kaliteDagilimVerisi = useMemo(() => {
    const araliklar = [
      { ad: '0-59', min: 0, max: 59 },
      { ad: '60-69', min: 60, max: 69 },
      { ad: '70-79', min: 70, max: 79 },
      { ad: '80-89', min: 80, max: 89 },
      { ad: '90-100', min: 90, max: 100 },
    ];
    const skorlar = mockBalyalar.filter((b) => b.kaliteSkoru !== null).map((b) => b.kaliteSkoru as number);
    return araliklar.map((aralik, index) => ({
      ad: aralik.ad,
      sayi: skorlar.filter((skor) => skor >= aralik.min && skor <= aralik.max).length,
      renk: SEQUENTIAL_MAVI[index % SEQUENTIAL_MAVI.length],
    }));
  }, []);

  const depoVerisi = useMemo(() => gruplaVeSay(mockBalyalar, (b) => b.anaDepo), []);

  const gunlukAnalizVerisi = useMemo(() => {
    const map = new Map<string, number>();
    mockHviAnalizleri.forEach((h) => {
      map.set(h.analizTarihi, (map.get(h.analizTarihi) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tarih, sayi]) => ({ tarih, sayi }));
  }, []);

  const kumeKaliteVerisi = useMemo(() => {
    const map = new Map<string, number[]>();
    mockBalyalar.forEach((b) => {
      if (!b.kumeId || b.kaliteSkoru === null) return;
      const liste = map.get(b.kumeId) ?? [];
      liste.push(b.kaliteSkoru);
      map.set(b.kumeId, liste);
    });
    return Array.from(map.entries())
      .map(([kumeId, skorlar]) => ({
        ad: kumeId,
        ortalama: Math.round((skorlar.reduce((t, s) => t + s, 0) / skorlar.length) * 10) / 10,
      }))
      .sort((a, b) => a.ad.localeCompare(b.ad));
  }, []);

  const serimVerimlilikVerisi = useMemo(
    () => [
      { ad: 'Kullanıldı', sayi: kullanilan, renk: KATEGORIK_RENKLER[0] },
      { ad: 'Aktif Süreçte', sayi: toplamBalya - kullanilan - pasif, renk: KATEGORIK_RENKLER[1] },
      { ad: 'Pasif / Açıkta', sayi: pasif, renk: KATEGORIK_RENKLER[5] },
    ],
    [kullanilan, pasif, toplamBalya]
  );

  return (
    <AppLayout>
      <div className="dashboard-page">
        <AppHeader title="Dashboard" subtitle="Tesis genelinde canlı KPI ve grafikler" />
        <main className="dashboard-content">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-deger">{aktifLotSayisi}</div>
              <div className="kpi-label">Aktif Lot</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{toplamBalya}</div>
              <div className="kpi-label">Toplam Balya</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{analizBekleyen}</div>
              <div className="kpi-label">Analiz Bekleyen Balya</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{kaliteHesaplanan}</div>
              <div className="kpi-label">Kalite Skoru Hesaplanan</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{onSerimdeki}</div>
              <div className="kpi-label">Ön Serimdeki Balya</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{serimdeki}</div>
              <div className="kpi-label">Serimdeki Balya</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{kullanilan}</div>
              <div className="kpi-label">Kullanılan Balya</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-deger">{pasif}</div>
              <div className="kpi-label">Pasif / Açıkta Kalan</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h2>Menşe Bazlı Balya Dağılımı</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={menseiVerisi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ad" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="sayi" name="Balya Sayısı" fill="#2a78d6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Kalite Skoru Dağılımı</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kaliteDagilimVerisi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ad" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="sayi" name="Balya Sayısı" radius={[6, 6, 0, 0]}>
                    {kaliteDagilimVerisi.map((d) => (
                      <Cell key={d.ad} fill={d.renk} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Depo Doluluk Oranı</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={depoVerisi} dataKey="sayi" nameKey="ad" outerRadius={90} label>
                    {depoVerisi.map((d, index) => (
                      <Cell key={d.ad} fill={KATEGORIK_RENKLER[index % KATEGORIK_RENKLER.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Günlük Analiz Sayısı</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={gunlukAnalizVerisi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="tarih" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="sayi" name="Analiz Sayısı" stroke="#1baf7a" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Küme Bazlı Ortalama Kalite</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kumeKaliteVerisi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ad" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="ortalama" name="Ortalama Kalite" radius={[6, 6, 0, 0]}>
                    {kumeKaliteVerisi.map((d, index) => (
                      <Cell key={d.ad} fill={KATEGORIK_RENKLER[index % KATEGORIK_RENKLER.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Serim Verimlilik Analizi</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={serimVerimlilikVerisi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ad" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="sayi" name="Balya Sayısı" radius={[6, 6, 0, 0]}>
                    {serimVerimlilikVerisi.map((d) => (
                      <Cell key={d.ad} fill={d.renk} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
