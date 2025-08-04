import React, { useState, useMemo, useEffect } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 모달이 열릴 때마다 검색어 초기화
  useEffect(() => {
    if (showAddTravel) {
      setSearchQuery('');
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [showAddTravel]);

  // 선택된 국가가 변경될 때 검색어 업데이트
  useEffect(() => {
    if (newTravelData.country && countryData[newTravelData.country]) {
      const countryInfo = countryData[newTravelData.country];
      setSearchQuery(`${countryInfo.koreanName} (${newTravelData.country})`);
    } else if (!newTravelData.country) {
      setSearchQuery('');
    }
  }, [newTravelData.country]);

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

  // 국가 선택 함수
  const selectCountry = (englishName) => {
    setNewTravelData({...newTravelData, country: englishName});
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCountries[selectedIndex]) {
          selectCountry(filteredCountries[selectedIndex][0]);
        } else if (filteredCountries.length === 1) {
          selectCountry(filteredCountries[0][0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 여행지 추가 함수 래퍼
  const handleAddTravel = async () => {
    await addTravelDestination();
    // 추가 성공 후 검색어도 리셋
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setShowAddTravel(false);
    setNewTravelData({
      country: '',
      cities: '',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  if (!showAddTravel) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
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
                setSelectedIndex(-1);
                // 검색어가 변경되면 기존 선택 해제
                if (newTravelData.country) {
                  setNewTravelData({...newTravelData, country: ''});
                }
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
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
                  filteredCountries.map(([englishName, data], index) => (
                    <div
                      key={englishName}
                      onClick={() => selectCountry(englishName)}
                      className={`px-4 py-2 cursor-pointer text-white border-b border-slate-700 last:border-b-0 ${
                        index === selectedIndex ? 'bg-slate-600' : 'hover:bg-slate-700'
                      }`}
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
            onClick={handleAddTravel}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            추가
          </button>
          <button
            onClick={handleCloseModal}
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
