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
import { supabase } from './supabaseClient';
import R3FGlobe from './components/R3FGlobe';

const UltraRealisticGlobe = ({ travelData, onUpdateTrip, onDeleteTrip, onAddTrip }) => {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [userTravelData, setUserTravelData] = useState({});

  useEffect(() => {
    if (travelData) {
      const dataWithCoords = {};
      for (const key in travelData) {
        const englishName = Object.keys(countryData).find(k => countryData[k].koreanName === key);
        if (englishName) {
            dataWithCoords[englishName] = {
                ...travelData[key],
                coordinates: countryData[englishName]?.coords || [0, 0]
            };
        }
      }
      setUserTravelData(dataWithCoords);
      setIsInitialLoad(false); // <-- THIS IS THE FIX
    }
  }, [travelData]);
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
    if (!travelData) { // Only run if travelData prop is not provided
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          loadUserData(session.user.id);
        } else {
          setIsInitialLoad(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadUserData(session.user.id);
        } else {
          setUser(null);
          setUserTravelData({});
          setHomeCountry('South Korea');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [travelData]);

  const loadUserData = async (userId) => {
    setIsLoading(true);
    setLoadingStatus('사용자 데이터 로딩 중...');
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
        const loadedTravelData = {};
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

  const updateInSupabase = async (countryEnglishName, oldTrip, newTrip) => {
    if (!user) return;
    try {
      const { data: existingData, error: selectError } = await supabase.from('user_travels').select('id').eq('user_id', user.id).eq('country', countryEnglishName).eq('start_date', oldTrip.startDate).eq('end_date', oldTrip.endDate).single();
      if (selectError) throw selectError;
      if (existingData) {
        const { error: updateError } = await supabase.from('user_travels').update({ cities: newTrip.cities, start_date: newTrip.startDate, end_date: newTrip.endDate }).eq('id', existingData.id);
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating in Supabase:', error);
      alert('데이터 업데이트에 실패했습니다.');
    }
  };

  const deleteFromSupabase = async (countryEnglishName, trip) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_travels').delete().eq('user_id', user.id).eq('country', countryEnglishName).eq('start_date', trip.startDate).eq('end_date', trip.endDate);
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

  const updateTravelDestination = async () => { /* implementation needed */ };
  const addTravelDestination = async () => { /* implementation needed */ };
  const deleteCityTrip = async (tripToDelete) => { /* implementation needed */ };
  const executeDeleteCityTrip = async () => { /* implementation needed */ };

  const goToCountry = (countryEnglishName) => {
    if (globeRef.current) {
      globeRef.current.goToCountry(countryEnglishName);
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

  const getTravelStats = () => {
    const totalCountries = Object.keys(userTravelData).length;
    const totalVisits = Object.values(userTravelData).reduce((sum, data) => sum + data.visits, 0);
    const totalCities = Object.values(userTravelData).reduce((sum, data) => sum + data.cities.length, 0);
    return { totalCountries, totalVisits, totalCities };
  };

  const stats = getTravelStats();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div 
        className="absolute inset-0 w-full h-full"
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
        className="absolute inset-0 w-full h-full"
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
        className="absolute inset-0 w-full h-full"
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
        className="absolute inset-0 w-full h-full"
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

      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <R3FGlobe
            ref={globeRef}
            globeMode={globeMode}
            userTravelData={userTravelData}
            homeCountry={homeCountry}
            onPointClick={handlePointClick}
        />
      </div>

      <LoadingScreen isLoading={isInitialLoad || isLoading} loadingStatus={loadingStatus} />

      {/* 로그인 버튼 및 사용자 정보 + 설정 버튼 */}
      {window.innerWidth <= 768 ? (
        // 모바일: 왼쪽 하단에 로그인/로그아웃과 설정 버튼
        <div className="absolute bottom-6 left-6 z-10 flex gap-2">
          {user && !selectedLine && !selectedCountry ? (
            <>
              <button
                onClick={handleSignOut}
                className="bg-red-600/90 hover:bg-red-700/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-slate-900/95 backdrop-blur-lg rounded-lg shadow-2xl px-3 py-2 border border-white/20 text-white hover:bg-slate-800/95 transition-all"
              >
                ⚙️
              </button>
            </>
          ) : (
            !selectedLine && !selectedCountry && (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
            >
              Sign In
            </button>
            )
          )}
        </div>
      ) : (
        // 데스크톱: 왼쪽 하단에 설정 버튼, 오른쪽 상단에 로그인/로그아웃
        <>
          <div className="absolute top-6 right-20 z-10">
            {user && !selectedLine && !selectedCountry ? (
              <button
                onClick={handleSignOut}
                className="bg-red-600/90 hover:bg-red-700/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
              >
                Sign Out
              </button>
            ) : (
              !selectedLine && !selectedCountry && (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
              >
                Sign In
              </button>
              )
            )}
          </div>
          {/* 데스크톱: 왼쪽 하단에 설정 버튼 */}
          {user && !selectedLine && !selectedCountry && (
            <div className="absolute bottom-6 left-6 z-10">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl px-4 py-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all font-medium text-sm flex items-center gap-2"
              >
                ⚙️ 설정
              </button>
            </div>
          )}
        </>
      )}

      <GlobeControls 
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
        showMobileStats={showMobileStats}
        setShowMobileStats={setShowMobileStats}
        stats={stats}
        userTravelData={userTravelData}
        countryData={countryData}
        goToCountry={goToCountry}
        setSelectedCountry={setSelectedCountry}
        setSelectedLine={setSelectedLine}
        setShowAddTravel={setShowAddTravel}
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
      />

      <AddTravelModal 
        showAddTravel={showAddTravel}
        setShowAddTravel={setShowAddTravel}
        newTravelData={newTravelData}
        setNewTravelData={setNewTravelData}
        addTravelDestination={addTravelDestination}
      />

      <EditTravelModal 
        editingTrip={editingTrip}
        setEditingTrip={setEditingTrip}
        updateTravelDestination={updateTravelDestination}
      />

      <DateErrorModal 
        showDateErrorModal={showDateErrorModal}
        setShowDateErrorModal={setShowDateErrorModal}
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

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.8);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.8);
          }
        `}
      </style>
    </div>
  );
};

export default UltraRealisticGlobe;
