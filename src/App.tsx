import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LotList from './pages/LotList';
import LotDetail from './pages/LotDetail';
import LotNew from './pages/LotNew';
import Tanimlamalar from './pages/Tanimlamalar';
import BalyaList from './pages/BalyaList';
import BalyaDetail from './pages/BalyaDetail';
import HviList from './pages/HviList';
import HviNew from './pages/HviNew';
import BarkodEtiketList from './pages/BarkodEtiketList';
import HareketGecmisiList from './pages/HareketGecmisiList';
import Dashboard from './pages/Dashboard';
import KaliteMotoru from './pages/KaliteMotoru';
import Kumeleme from './pages/Kumeleme';
import OnSerimPlanlari from './pages/OnSerimPlanlari';
import SerimPlanlari from './pages/SerimPlanlari';
import Raporlar from './pages/Raporlar';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lots" element={<LotList />} />
      <Route path="/lots/new" element={<LotNew />} />
      <Route path="/lots/:lotNo" element={<LotDetail />} />
      <Route path="/tanimlamalar/depolar" element={<Tanimlamalar />} />
      <Route path="/balyalar" element={<BalyaList />} />
      <Route path="/balyalar/:balyaId" element={<BalyaDetail />} />
      <Route path="/hvi-analizleri" element={<HviList />} />
      <Route path="/hvi-analizleri/yeni" element={<HviNew />} />
      <Route path="/barkod-etiket" element={<BarkodEtiketList />} />
      <Route path="/hareket-gecmisi" element={<HareketGecmisiList />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/kalite-motoru" element={<KaliteMotoru />} />
      <Route path="/kumeleme" element={<Kumeleme />} />
      <Route path="/on-serim-planlari" element={<OnSerimPlanlari />} />
      <Route path="/serim-planlari" element={<SerimPlanlari />} />
      <Route path="/raporlar" element={<Raporlar />} />
    </Routes>
  );
}

export default App;
