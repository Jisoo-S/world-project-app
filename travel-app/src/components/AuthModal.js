import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { countryData } from '../data/countryData';

const AuthModal = ({ showAuth, setShowAuth, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeCountry, setHomeCountry] = useState('South Korea');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const modalRef = useRef(null);

  // 모바일 키보드 처리를 위한 useEffect
  useEffect(() => {
    if (showAuth) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
      
      // iOS Safari에서 키보드 관련 문제 해결
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
      
      // 모달이 열린 후 첫 번째 input에 포커스 (키보드 자동 열기)
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
          // 모바일에서 추가 클릭 이벤트 발생
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            emailInputRef.current.click();
          }
        }
      }, 100);
    } else {
      // 모달이 닫힐 때 원래 상태로 복원
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showAuth]);

  // 키보드가 열릴 때 모달 위치 조정
  useEffect(() => {
    const handleResize = () => {
      if (modalRef.current && window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        
        if (viewportHeight < windowHeight) {
          // 키보드가 열림
          modalRef.current.style.height = `${viewportHeight}px`;
          modalRef.current.style.alignItems = 'flex-start';
          modalRef.current.style.paddingTop = '20px';
        } else {
          // 키보드가 닫힘
          modalRef.current.style.height = '';
          modalRef.current.style.alignItems = '';
          modalRef.current.style.paddingTop = '';
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // 회원가입
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // 사용자 프로필 생성
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: authData.user.id,
                email: authData.user.email,
                home_country: homeCountry,
              },
            ]);

          if (profileError) throw profileError;
        }

        alert('회원가입이 완료되었습니다!');
      } else {
        // 로그인
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          onAuthSuccess(authData.user);
          setShowAuth(false);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (e) => {
    // 입력 필드가 화면 중앙에 오도록 스크롤
    setTimeout(() => {
      if (e.target) {
        const rect = e.target.getBoundingClientRect();
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const targetY = rect.top + rect.height / 2;
        const centerY = viewportHeight / 2;
        
        if (targetY > centerY) {
          window.scrollBy({
            top: targetY - centerY,
            behavior: 'smooth'
          });
        }
      }
    }, 300);
  };

  if (!showAuth) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={(e) => {
        // 배경 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          setShowAuth(false);
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 w-full max-w-md mx-4 my-auto max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <button
            onClick={() => setShowAuth(false)}
            className="text-slate-400 hover:text-red-400 text-2xl transition-colors p-2"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              이메일
            </label>
            <input
              ref={emailInputRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              style={{ fontSize: '16px', WebkitAppearance: 'none' }}
              onFocus={handleInputFocus}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              비밀번호
            </label>
            <input
              ref={passwordInputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              enterKeyHint={isSignUp ? "next" : "done"}
              style={{ fontSize: '16px', WebkitAppearance: 'none' }}
              onFocus={handleInputFocus}
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="homeCountry" className="block text-sm font-medium text-slate-300 mb-2">
                홈 국가 선택
              </label>
              <select
                id="homeCountry"
                value={homeCountry}
                onChange={(e) => setHomeCountry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                style={{ fontSize: '16px', WebkitAppearance: 'none' }}
              >
                {Object.entries(countryData).map(([englishName, data]) => (
                  <option key={englishName} value={englishName}>
                    {data.koreanName} ({englishName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors p-2"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;