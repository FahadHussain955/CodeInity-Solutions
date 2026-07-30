// =============================================================================
// LOGIN PAGE — Institutional Login UI
// Converted from React.createClass to modern functional component.
// Route: /login (standalone — outside MainLayout)
// =============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage — Institutional trading portal login screen.
 * Glassmorphism design with AI illustration panel.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // FUTURE: Replace with Supabase auth call
    // For testing: navigate straight to dashboard
    navigate('/');
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .login-bg {
          background-color: #F6F1E4;
          background-image: radial-gradient(circle at 100% 0%, #fdf7ff 0%, #F6F1E4 100%);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 20px 40px rgba(30, 27, 20, 0.04), 0 4px 8px rgba(30, 27, 20, 0.02);
        }
        .btn-primary-login {
          background: linear-gradient(135deg, #4f378a 0%, #059669 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
        }
        .btn-primary-login:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(79, 55, 138, 0.25);
        }
        .input-glass {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
          font-size: 0.95rem;
          color: #1c1b1f;
          outline: none;
          width: 100%;
        }
        .input-glass:focus {
          background: rgba(255, 255, 255, 0.9);
          border-color: #4f378a;
          box-shadow: 0 0 0 3px rgba(79, 55, 138, 0.12);
        }
        .input-glass::placeholder {
          color: rgba(100, 90, 120, 0.5);
        }
        .login-card-rotate-neg { transform: rotate(-2deg); }
        .login-card-rotate-neg:hover { transform: rotate(0deg); }
        .login-card-rotate-pos { transform: rotate(1deg) translateX(1rem); }
        .login-card-rotate-pos:hover { transform: rotate(0deg) translateX(1rem); }
      `}</style>

      <div className="login-bg" style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* ── Left Side: Illustration Area ── */}
          <div
            style={{
              display: 'none',
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(246,241,228,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 50%',
            }}
            className="lg-illustration-panel"
          >
            {/* Decorative radial overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.3,
              background: 'radial-gradient(ellipse at center, #ede7f6, #F6F1E4)',
              mixBlendMode: 'multiply',
            }} />

            <div style={{
              position: 'relative', zIndex: 10, width: '100%',
              maxWidth: '480px', padding: '2rem',
              display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center',
            }}>
              {/* Card 1 — Chart */}
              <div className={`glass-panel login-card-rotate-neg`}
                style={{
                  borderRadius: '12px', padding: '1.5rem', width: '100%',
                  transition: 'transform 0.5s ease',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#4f378a' }}>show_chart</span>
                    <span style={{ fontWeight: 600, color: '#4f378a', fontSize: '0.9rem' }}>AAPL Predictive Model</span>
                  </div>
                  <span style={{
                    color: '#059669', fontSize: '0.75rem', fontWeight: 600,
                    padding: '4px 12px', background: 'rgba(5,150,105,0.1)', borderRadius: '999px',
                  }}>+2.4% Probability</span>
                </div>
                <img
                  alt="3D Stock Chart"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_X2aEckSkqDMCymDSusisWsX8_qWU0AtmzoAPC5Bxi0EOVgaZza8ZRn9jRJt14tA9MXyCVN2aS_r2Psz_RcUgRc6C-vBmqzHpXgTiHeX_F4UYwajihbiA1BnP_1Z1M44XIzauugoq0VrOENYgb6mI9wQM60e0_lO-Y3GMllnWN3dVLA0WbT5vNpXKl3fDDN9WeDM82itu108WFn-pb-qqi_1I4h8N2Hgls6oaRO7ey_sPov_0OsYv"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)' }}
                />
              </div>

              {/* Card 2 — AI Assistant */}
              <div className={`glass-panel login-card-rotate-pos`}
                style={{
                  borderRadius: '12px', padding: '1.5rem', width: '83%', alignSelf: 'flex-end',
                  transition: 'transform 0.5s ease',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(79,55,138,0.1)', border: '1px solid rgba(79,55,138,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#4f378a', fontSize: '24px' }}>psychology</span>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#4f378a', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      Aegis Intelligence
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#49454f', lineHeight: 1.6 }}>
                      Market sentiment analysis indicates a strong divergence in tech equities.
                      Rebalancing suggested based on historical volatility patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Side: Login Form ── */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '1.5rem',
          }}>
            <div className="glass-panel" style={{
              width: '100%', maxWidth: '448px', borderRadius: '24px', padding: '2.5rem',
            }}>
              {/* Logo & Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  alt="Aegis Trading Logo"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLvzs00oibJUHnQuBjlVmewUDqNQI9nC5uWLNYac9crpAowbEKFpn6_nC2SXw0pnAgm7tOqD0pgRdpqlCJ_VVFuKFiCfwVB__dC9kWIviMBK-JB0q1VfX4JPTOPpmku9XosjvNvQOlY0ILZL7Zx-PWkp3kBH4PNj6ZOKpQDTX8CE2Kdz1ceAYaZlaUpwgVERlJFMDSQkfSv400vXrFdAE5tAra4WyPk93MGJ1Wenv6CgRjcJHXeQnqE-HQ"
                  style={{ width: '80px', height: '80px', marginBottom: '1rem', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                />
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#4f378a', marginBottom: '0.5rem', fontFamily: 'Sora, sans-serif' }}>
                  Welcome Back
                </h1>
                <p style={{ fontSize: '0.95rem', color: '#49454f' }}>
                  Sign in to your institutional trading portal.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Email */}
                <div>
                  <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#49454f', marginBottom: '0.5rem' }}>
                    Institutional Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#79747e', fontSize: '20px' }}>mail</span>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="investor@fund.com"
                      className="input-glass"
                      style={{ borderRadius: '12px', padding: '0.75rem 1rem 0.75rem 3rem' }}
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="login-password" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#49454f' }}>
                      Password
                    </label>
                    <a href="#" style={{ fontSize: '0.85rem', color: '#4f378a', textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#79747e', fontSize: '20px' }}>lock</span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-glass"
                      style={{ borderRadius: '12px', padding: '0.75rem 3rem 0.75rem 3rem' }}
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#79747e', display: 'flex' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      data-testid="login-toggle-password"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember device */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="login-remember"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f378a' }}
                    data-testid="login-remember-checkbox"
                  />
                  <label htmlFor="login-remember" style={{ fontSize: '0.85rem', color: '#49454f', cursor: 'pointer' }}>
                    Remember this device
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary-login"
                  style={{ borderRadius: '12px', padding: '0.875rem', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(79,55,138,0.2)' }}
                  data-testid="login-submit-btn"
                >
                  Sign In Securely
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(121,116,126,0.3)' }} />
                <span style={{ fontSize: '0.85rem', color: '#79747e' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(121,116,126,0.3)' }} />
              </div>

              {/* Social Logins */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="glass-panel"
                  style={{ flex: 1, borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  data-testid="login-google-btn"
                >
                  <img alt="Google" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoQOX__V7WiyXSyQwboRBCi_dv6VVBjXcaTgZQHDONcVst02HDgdISfnrGbWx4Uhj_7-vpchXQM3czIvrdH3VPdgJPyU-INsDRtZRHM4kKIkFVwxGm_77bGACJq2hpMuktHEFMxefJ6CBcyiD609FpG8gGa0QYr2esJ79HA5LBRbl_qeFpxTFWw1Vpc_CQmwRDle44Ax31CvRKNGUq8uV3aMMmwOYTHdDo9Ix6QOPyLQA6koF1L8vi" style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1c1b1f' }}>Google</span>
                </button>
                <button
                  type="button"
                  className="glass-panel"
                  style={{ flex: 1, borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  data-testid="login-apple-btn"
                >
                  <img alt="Apple" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrihMwH9OWHp8UoNFeJbhLyPhx5fwQsUsX1_qNxC2qaoVxmIYJvID_3iqqq_i-hoXagSPjs6fGGOvgCfnOQi2_7Xaau96zSN-rXUxrDhYqPfOC4jAGN4zJ-Y7JChJJ6uSzet1Umfp0I2OvtXRhy8Jhq1OW5DH78rQ8Z6Vq7_2hfrOlH-GLetUqWEa5JGdl8MQFi7BGEEtC34CFZkdPKyLELWVIpBPudj0Knu_lkcAw50kdMtKcsC6t" style={{ width: '20px', height: '20px', opacity: 0.8 }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1c1b1f' }}>Apple</span>
                </button>
              </div>

              {/* Footer */}
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#49454f', marginTop: '1.5rem' }}>
                Don&apos;t have an account?{' '}
                <a href="#" style={{ color: '#4f378a', fontWeight: 500, textDecoration: 'none' }}>
                  Apply for Access
                </a>
              </p>

              {/* SOC2 Badge */}
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'rgba(121,116,126,0.6)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified_user</span>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  SOC2 Type II Certified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive style for illustration panel */}
        <style>{`
          @media (min-width: 1024px) {
            .lg-illustration-panel { display: flex !important; }
          }
        `}</style>
      </div>
    </>
  );
}
