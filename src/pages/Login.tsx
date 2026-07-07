
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/lots');
  };

  return (
    <div className="page-shell">
      <div className="login-card">
        <div className="left-panel">
          <div className="brand">
            <div className="brand-icon">B</div>
            <div>
              <h1>Balyalama</h1>
              <p>Yenilikçi deneyimlere giriş yap</p>
            </div>
          </div>

          <h2>Tekrar hoş geldin</h2>
          <p className="subtitle">
            Hesabına giriş yaparak proje akışını devam ettirebilirsin.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">E-posta</label>
            <input id="email" type="email" placeholder="ornek@email.com" />

            <label htmlFor="password">Şifre</label>
            <input id="password" type="password" placeholder="••••••••" />

            <div className="row-between">
              <label className="check-row">
                <input type="checkbox" />
                <span>Beni hatırla</span>
              </label>
              <a href="#">Şifremi unuttum</a>
            </div>

            <button type="submit">Giriş Yap</button>
          </form>

          <div className="divider">veya</div>

          <div className="social-buttons">
            <button type="button" className="social-btn">
              Google
            </button>
            <button type="button" className="social-btn">
              Apple
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="hero-content">
            <p className="eyebrow">Yeni nesil platform</p>
            <h3>İşlerini hızlı, güvenli ve modern bir deneyimle yönet.</h3>
            <p>
              Balyalama ile ekiplerin, projelerin ve süreçlerin hepsini tek
              ekrandan takip et.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
