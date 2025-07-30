import React from 'react';
import { countryData } from '../data/countryData';

export const AddTravelModal = ({ 
  showAddTravel, 
  setShowAddTravel, 
  newTravelData, 
  setNewTravelData, 
  addTravelDestination 
}) => {
  if (!showAddTravel) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowAddTravel(false);
          setNewTravelData({
            country: '',
            cities: '',
            startDate: '',
            endDate: ''
          });
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-md w-full mx-4">
        <h2 className="text-white font-bold text-xl mb-4">✈️ 여행지 추가</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-2">국가</label>
            <select
              value={newTravelData.country}
              onChange={(e) => setNewTravelData({...newTravelData, country: e.target.value})}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">국가를 선택하세요</option>
              {Object.entries(countryData).map(([englishName, data]) => (
                <option key={englishName} value={englishName}>{data.koreanName} ({englishName})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-slate-300 text-sm block mb-2">방문 도시</label>
            <input
              type="text"
              value={newTravelData.cities}
              onChange={(e) => setNewTravelData({...newTravelData, cities: e.target.value})}
              placeholder="예: Seoul, Busan, Jeju"
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm block mb-2">시작일</label>
              <input
                type="date"
                value={newTravelData.startDate}
                onChange={(e) => setNewTravelData({...newTravelData, startDate: e.target.value})}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">종료일</label>
              <input
                type="date"
                value={newTravelData.endDate}
                onChange={(e) => setNewTravelData({...newTravelData, endDate: e.target.value})}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={addTravelDestination}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            추가
          </button>
          <button
            onClick={() => {
              setShowAddTravel(false);
              setNewTravelData({
                country: '',
                cities: '',
                startDate: '',
                endDate: ''
              });
            }}
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-600 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditTravelModal = ({ editingTrip, setEditingTrip, updateTravelDestination }) => {
  if (!editingTrip) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setEditingTrip(null);
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-md w-full mx-4">
        <h2 className="text-white font-bold text-xl mb-4">✈️ 여행지 수정</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-2">방문 도시</label>
            <input
              type="text"
              value={editingTrip.cities.join(', ')}
              onChange={(e) => setEditingTrip({...editingTrip, cities: e.target.value.split(',').map(c => c.trim())})}
              placeholder="예: Seoul, Busan, Jeju"
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm block mb-2">시작일</label>
              <input
                type="date"
                value={editingTrip.startDate}
                onChange={(e) => setEditingTrip({...editingTrip, startDate: e.target.value})}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">종료일</label>
              <input
                type="date"
                value={editingTrip.endDate}
                onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={updateTravelDestination}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            수정
          </button>
          <button
            onClick={() => setEditingTrip(null)}
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-600 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export const DateErrorModal = ({ showDateErrorModal, setShowDateErrorModal }) => {
  if (!showDateErrorModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowDateErrorModal(false);
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-sm w-full mx-4 text-center">
        <h3 className="text-red-400 font-bold text-xl mb-4">⚠️ 날짜 입력 오류</h3>
        <p className="text-white text-md mb-6">시작일은 종료일보다 빠르거나 같아야 합니다.</p>
        <button
          onClick={() => setShowDateErrorModal(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
        >
          확인
        </button>
      </div>
    </div>
  );
};
