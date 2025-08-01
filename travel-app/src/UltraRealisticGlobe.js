import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { countryData, getVisitStyle, getGlobeTextures } from './data/countryData';
import LoadingScreen from './components/LoadingScreen';
import TravelStatsPanel from './components/TravelStatsPanel';
import GlobeControls from './components/GlobeControls';
import SelectedCountryPanel from './components/SelectedCountryPanel';
import { AddTravelModal, EditTravelModal, DateErrorModal } from './components/Modals';
import AuthModal from './components/AuthModal';
import { supabase } from './supabaseClient';

const UltraRealisticGlobe = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('로딩 중...');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [globeMode, setGlobeMode] = useState('satellite');
  const [zoomLevel, setZoomLevel] = useState(2.5);
  
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
  const lineInfoRef = useRef(null);
  
  // 인증 관련 상태
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [homeCountry, setHomeCountry] = useState('South Korea');

  // 여행 경로 정보 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lineInfoRef.current && !lineInfoRef.current.contains(event.target)) {
        setSelectedLine(null);
      }
    };

    if (selectedLine) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedLine]);

  // 사용자 세션 확인 및 데이터 로드
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        // 로그아웃 시 데이터 초기화
        setUserTravelData({});
        setHomeCountry('South Korea');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 사용자 데이터 로드
  const loadUserData = async (userId) => {
    try {
      // 사용자 프로필 로드
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('home_country')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        setHomeCountry(profile.home_country || 'South Korea');
      }

      // 사용자 여행 데이터 로드
      const { data: travels, error: travelsError } = await supabase
        .from('user_travels')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (travels && !travelsError) {
        const travelData = {};
        travels.forEach(travel => {
          const countryEnglishName = travel.country;
          if (!travelData[countryEnglishName]) {
            travelData[countryEnglishName] = {
              visits: 0,
              lastVisit: '',
              cities: [],
              coordinates: countryData[countryEnglishName]?.coords || [0, 0],
              description: '아름다운 여행지',
              trips: []
            };
          }
          
          travelData[countryEnglishName].trips.push({
            cities: travel.cities,
            startDate: travel.start_date,
            endDate: travel.end_date
          });
          
          travelData[countryEnglishName].visits++;
          travelData[countryEnglishName].cities = [...new Set([...travelData[countryEnglishName].cities, ...travel.cities])];
          
          if (new Date(travel.end_date) > new Date(travelData[countryEnglishName].lastVisit || '1900-01-01')) {
            travelData[countryEnglishName].lastVisit = travel.end_date;
          }
        });
        
        setUserTravelData(travelData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // 데이터 저장 함수
  const saveToSupabase = async (countryEnglishName, tripData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_travels')
        .insert([{
          user_id: user.id,
          country: countryEnglishName,
          cities: tripData.cities,
          start_date: tripData.startDate,
          end_date: tripData.endDate
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('데이터 저장에 실패했습니다.');
    }
  };

  // 데이터 업데이트 함수
  const updateInSupabase = async (countryEnglishName, oldTrip, newTrip) => {
    if (!user) return;

    try {
      // 먼저 기존 데이터 찾기
      const { data: existingData, error: selectError } = await supabase
        .from('user_travels')
        .select('id')
        .eq('user_id', user.id)
        .eq('country', countryEnglishName)
        .eq('start_date', oldTrip.startDate)
        .eq('end_date', oldTrip.endDate)
        .single();

      if (selectError) throw selectError;

      if (existingData) {
        const { error: updateError } = await supabase
          .from('user_travels')
          .update({
            cities: newTrip.cities,
            start_date: newTrip.startDate,
            end_date: newTrip.endDate
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating in Supabase:', error);
      alert('데이터 업데이트에 실패했습니다.');
    }
  };

  // 데이터 삭제 함수
  const deleteFromSupabase = async (countryEnglishName, trip) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_travels')
        .delete()
        .eq('user_id', user.id)
        .eq('country', countryEnglishName)
        .eq('start_date', trip.startDate)
        .eq('end_date', trip.endDate);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      alert('데이터 삭제에 실패했습니다.');
    }
  };

  // 로그인 성공 핸들러
  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    loadUserData(authUser.id);
  };

  // 로그아웃
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // 로그아웃 시 여행 데이터 초기화
    setUserTravelData({});
    // 홈 국가도 기본값으로 초기화
    setHomeCountry('South Korea');
  };

  // 사용자 여행 포인트 생성
  const createTravelPoints = () => {
    return Object.entries(userTravelData).map(([countryEnglishName, data]) => {
      const style = getVisitStyle(data.visits);
      const displayCountryName = countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName;
      return {
        lat: data.coordinates[0],
        lng: data.coordinates[1],
        country: countryEnglishName,
        displayCountry: displayCountryName,
        visits: data.visits,
        lastVisit: data.lastVisit,
        cities: data.cities,
        description: data.description,
        size: style.size,
        color: style.color,
        glowColor: style.glow,
        trips: data.trips
      };
    });
  };

  // 여행 경로 생성 (날짜 순서대로 연결)
  const createTravelRoutes = () => {
    const allTripsFlat = [];
    Object.entries(userTravelData).forEach(([countryEnglishName, data]) => {
      data.trips.forEach(trip => {
        allTripsFlat.push({
          country: countryEnglishName,
          coords: data.coordinates,
          startDate: trip.startDate,
          endDate: trip.endDate
        });
      });
    });

    allTripsFlat.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const routes = [];
    // 로그인한 사용자는 홈 국가, 비로그인 사용자는 South Korea를 기본으로 사용
    const defaultCountry = user ? homeCountry : 'South Korea';
    const defaultCoords = countryData[defaultCountry]?.coords;

    if (!defaultCoords) {
      console.error(`${defaultCountry} coordinates not found in countryData.`);
      return routes;
    }

    let previousCoords = defaultCoords;
    let previousEndDate = null;

    allTripsFlat.forEach((currentTrip) => {
      const currentTripStartDate = new Date(currentTrip.startDate);
      const previousTripEndDate = previousEndDate ? new Date(previousEndDate) : null;

      let startPointCoords;
      let startCountryName = defaultCountry;
      
      if (previousTripEndDate && (currentTripStartDate - previousTripEndDate) / (1000 * 60 * 60 * 24) > 1) {
        startPointCoords = defaultCoords;
        startCountryName = defaultCountry;
      } else {
        startPointCoords = previousCoords;
        const prevCountry = allTripsFlat[allTripsFlat.indexOf(currentTrip) - 1];
        startCountryName = prevCountry ? prevCountry.country : defaultCountry;
      }

      if (startPointCoords[0] !== currentTrip.coords[0] || startPointCoords[1] !== currentTrip.coords[1]) {
        routes.push({
          startLat: startPointCoords[0],
          startLng: startPointCoords[1],
          endLat: currentTrip.coords[0],
          endLng: currentTrip.coords[1],
          color: '#60a5fa',
          stroke: 2,
          startCountry: startCountryName,
          endCountry: currentTrip.country,
          startDate: currentTrip.startDate,
          endDate: currentTrip.endDate
        });
      }
      
      previousCoords = currentTrip.coords;
      previousEndDate = currentTrip.endDate;
    });

    return routes;
  };

  // 여행지 수정 함수
  const updateTravelDestination = async () => {
    if (!editingTrip) return;

    const startDateObj = new Date(editingTrip.startDate);
    const endDateObj = new Date(editingTrip.endDate);

    if (startDateObj > endDateObj) {
      setShowDateErrorModal(true);
      return;
    }

    const countryEnglishName = editingTrip.country || selectedCountry?.country;
    
    if (!countryEnglishName) {
      console.error('국가 정보를 찾을 수 없습니다.');
      return;
    }

    setUserTravelData(prev => {
      const newData = { ...prev };
      const countryDataToUpdate = newData[countryEnglishName];

      if (countryDataToUpdate) {
        const tripIndex = countryDataToUpdate.trips.findIndex(trip => 
          trip.startDate === editingTrip.originalStartDate && 
          trip.endDate === editingTrip.originalEndDate &&
          JSON.stringify(trip.cities) === JSON.stringify(editingTrip.originalCities)
        );

        if (tripIndex > -1) {
          const updatedTrips = [...countryDataToUpdate.trips];
          updatedTrips[tripIndex] = {
            cities: editingTrip.cities,
            startDate: editingTrip.startDate,
            endDate: editingTrip.endDate
          };

          const allEndDates = updatedTrips.map(trip => new Date(trip.endDate));
          const latestEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates)).toISOString().split('T')[0] : '';

          newData[countryEnglishName] = {
            ...countryDataToUpdate,
            trips: updatedTrips,
            lastVisit: latestEndDate,
            cities: [...new Set(updatedTrips.flatMap(trip => trip.cities))],
            visits: updatedTrips.length
          };

          const style = getVisitStyle(updatedTrips.length);
          
          // selectedCountry가 존재하고 해당 국가를 선택한 상태일 때만 업데이트
          if (selectedCountry && selectedCountry.country === countryEnglishName) {
            setSelectedCountry({
              ...newData[countryEnglishName],
              country: countryEnglishName,
              displayCountry: countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName,
              color: style.color
            });
          }
        }
      }
      return newData;
    });

    // Supabase에 업데이트
    await updateInSupabase(countryEnglishName, {
      startDate: editingTrip.originalStartDate,
      endDate: editingTrip.originalEndDate
    }, {
      cities: editingTrip.cities,
      startDate: editingTrip.startDate,
      endDate: editingTrip.endDate
    });

    setEditingTrip(null);
  };

  // 여행지 추가 함수
  const addTravelDestination = async () => {
    if (!newTravelData.country || !newTravelData.cities || !newTravelData.startDate || !newTravelData.endDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const startDateObj = new Date(newTravelData.startDate);
    const endDateObj = new Date(newTravelData.endDate);

    if (startDateObj > endDateObj) {
      setShowDateErrorModal(true);
      return;
    }

    const coordinates = countryData[newTravelData.country]?.coords;
    if (!coordinates) {
      alert('선택한 국가의 좌표를 찾을 수 없습니다.');
      return;
    }

    const cityArray = newTravelData.cities.split(',').map(city => city.trim());
    const existingData = userTravelData[newTravelData.country];
    
    const newTrip = {
      cities: cityArray,
      startDate: newTravelData.startDate,
      endDate: newTravelData.endDate
    };
    
    if (existingData) {
      const updatedTrips = [...(existingData.trips || []), newTrip];
      const allEndDates = updatedTrips.map(trip => new Date(trip.endDate));
      const latestEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates)).toISOString().split('T')[0] : '';

      setUserTravelData(prev => ({
        ...prev,
        [newTravelData.country]: {
          ...existingData,
          visits: existingData.visits + 1,
          lastVisit: latestEndDate,
          cities: [...new Set([...existingData.cities, ...cityArray])],
          coordinates,
          description: existingData.description,
          trips: updatedTrips
        }
      }));
    } else {
      setUserTravelData(prev => ({
        ...prev,
        [newTravelData.country]: {
          visits: 1,
          lastVisit: newTravelData.endDate,
          cities: cityArray,
          coordinates,
          description: '아름다운 여행지',
          trips: [newTrip]
        }
      }));
    }

    // Supabase에 저장
    await saveToSupabase(newTravelData.country, newTrip);

    setNewTravelData({
      country: '',
      cities: '',
      startDate: '',
      endDate: ''
    });
    setShowAddTravel(false);
  };

  // 여행지 (도시별 여행) 삭제 함수
  const deleteCityTrip = async (cityName, tripToDelete) => {
    setUserTravelData(prev => {
      const newData = { ...prev };
      const countryEnglishName = selectedCountry.country;
      const countryDataForDeletion = newData[countryEnglishName];

      if (countryDataForDeletion) {
        const updatedTrips = countryDataForDeletion.trips.filter(trip =>
          !(trip.startDate === tripToDelete.startDate && 
            trip.endDate === tripToDelete.endDate && 
            JSON.stringify(trip.cities) === JSON.stringify(tripToDelete.cities))
        );

        if (updatedTrips.length === 0) {
          delete newData[countryEnglishName];
          setSelectedCountry(null);
          if (window.innerWidth <= 768) {
            setShowGlobeControlsOnMobile(true);
          }
        } else {
          const remainingCities = new Set();
          updatedTrips.forEach(trip => {
            trip.cities.forEach(city => remainingCities.add(city));
          });
          
          const allEndDates = updatedTrips.map(trip => new Date(trip.endDate));
          const latestEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates)).toISOString().split('T')[0] : '';

          newData[countryEnglishName] = {
            ...countryDataForDeletion,
            visits: updatedTrips.length,
            cities: Array.from(remainingCities),
            trips: updatedTrips,
            lastVisit: latestEndDate,
          };
          
          const style = getVisitStyle(updatedTrips.length);
          setSelectedCountry({
            ...newData[countryEnglishName],
            country: countryEnglishName,
            displayCountry: countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName,
            color: style.color
          });
        }
      }
      return newData;
    });

    // Supabase에서 삭제
    await deleteFromSupabase(selectedCountry.country, tripToDelete);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let globeInstance = null;
    let mounted = true;

    const initGlobe = async () => {
      try {
        setIsLoading(true);
        setLoadingStatus('Loading...');

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        globeInstance = Globe()
          .backgroundColor('#000015')
          .showAtmosphere(true)
          .atmosphereColor('#4080ff')
          .atmosphereAltitude(0.12);

        if (!mounted) return;
        
        const textures = getGlobeTextures(globeMode);
        globeInstance
          .globeImageUrl(textures.globe)
          .bumpImageUrl(textures.bump);

        const travelPoints = createTravelPoints();
        globeInstance
          .pointsData(travelPoints)
          .pointAltitude(0.01)
          .pointColor(d => d.color)
          .pointRadius(d => d.size)
          .pointResolution(32)
          .pointLabel(d => `
            <div style="
              background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.9)); 
              padding: 16px; 
              border-radius: 12px; 
              color: white; 
              max-width: 280px;
              border: 2px solid ${d.color};
              box-shadow: 0 12px 40px rgba(0,0,0,0.6);
              backdrop-filter: blur(15px);
            ">
              <h3 style="margin: 0 0 12px 0; color: ${d.color}; font-size: 18px;">
                ${d.displayCountry} ✈️
              </h3>
              <div style="margin-bottom: 8px;">
                <strong style="color: #60a5fa;">방문 횟수:</strong> 
                <span style="color: ${d.color}; font-weight: bold;">${d.visits}회</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #60a5fa;">마지막 방문:</strong> 
                <span style="color: #cbd5e1;">${d.lastVisit}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <strong style="color: #60a5fa;">방문 도시:</strong><br/>
                <span style="color: #e2e8f0;">${d.cities.join(' • ')}</span>
              </div>
            </div>
          `)
          .onPointClick((point) => {
            setSelectedCountry(point);
            setSelectedLine(null);
            if (globeInstance) {
              globeInstance.pointOfView({ 
                lat: point.lat, 
                lng: point.lng, 
                altitude: 1.2 
              }, 1500);
            }
          });

        const routes = createTravelRoutes();
        globeInstance
          .arcsData(routes)
          .arcColor(d => d.color)
          .arcDashLength(1)
          .arcAltitude(arc => {
            const dx = arc.endLng - arc.startLng;
            const dy = arc.endLat - arc.startLat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 180) {
              return 0.5;
            } else if (distance > 90) {
              return 0.3;
            } else {
              return 0.1;
            }
          })
          .arcStroke(1.5)
          .arcDashLength(1)
          .arcDashGap(0)
          .arcDashAnimateTime(0)
          .onArcClick(arc => {
            setSelectedLine(arc);
            setSelectedCountry(null);
          });

        if (!mounted) return;

        const globeElement = globeInstance(containerRef.current);
        
        if (mounted && containerRef.current && globeElement) {
          globeInstance
            .width(window.innerWidth)
            .height(window.innerHeight);

          globeInstance.pointOfView({ 
            lat: 20, 
            lng: 0, 
            altitude: 2.5 
          });

          setTimeout(() => {
            if (mounted && globeInstance.controls) {
              try {
                const controls = globeInstance.controls();
                if (controls) {
                  controls.autoRotate = true;
                  controls.autoRotateSpeed = 0.3;
                  controls.enableDamping = true;
                  controls.dampingFactor = 0.1;
                  controls.minDistance = 200;
                  controls.maxDistance = 1000;
                }
              } catch (e) {
                console.log('Error setting globe controls:', e);
              }
            }
          }, 100);

          globeRef.current = globeInstance;
          
          setLoadingStatus('Loading...');
          
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        setLoadingStatus('에러 발생: ' + error.message);
        
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 2000);
      }
    };

    initGlobe();

    const handleResize = () => {
      if (globeInstance && mounted) {
        globeInstance
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      
      if (globeInstance) {
        try {
          if (globeInstance.renderer && globeInstance.renderer()) {
            globeInstance.renderer().dispose();
          }
        } catch (e) {
          console.log('Globe cleanup error:', e);
        }
      }
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [globeMode]); // userTravelData를 dependency에서 제거하여 로딩 화면 방지

  // userTravelData, user, homeCountry가 변경되면 지구본 데이터만 업데이트 (로딩 화면 없이)
  useEffect(() => {
    if (!globeRef.current) return;
    
    const globe = globeRef.current;
    
    // 포인트 데이터 업데이트
    const travelPoints = createTravelPoints();
    globe.pointsData(travelPoints);
    
    // 경로 데이터 업데이트
    const routes = createTravelRoutes();
    globe.arcsData(routes);
  }, [userTravelData, user, homeCountry]);

  // 컨트롤 함수들
  const goToCountry = (countryEnglishName) => {
    const countryDataFromState = userTravelData[countryEnglishName];
    if (countryDataFromState && globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: countryDataFromState.coordinates[0], 
        lng: countryDataFromState.coordinates[1], 
        altitude: 1.2 
      }, 1500);
    }
  };

  const resetView = () => {
    if (globeRef.current) {
      const homeCoords = countryData[homeCountry]?.coords;
      if (homeCoords) {
        globeRef.current.pointOfView({ 
          lat: homeCoords[0], 
          lng: homeCoords[1], 
          altitude: 1.5 
        }, 1500);
      } else {
        // 홈 국가 좌표를 찾을 수 없는 경우 기본 뷰로
        globeRef.current.pointOfView({ 
          lat: 20, 
          lng: 0, 
          altitude: 2.5 
        }, 1500);
      }
    }
  };

  const toggleRotation = () => {
    if (globeRef.current && globeRef.current.controls) {
      try {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
        }
      } catch (e) {
        console.log('Toggle rotation error:', e);
      }
    }
  };

  const changeGlobeMode = (mode) => {
    setGlobeMode(mode);
  };

  // 통계 계산
  const getTravelStats = () => {
    const totalCountries = Object.keys(userTravelData).length;
    const totalVisits = Object.values(userTravelData).reduce((sum, data) => sum + data.visits, 0);
    const totalCities = Object.values(userTravelData).reduce((sum, data) => sum + data.cities.length, 0);
    return { totalCountries, totalVisits, totalCities };
  };

  const stats = getTravelStats();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />

      <LoadingScreen isLoading={isLoading} loadingStatus={loadingStatus} />

      {/* 로그인 버튼 및 사용자 정보 */}
      {window.innerWidth <= 768 ? (
        // 모바일: 왼쪽 하단에 표시
        <div className="absolute bottom-6 left-6 z-10">
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-red-600/90 hover:bg-red-700/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
            >
              Sign In
            </button>
          )}
        </div>
      ) : (
        // 데스크톱: 오른쪽 상단에 표시
        <div className="absolute top-6 right-20 z-10">
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-red-600/90 hover:bg-red-700/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl backdrop-blur-lg"
            >
              Sign In
            </button>
          )}
        </div>
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

      {selectedLine && (
        <div 
          ref={lineInfoRef}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10 text-center"
        >
          <button 
            onClick={() => setSelectedLine(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-xl transition-colors"
          >
            ×
          </button>
          <div className="text-white font-bold text-md mb-1">{countryData[selectedLine.startCountry]?.koreanName || selectedLine.startCountry} → {countryData[selectedLine.endCountry]?.koreanName || selectedLine.endCountry}</div>
          <div className="text-slate-400 text-sm">{selectedLine.startDate} ~ {selectedLine.endDate}</div>
        </div>
      )}

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
