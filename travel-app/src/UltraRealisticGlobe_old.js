import React, { useEffect, useRef, useState } from 'react';
import { countryData, getVisitStyle, getGlobeTextures } from './data/countryData';
import LoadingScreen from './components/LoadingScreen';
import TravelStatsPanel from './components/TravelStatsPanel';
import GlobeControls from './components/GlobeControls';
import SelectedCountryPanel from './components/SelectedCountryPanel';
import { AddTravelModal, EditTravelModal, DateErrorModal, AllTripsModal, AlertDialog } from './components/Modals';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import LineInfoPanel from './components/LineInfoPanel';
import ResetPasswordModal from './components/ResetPasswordModal';
import ConfirmModal from './components/ConfirmModal';
import WelcomeModal from './components/WelcomeModal';
import { supabase } from './supabaseClient';
import R3FGlobe from './components/R3FGlobe';

const UltraRealisticGlobe = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('로딩 중...');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [globeMode, setGlobeMode] = useState('satellite');
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(() => window.innerHeight < window.innerWidth);
  const [isIPad, setIsIPad] = useState(false); // iPad 감지용은 더 이상 사용하지 않지만, 기존 구조 호환용으로 남김
  const [renderKey, setRenderKey] = useState(0); // 강제 리렌더링용

  useEffect(() => {
    const handleResize = () => {
      // 화면 너비와 방향 모두 업데이트
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
      setIsIPad(false);
      setRenderKey(prev => prev + 1); // 강제 리렌더링
    };
    
    const handleOrientationChange = () => {
      // 화면 회전 시 강제 리렌더링
      setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
        setIsLandscape(window.innerHeight < window.innerWidth);
        setIsIPad(false);
        setRenderKey(prev => prev + 1); // 강제 리렌더링
      }, 150);
    };
    
    // 초기 실행
    handleResize();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  const [userTravelData, setUserTravelData] = useState({});
  const [showAddTravel, setShowAddTravel] = useState(false);
  const [newTravelData, setNewTravelData] = useState({
    country: '',
    cities: '',
    startDate: '',
    endDate: ''
  });
  const [showDateErrorModal, setShowDateErrorModal] = useState(false);
  const [showGlobeControlsOnMobile, setShowGlobeControlsOnMobile] = useState(true);
  const [showContinentPanel, setShowContinentPanel] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const lineInfoRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [homeCountry, setHomeCountry] = useState('South Korea');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTripData, setDeleteTripData] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hideBottomUI, setHideBottomUI] = useState(false); // 패널이 열릴 때 하단 UI 숨김

  // selectedCountry나 selectedLine이 열리면 하단 UI 숨김
  useEffect(() => {
    if (selectedCountry || selectedLine) {
      setHideBottomUI(true);
    } else {
      setHideBottomUI(false);
    }
  }, [selectedCountry, selectedLine]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lineInfoRef.current && !lineInfoRef.current.contains(event.target)) {
        setSelectedLine(null);
        setSelectedLineIndex(0);
      }
    };

    if (selectedLine) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedLine]);

  useEffect(() => {
    if (selectedCountry) {
      setShowMobileStats(false);
      setShowAllTrips(false);
      setShowContinentPanel(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (showMobileStats) {
      setSelectedCountry(null);
      setShowAllTrips(false);
      setShowContinentPanel(false);
    }
  }, [showMobileStats]);

  useEffect(() => {
    if (showAllTrips) {
      setSelectedCountry(null);
      setShowMobileStats(false);
      setShowContinentPanel(false);
    }
  }, [showAllTrips]);

  useEffect(() => {
    if (showAddTravel || showAuth || showSettings || editingTrip || showDeleteConfirm || showDateErrorModal || showAlertModal) {
      setShowContinentPanel(false);
    }
  }, [showAddTravel, showAuth, showSettings, editingTrip, showDeleteConfirm, showDateErrorModal, showAlertModal]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setIsInitialLoad(false);
        // 로그인하지 않은 사용자에게 환영 모달 표시
        setShowWelcomeModal(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
        // 로그인 성공 시 환영 모달 닫기
        setShowWelcomeModal(false);
      } else {
        setUser(null);
        setUserTravelData({});
        setHomeCountry('South Korea');
        // 로그아웃 시 환영 모달 표시
        setShowWelcomeModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    setIsLoading(true);
    setLoadingStatus('사용자 데이터 로딩 중...');
    const loadedTravelData = {};
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('home_country')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        setHomeCountry(profile.home_country || 'South Korea');
      }

      const { data: travels, error: travelsError } = await supabase
        .from('user_travels')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (travels && !travelsError) {
        travels.forEach(travel => {
          const countryEnglishName = travel.country;
          if (!loadedTravelData[countryEnglishName]) {
            loadedTravelData[countryEnglishName] = {
              visits: 0,
              lastVisit: '',
              cities: [],
              coordinates: countryData[countryEnglishName]?.coords || [0, 0],
              description: '아름다운 여행지',
              trips: []
            };
          }
          
          loadedTravelData[countryEnglishName].trips.push({
            id: travel.id,
            cities: travel.cities,
            startDate: travel.start_date,
            endDate: travel.end_date
          });
          
          loadedTravelData[countryEnglishName].visits++;
          loadedTravelData[countryEnglishName].cities = [...new Set([...loadedTravelData[countryEnglishName].cities, ...travel.cities])];
          
          if (new Date(travel.end_date) > new Date(loadedTravelData[countryEnglishName].lastVisit || '1900-01-01')) {
            loadedTravelData[countryEnglishName].lastVisit = travel.end_date;
          }
        });
        
        setUserTravelData(loadedTravelData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
        setIsLoading(false);
        if(isInitialLoad) setIsInitialLoad(false);
    }
    return loadedTravelData;
  };

  const saveToSupabase = async (countryEnglishName, tripData) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_travels').insert([{ user_id: user.id, country: countryEnglishName, cities: tripData.cities, start_date: tripData.startDate, end_date: tripData.endDate }]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('데이터 저장에 실패했습니다.');
    }
  };

  const updateInSupabase = async (tripId, newTripData) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_travels').update(newTripData).eq('id', tripId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating in Supabase:', error);
      alert('데이터 업데이트에 실패했습니다.');
    }
  };

  const deleteFromSupabase = async (tripId) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_travels').delete().eq('id', tripId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      alert('데이터 삭제에 실패했습니다.');
    }
  };

  const handleAuthSuccess = (authUser, message = '') => {
    setUser(authUser);
    loadUserData(authUser.id);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserTravelData({});
    setHomeCountry('South Korea');
  };

  const updateTravelDestination = async () => {
    if (!editingTrip || !user) return;

    const startDateObj = new Date(editingTrip.startDate);
    const endDateObj = new Date(editingTrip.endDate);

    if (startDateObj > endDateObj) {
      setShowDateErrorModal(true);
      return;
    }

    const newTripData = {
      cities: editingTrip.cities,
      start_date: editingTrip.startDate,
      end_date: editingTrip.endDate,
    };

    await updateInSupabase(editingTrip.id, newTripData);
    const newTravelDataResult = await loadUserData(user.id);
    setEditingTrip(null);

    if (selectedCountry) {
        const updatedCountryData = newTravelDataResult[selectedCountry.country];
        if (updatedCountryData) {
            setSelectedCountry(prev => ({
                ...prev,
                trips: updatedCountryData.trips,
                visits: updatedCountryData.visits,
                cities: updatedCountryData.cities,
                lastVisit: updatedCountryData.lastVisit
            }));
        }
    }
  };

  const addTravelDestination = async () => {
    if (!newTravelData.country || !newTravelData.cities || !newTravelData.startDate || !newTravelData.endDate) {
      setAlertMessage('모든 필드를 입력해주세요.');
      setShowAlertModal(true);
      return;
    }

    const startDateObj = new Date(newTravelData.startDate);
    const endDateObj = new Date(newTravelData.endDate);

    if (startDateObj > endDateObj) {
      setShowDateErrorModal(true);
      return;
    }

    const countryEnglishName = newTravelData.country;
    if (!countryData[countryEnglishName]) {
        setAlertMessage('선택한 국가를 찾을 수 없습니다.');
        setShowAlertModal(true);
        return;
    }

    const newTrip = {
      cities: newTravelData.cities.split(',').map(s => s.trim()),
      startDate: newTravelData.startDate,
      endDate: newTravelData.endDate
    };

    await saveToSupabase(countryEnglishName, newTrip);
    await loadUserData(user.id);

    setNewTravelData({
      country: '',
      cities: '',
      startDate: '',
      endDate: ''
    });
    setShowAddTravel(false);
  };

  const deleteCityTrip = async (tripToDelete) => {
    setDeleteTripData(tripToDelete);
    setShowDeleteConfirm(true);
  };

  const executeDeleteCityTrip = async () => {
    if (!deleteTripData || !user) return;

    await deleteFromSupabase(deleteTripData.id);
    await loadUserData(user.id);

    setShowDeleteConfirm(false);
    setDeleteTripData(null);
    setSelectedCountry(null);
  };

  const goToCountry = (countryEnglishName, altitude) => {
    if (globeRef.current) {
      globeRef.current.goToCountry(countryEnglishName, altitude);
    }
  };

  const resetView = () => {
    if (globeRef.current) {
      globeRef.current.resetView();
    }
  };

  const toggleRotation = () => {
    if (globeRef.current) {
      globeRef.current.toggleRotation();
    }
  };

  const changeGlobeMode = (mode) => {
    setGlobeMode(mode);
  };

  const handlePointClick = (point) => {
      setSelectedCountry(point);
      setSelectedLine(null);
  };

  const handleLineClick = (line) => {
    console.log('Line clicked:', line);
    setSelectedLine(line);
    setSelectedCountry(null);
  };

  const getTravelStats = () => {
    const totalCountries = Object.keys(userTravelData).length;
    const totalVisits = Object.values(userTravelData).reduce((sum, data) => sum + data.visits, 0);
    const totalCities = Object.values(userTravelData).reduce((sum, data) => sum + data.cities.length, 0);
    return { totalCountries, totalVisits, totalCities };
  };

  const getDeleteMessage = () => {
    if (!deleteTripData) return '';
    const countryName = countryData[deleteTripData.country]?.koreanName || deleteTripData.country;
    return `${countryName} (${deleteTripData.country})\n\n📍 ${deleteTripData.cities.join(' • ')}\n📅 ${deleteTripData.startDate} ~ ${deleteTripData.endDate}\n\n이 여행 기록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`
  }

  const stats = getTravelStats();

  // 모바일 버튼 위치 결정 로직

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 별 배경 + 지구본 레이어 (z-0) */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: `
            radial-gradient(4px 4px at 50px 80px, #fff, transparent),
            radial-gradient(3px 3px at 180px 40px, #fff, transparent),
            radial-gradient(3px 3px at 320px 150px, #fff, transparent),
            radial-gradient(3px 3px at 420px 90px, #fff, transparent),
            radial-gradient(4px 4px at 280px 200px, #fff, transparent),
            radial-gradient(4px 4px at 120px 250px, #fff, transparent),
            radial-gradient(3px 3px at 380px 300px, #fff, transparent),
            radial-gradient(3px 3px at 80px 350px, #fff, transparent),
            radial-gradient(4px 4px at 150px 320px, #fff, transparent),
            radial-gradient(3px 3px at 450px 180px, #fff, transparent),
            radial-gradient(3px 3px at 220px 60px, #fff, transparent),
            radial-gradient(4px 4px at 360px 280px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '500px 400px'
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: `
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, #fff, transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 160px 30px, #fff, transparent),
            radial-gradient(1px 1px at 200px 90px, #fff, transparent),
            radial-gradient(1px 1px at 240px 50px, #fff, transparent),
            radial-gradient(2px 2px at 280px 10px, #fff, transparent),
            radial-gradient(1px 1px at 320px 70px, #fff, transparent),
            radial-gradient(1px 1px at 360px 20px, #fff, transparent),
            radial-gradient(2px 2px at 400px 60px, #fff, transparent),
            radial-gradient(1px 1px at 440px 100px, #fff, transparent),
            radial-gradient(2px 2px at 20px 130px, #fff, transparent),
            radial-gradient(1px 1px at 60px 160px, #fff, transparent),
            radial-gradient(1px 1px at 100px 190px, #fff, transparent),
            radial-gradient(2px 2px at 140px 220px, #fff, transparent),
            radial-gradient(1px 1px at 180px 250px, #fff, transparent),
            radial-gradient(1px 1px at 220px 280px, #fff, transparent),
            radial-gradient(2px 2px at 260px 310px, #fff, transparent),
            radial-gradient(1px 1px at 300px 340px, #fff, transparent),
            radial-gradient(1px 1px at 340px 370px, #fff, transparent),
            radial-gradient(2px 2px at 380px 200px, #fff, transparent),
            radial-gradient(1px 1px at 420px 230px, #fff, transparent),
            radial-gradient(1px 1px at 460px 260px, #fff, transparent),
            radial-gradient(2px 2px at 70px 320px, #fff, transparent),
            radial-gradient(1px 1px at 110px 350px, #fff, transparent),
            radial-gradient(2px 2px at 250px 120px, #fff, transparent),
            radial-gradient(1px 1px at 390px 140px, #fff, transparent),
            radial-gradient(1px 1px at 30px 210px, #fff, transparent),
            radial-gradient(2px 2px at 470px 180px, #fff, transparent),
            radial-gradient(1px 1px at 150px 60px, #fff, transparent),
            radial-gradient(1px 1px at 330px 240px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '500px 500px'
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: `
            radial-gradient(1px 1px at 50px 50px, #fff, transparent),
            radial-gradient(1px 1px at 150px 150px, #fff, transparent),
            radial-gradient(1px 1px at 250px 250px, #fff, transparent),
            radial-gradient(1px 1px at 350px 350px, #fff, transparent),
            radial-gradient(1px 1px at 450px 450px, #fff, transparent),
            radial-gradient(1px 1px at 75px 200px, #fff, transparent),
            radial-gradient(1px 1px at 175px 300px, #fff, transparent),
            radial-gradient(1px 1px at 275px 100px, #fff, transparent),
            radial-gradient(1px 1px at 375px 200px, #fff, transparent),
            radial-gradient(1px 1px at 125px 350px, #fff, transparent),
            radial-gradient(1px 1px at 225px 50px, #fff, transparent),
            radial-gradient(1px 1px at 325px 150px, #fff, transparent),
            radial-gradient(1px 1px at 425px 250px, #fff, transparent),
            radial-gradient(1px 1px at 25px 300px, #fff, transparent),
            radial-gradient(1px 1px at 475px 100px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '500px 500px'
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: `
            radial-gradient(0.8px 0.8px at 35px 25px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 85px 65px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 135px 105px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 185px 145px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 235px 185px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 285px 225px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 335px 265px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 385px 305px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 435px 345px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 15px 85px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 65px 125px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 115px 165px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 165px 205px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 215px 245px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 265px 285px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 315px 325px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 365px 365px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 415px 45px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 465px 85px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 45px 165px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 95px 205px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 145px 245px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 195px 285px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 245px 325px, #fff, transparent),
            radial-gradient(0.8px 0.8px at 295px 365px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '480px 400px'
        }}
      />

      <div className="absolute inset-0 w-full h-full z-0">
        <R3FGlobe
            ref={globeRef}
            globeMode={globeMode}
            userTravelData={userTravelData}
            homeCountry={homeCountry}
            onPointClick={handlePointClick}
            onLineClick={handleLineClick}
        />
      </div>

      <LoadingScreen isLoading={isInitialLoad || isLoading} loadingStatus={loadingStatus} />
{/* 로그인/로그아웃 및 설정 버튼 */}
{!hideBottomUI && (
        // 💡 1. 여기서 꼭 bottom-8 을 확인하세요! (left-6 bottom-8)
        <div className="absolute left-6 bottom-10 z-30 flex gap-2 items-end">
          {user ? (
            <>
              <button
                onClick={handleSignOut}
                // 💡 2. py-2 를 삭제하고 h-12 를 추가했습니다.
                className="bg-red-600/90 hover:bg-red-700/90 text-white px-4 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg flex items-center justify-center h-12"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowSettings(true)}
                // 💡 3. py-2, px-3 삭제하고 h-12 w-12 를 추가했습니다.
                className="bg-slate-900/95 backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 text-white hover:bg-slate-800/95 transition-all flex items-center justify-center h-12 w-12 text-lg"
              >
                ⚙️
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              // 💡 4. py-2 를 삭제하고 h-12 를 추가했습니다.
              className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg flex items-center justify-center h-12"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      <GlobeControls 
        key={`globe-controls-${renderKey}`}
        globeMode={globeMode}
        changeGlobeMode={changeGlobeMode}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        globeRef={globeRef}
        resetView={resetView}
        toggleRotation={toggleRotation}
        goToCountry={goToCountry}
        userTravelData={userTravelData}
        showContinentPanel={showContinentPanel}
        setShowContinentPanel={setShowContinentPanel}
        selectedLine={selectedLine}
        selectedCountry={selectedCountry}
      />

      <TravelStatsPanel 
        key={`travel-stats-${renderKey}`}
        showMobileStats={showMobileStats}
        setShowMobileStats={setShowMobileStats}
        stats={stats}
        userTravelData={userTravelData}
        countryData={countryData}
        goToCountry={goToCountry}
        setSelectedCountry={setSelectedCountry}
        setSelectedLine={setSelectedLine}
        setShowAddTravel={setShowAddTravel}
        setShowAllTrips={setShowAllTrips}
        setShowGlobeControlsOnMobile={setShowGlobeControlsOnMobile}
      />

      <SelectedCountryPanel 
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        setShowGlobeControlsOnMobile={setShowGlobeControlsOnMobile}
        deleteCityTrip={deleteCityTrip}
        setEditingTrip={setEditingTrip}
        editingTrip={editingTrip}
      />

      <LineInfoPanel
        selectedLine={selectedLine}
        setSelectedLine={setSelectedLine}
        selectedLineIndex={selectedLineIndex}
        setSelectedLineIndex={setSelectedLineIndex}
        lineInfoRef={lineInfoRef}
        homeCountry={homeCountry}
      />

      <AddTravelModal 
        showAddTravel={showAddTravel}
        setShowAddTravel={setShowAddTravel}
        newTravelData={newTravelData}
        setNewTravelData={setNewTravelData}
        addTravelDestination={addTravelDestination}
      />

      <DateErrorModal 
        showDateErrorModal={showDateErrorModal}
        setShowDateErrorModal={setShowDateErrorModal}
      />

      <AlertDialog
        show={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertMessage}
      />

      <AllTripsModal
        showAllTrips={showAllTrips}
        setShowAllTrips={setShowAllTrips}
        userTravelData={userTravelData}
        countryData={countryData}
        goToCountry={goToCountry}
        setSelectedCountry={setSelectedCountry}
        setEditingTrip={setEditingTrip}
        deleteCityTrip={deleteCityTrip}
      />

      <EditTravelModal 
        editingTrip={editingTrip}
        setEditingTrip={setEditingTrip}
        updateTravelDestination={updateTravelDestination}
      />

      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDeleteCityTrip}
        title="⚠️ 여행기록 삭제"
        message={getDeleteMessage()}
        confirmText="삭제"
        cancelText="취소"
        isDestructive={true}
      />

      <AuthModal 
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        user={user}
        homeCountry={homeCountry}
        setHomeCountry={setHomeCountry}
      />

      <WelcomeModal
        show={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onSignIn={() => {
          setShowWelcomeModal(false);
          setShowAuth(true);
        }}
      />

      {/* ... styles ... */}
    </div>
  );
};

export default UltraRealisticGlobe;
