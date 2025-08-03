import React, { useState, useMemo } from 'react';
import { countryData } from '../data/countryData';

export const AddTravelModal = ({ 
  showAddTravel, 
  setShowAddTravel, 
  newTravelData, 
  setNewTravelData, 
  addTravelDestination 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // 국가 리스트를 가나다 순으로 정렬
  const sortedCountries = useMemo(() => {
    return Object.entries(countryData).sort((a, b) => {
      const aKorean = a[1].koreanName;
      const bKorean = b[1].koreanName;
      return aKorean.localeCompare(bKorean, 'ko');
    });
  }, []);

  // 검색 쿼리에 따른 필터링
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return sortedCountries;
    
    const query = searchQuery.toLowerCase();
    return sortedCountries.filter(([englishName, data]) => 
      englishName.toLowerCase().includes(query) || 
      data.koreanName.includes(searchQuery)
    );
  }, [searchQuery, sortedCountries]);

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
          setSearchQuery('');
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-md w-full mx-4">
        <h2 className="text-white font-bold text-xl mb-4">✈️ 여행지 추가</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="text-slate-300 text-sm block mb-2">국가</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="국가명을 입력하세요"
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            
            {/* 선택된 국가 표시 */}
            {newTravelData.country && (
              <div className="mt-2 text-sm text-blue-400">
                선택됨: {countryData[newTravelData.country].koreanName} ({newTravelData.country})
              </div>
            )}
            
            {/* 드롭다운 리스트 */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(([englishName, data]) => (
                    <div
                      key={englishName}
                      onClick={() => {
                        setNewTravelData({...newTravelData, country: englishName});
                        setSearchQuery(`${data.koreanName} (${englishName})`);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-white border-b border-slate-700 last:border-b-0"
                    >
                      {data.koreanName} ({englishName})
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-slate-400">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            )}
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
              setSearchQuery('');
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
