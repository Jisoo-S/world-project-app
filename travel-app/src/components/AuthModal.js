import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { countryData } from '../data/countryData';

const AuthModal = ({ showAuth, setShowAuth, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeCountry, setHomeCountry] = useState('South Korea');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <button
            onClick={() => setShowAuth(false)}
            className="text-slate-400 hover:text-red-400 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                홈 국가 선택
              </label>
              <select
                value={homeCountry}
                onChange={(e) => setHomeCountry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
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
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
