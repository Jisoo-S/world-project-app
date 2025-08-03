import React, { useState, useEffect, useRef } from 'react';
import { countryData } from '../data/countryData';
import { supabase } from '../supabaseClient';

const SettingsModal = ({ showSettings, setShowSettings, user, homeCountry, setHomeCountry }) => {
  const modalContentRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedHomeCountry, setSelectedHomeCountry] = useState(homeCountry);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    setSelectedHomeCountry(homeCountry);
  }, [homeCountry]);

  const handleUpdateSettings = async () => {
    if (!user) {
      setUpdateMessage('로그인이 필요합니다.');
      return;
    }

    if (password && password !== confirmPassword) {
      setUpdateMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      // 홈 국가 업데이트
      if (selectedHomeCountry !== homeCountry) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ home_country: selectedHomeCountry })
          .eq('id', user.id);

        if (profileError) throw profileError;
        setHomeCountry(selectedHomeCountry);
      }

      // 비밀번호 업데이트
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) throw passwordError;
      }

      setUpdateMessage('설정이 성공적으로 업데이트되었습니다.');
      setTimeout(() => {
        setShowSettings(false);
        setPassword('');
        setConfirmPassword('');
        setUpdateMessage('');
        setShowPasswordChange(false);
      }, 1500);
    } catch (error) {
      console.error('Error updating settings:', error);
      setUpdateMessage('업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!showSettings) return null;

  const handleOverlayClick = (event) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
      setShowSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20" ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">⚙️ 설정</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* 홈 국가 설정 */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            🏠 홈 국가
          </label>
          <select
            value={selectedHomeCountry}
            onChange={(e) => setSelectedHomeCountry(e.target.value)}
            className="w-full bg-slate-800/80 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            {Object.keys(countryData).sort().map(country => (
              <option key={country} value={country}>
                {countryData[country]?.koreanName || country} ({country})
              </option>
            ))}
          </select>
        </div>

        {/* 비밀번호 변경 */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            🔒 비밀번호 변경
          </label>
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-all text-sm"
            >
              비밀번호 변경하기
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full bg-slate-800/80 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full bg-slate-800/80 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* 업데이트 메시지 */}
        {updateMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            updateMessage.includes('성공') 
              ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
              : 'bg-red-600/20 text-red-400 border border-red-500/30'
          }`}>
            {updateMessage}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSettings(false);
              setShowPasswordChange(false);
              setPassword('');
              setConfirmPassword('');
              setUpdateMessage('');
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            취소
          </button>
          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? '업데이트 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
