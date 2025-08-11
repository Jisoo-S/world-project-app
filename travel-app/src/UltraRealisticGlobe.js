import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  const [showAlertModal, setShowAlertModal] = useState(false); // New state
  const [alertMessage, setAlertMessage] = useState(''); // New state
  const lineInfoRef = useRef(null);
  
  // 인증 관련 상태
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [homeCountry, setHomeCountry] = useState('South Korea');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTripData, setDeleteTripData] = useState(null);

  // 여행 경로 정보 패널 외부 클릭 감지
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
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (showMobileStats) {
      setSelectedCountry(null);
      setShowAllTrips(false);
    }
  }, [showMobileStats]);

  useEffect(() => {
    if (showAllTrips) {
      setSelectedCountry(null);
      setShowMobileStats(false);
    }
  }, [showAllTrips]);

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
  const handleAuthSuccess = (authUser, message = '') => {
    setUser(authUser);
    loadUserData(authUser.id);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000); // 5초 후 메시지 사라짐
    }
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

    const routesMap = {}; // 같은 경로의 여행들을 그룹핑
    
    // 경로 키 생성 함수 (양방향 경로를 하나로 통합)
    const getRouteKey = (country1, country2) => {
      // 홈 국가가 있으면 홈 국가를 항상 첫 번째로
      if (country1 === defaultCountry && country2 !== defaultCountry) {
        return `${country1}-${country2}`;
      }
      if (country2 === defaultCountry && country1 !== defaultCountry) {
        return `${country2}-${country1}`;
      }
      
      // 둘 다 홈 국가가 아니어면 한국어 이름을 정렬하여 결정
      const korean1 = countryData[country1]?.koreanName || country1;
      const korean2 = countryData[country2]?.koreanName || country2;
      
      // 한국어 정렬 비교
      if (korean1.localeCompare(korean2, 'ko') <= 0) {
        return `${country1}-${country2}`;
      } else {
        return `${country2}-${country1}`;
      }
    };
    
    // 경로 생성 도우미 함수
    const createRoute = (country1, country2, coords1, coords2) => {
      // 홈 국가가 포함된 경우 홈 국가를 시작점으로 설정
      let startCountry, endCountry, startCoords, endCoords;
      
      if (country1 === defaultCountry) {
        startCountry = country1;
        endCountry = country2;
        startCoords = coords1;
        endCoords = coords2;
      } else if (country2 === defaultCountry) {
        startCountry = country2;
        endCountry = country1;
        startCoords = coords2;
        endCoords = coords1;
      } else {
        // 둘 다 홈 국가가 아닌 경우 기존 순서 유지
        startCountry = country1;
        endCountry = country2;
        startCoords = coords1;
        endCoords = coords2;
      }
      
      // 태평양 횡단 경로 처리
      let startLng = startCoords[1];
      let endLng = endCoords[1];
      
      // 경도 차이 계산
      let lngDiff = endLng - startLng;
      
      // 태평양을 횡단하는 경우 처리 (경도 차이가 180도 이상인 경우)
      if (Math.abs(lngDiff) > 180) {
        if (lngDiff > 0) {
          // 서쪽에서 동쪽으로 가는 경우 (예: 미국 -> 일본)
          startLng = startLng + 360;
        } else {
          // 동쪽에서 서쪽으로 가는 경우 (예: 일본 -> 미국)
          endLng = endLng + 360;
        }
      }
      
      return {
        startLat: startCoords[0],
        startLng: startLng,
        endLat: endCoords[0],
        endLng: endLng,
        color: '#60a5fa',
        stroke: 2,
        startCountry: startCountry,
        endCountry: endCountry,
        trips: []
      };
    };
    
    // 로그인한 사용자는 홈 국가, 비로그인 사용자는 South Korea를 기본으로 사용
    const defaultCountry = user ? homeCountry : 'South Korea';
    const defaultCoords = countryData[defaultCountry]?.coords;

    if (!defaultCoords) {
      console.error(`${defaultCountry} coordinates not found in countryData.`);
      return [];
    }

    // 날짜가 겹치는지 확인하는 함수
    const isDateOverlapping = (start1, end1, start2, end2) => {
      const s1 = new Date(start1);
      const e1 = new Date(end1);
      const s2 = new Date(start2);
      const e2 = new Date(end2);
      return s1 <= e2 && s2 <= e1;
    };

    allTripsFlat.forEach((currentTrip, index) => {
      // 현재 여행의 시작날짜와 같은 날짜에 끝나는 여행들 찾기 (정확히 연결되는 경우)
      const exactConnectingTrips = allTripsFlat.filter((trip, tripIndex) => {
        return tripIndex < index && trip.endDate === currentTrip.startDate;
      });

      // 현재 여행과 기간이 겹치는 여행들 찾기 (겹치는 기간이 있는 경우)
      const overlappingTrips = allTripsFlat.filter((trip, tripIndex) => {
        return tripIndex < index && 
               trip.endDate !== currentTrip.startDate && // 정확히 연결되는 경우는 제외
               isDateOverlapping(trip.startDate, trip.endDate, currentTrip.startDate, currentTrip.endDate);
      });

      // 현재 여행의 종료날짜와 같은 날짜에 시작하는 다른 여행이 있는지 확인
      const hasFollowingTrip = allTripsFlat.some((trip, tripIndex) => {
        return tripIndex > index && trip.startDate === currentTrip.endDate;
      });

      let hasConnection = false;

      // 1. 정확히 연결되는 여행들과 연결
      if (exactConnectingTrips.length > 0) {
        exactConnectingTrips.forEach(connectingTrip => {
          const routeKey = getRouteKey(connectingTrip.country, currentTrip.country);
          
          if (!routesMap[routeKey]) {
            routesMap[routeKey] = createRoute(
              connectingTrip.country, 
              currentTrip.country, 
              connectingTrip.coords, 
              currentTrip.coords
            );
          }
          
          // 여행 정보를 trips 배열에 추가 (최신 여행이 앞에 오도록)
          routesMap[routeKey].trips.unshift({
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate
          });
        });
        hasConnection = true;
        
        // 정확히 연결된 여행이지만, 다음 여행이 없으면 홈 국가와도 연결
        if (!hasFollowingTrip) {
          const homeRouteKey = getRouteKey(currentTrip.country, defaultCountry);
          
          if (!routesMap[homeRouteKey]) {
            routesMap[homeRouteKey] = createRoute(
              currentTrip.country, 
              defaultCountry, 
              currentTrip.coords, 
              defaultCoords
            );
          }
          
          // 여행 정보를 trips 배열에 추가 (최신 여행이 앞에 오도록)
          routesMap[homeRouteKey].trips.unshift({
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate
          });
        }
      }

      // 2. 기간이 겹치는 여행들과 연결
      if (overlappingTrips.length > 0) {
        overlappingTrips.forEach(overlappingTrip => {
          const routeKey = getRouteKey(overlappingTrip.country, currentTrip.country);
          
          if (!routesMap[routeKey]) {
            routesMap[routeKey] = createRoute(
              overlappingTrip.country, 
              currentTrip.country, 
              overlappingTrip.coords, 
              currentTrip.coords
            );
          }
          
          // 여행 정보를 trips 배열에 추가 (최신 여행이 앞에 오도록)
          routesMap[routeKey].trips.unshift({
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate
          });
        });
        hasConnection = true;
      }

      // 3. 연결되는 여행이 없는 경우, 홈 국가와 연결
      if (!hasConnection) {
        const routeKey = getRouteKey(defaultCountry, currentTrip.country);
        
        if (!routesMap[routeKey]) {
          routesMap[routeKey] = createRoute(
            defaultCountry, 
            currentTrip.country, 
            defaultCoords, 
            currentTrip.coords
          );
        }
        
        // 여행 정보를 trips 배열에 추가 (최신 여행이 앞에 오도록)
        routesMap[routeKey].trips.unshift({
          startDate: currentTrip.startDate,
          endDate: currentTrip.endDate
        });
      }
    });

    // routesMap을 routes 배열로 변환
    const routes = [];
    Object.values(routesMap).forEach(route => {
      // trips 배열을 날짜 역순으로 정렬 (최신 여행이 첫 번째로)
      route.trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      routes.push(route);
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
      setShowAlertModal(true);
      setAlertMessage('모든 필드를 입력해주세요.');
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

  // 여행지 (도시별 여행) 삭제 함수 (모달에서 직접 삭제용)
  const directDeleteCityTrip = async (countryEnglishName, tripToDelete) => {
    setUserTravelData(prev => {
      const newData = { ...prev };
      const countryDataForDeletion = newData[countryEnglishName];

      if (countryDataForDeletion) {
        const updatedTrips = countryDataForDeletion.trips.filter(trip =>
          !(trip.startDate === tripToDelete.startDate && 
            trip.endDate === tripToDelete.endDate && 
            JSON.stringify(trip.cities) === JSON.stringify(tripToDelete.cities))
        );

        if (updatedTrips.length === 0) {
          delete newData[countryEnglishName];
          // selectedCountry가 삭제된 국가와 같으면 null로 설정
          if (selectedCountry && selectedCountry.country === countryEnglishName) {
            setSelectedCountry(null);
            if (window.innerWidth <= 768) {
              setShowGlobeControlsOnMobile(true);
            }
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
          
          // selectedCountry가 수정된 국가와 같으면 업데이트
          if (selectedCountry && selectedCountry.country === countryEnglishName) {
            const style = getVisitStyle(updatedTrips.length);
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

    // Supabase에서 삭제
    await deleteFromSupabase(countryEnglishName, tripToDelete);
  };
  
  // 여행지 (도시별 여행) 삭제 함수 (모달 확인 후 삭제용)
  const deleteCityTrip = async (tripToDelete) => {
    // 삭제 데이터를 저장하고 확인 모달 열기
    setDeleteTripData({ tripToDelete });
    setShowDeleteConfirm(true);
  };
  
  // 실제 삭제 수행 함수
  const executeDeleteCityTrip = async () => {
    if (!deleteTripData) return;
    
    const { tripToDelete } = deleteTripData;
    const countryEnglishName = tripToDelete.country;
    
    if (!countryEnglishName) {
      console.error('국가 정보를 찾을 수 없습니다.');
      setDeleteTripData(null);
      setShowDeleteConfirm(false);
      return;
    }
    setUserTravelData(prev => {
      const newData = { ...prev };
      const countryDataForDeletion = newData[countryEnglishName];

      if (countryDataForDeletion) {
        const updatedTrips = countryDataForDeletion.trips.filter(trip =>
          !(trip.startDate === tripToDelete.startDate && 
            trip.endDate === tripToDelete.endDate && 
            JSON.stringify(trip.cities) === JSON.stringify(tripToDelete.cities))
        );

        if (updatedTrips.length === 0) {
          delete newData[countryEnglishName];
          // selectedCountry가 삭제된 국가와 같으면 null로 설정
          if (selectedCountry && selectedCountry.country === countryEnglishName) {
            setSelectedCountry(null);
            if (window.innerWidth <= 768) {
              setShowGlobeControlsOnMobile(true);
            }
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
          
          // selectedCountry가 수정된 국가와 같으면 업데이트
          if (selectedCountry && selectedCountry.country === countryEnglishName) {
            const style = getVisitStyle(updatedTrips.length);
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

    // Supabase에서 삭제
    await deleteFromSupabase(countryEnglishName, tripToDelete);
    
    // 모달 닫기 및 데이터 초기화
    setDeleteTripData(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let globeInstance = null;
    let mounted = true;

    const toRad = deg => deg * Math.PI / 180;
    function haversineDistance(lat1, lng1, lat2, lng2) {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }


    const initGlobe = async () => {
      try {
        if (!isInitialLoad) {
          setIsLoading(true);
          setLoadingStatus('Loading...');
        }

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
            const distance = haversineDistance(arc.startLat, arc.startLng, arc.endLat, arc.endLng);

            if (distance > 17000) return 0.65;
            else if (distance > 15000) return 0.5;
            else if (distance > 10000) return 0.3;
            else if (distance > 8000) return 0.25;
            else if (distance > 6000) return 0.2;
            else if (distance > 4000) return 0.15;
            else if (distance > 2000) return 0.12;
            else if (distance > 1000) return 0.05;
            else return 0.015;
          })

          .arcStroke(1.5)
          .arcDashLength(1)
          .arcDashGap(0)
          .arcDashAnimateTime(0)
          .onArcClick(arc => {
            setSelectedLine(arc);
            setSelectedCountry(null);
            setSelectedLineIndex(0);
            setShowMobileStats(false); // Add this line
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
              setIsInitialLoad(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        setLoadingStatus('에러 발생: ' + error.message);
        
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
            setIsInitialLoad(false);
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

      {/* 로그인/로그아웃 및 설정 버튼 */}
      {/* 모바일과 데스크톱 공통: 왼쪽 하단에 로그인/로그아웃과 설정 버튼 */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-2">
        {user && (!selectedLine || window.innerWidth > 768) && (!selectedCountry || window.innerWidth > 768) ? (
          <>
            <button
              onClick={handleSignOut}
              className={`bg-red-600/90 hover:bg-red-700/90 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-lg ${
                window.innerWidth <= 768 
                  ? 'px-3 py-2 rounded-lg text-xs' 
                  : 'px-4 py-3 rounded-xl text-sm'
              }`}
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 text-white hover:bg-slate-800/95 transition-all ${
                window.innerWidth <= 768 
                  ? 'px-2 py-2 rounded-lg text-sm' 
                  : 'px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2'
              }`}
            >
              {window.innerWidth <= 768 ? '⚙️' : '⚙️ 설정'}
            </button>
          </>
        ) : (
          (!selectedLine || window.innerWidth > 768) && (!selectedCountry || window.innerWidth > 768) && (
          <button
            onClick={() => setShowAuth(true)}
            className={`bg-blue-600/90 hover:bg-blue-700/90 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-lg ${
              window.innerWidth <= 768 
                ? 'px-3 py-2 rounded-lg text-xs' 
                : 'px-4 py-3 rounded-xl text-sm'
            }`}
          >
            Sign In
          </button>
          )
        )}
      </div>

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
        setShowAllTrips={setShowAllTrips}
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

      <AllTripsModal 
        showAllTrips={showAllTrips}
        setShowAllTrips={setShowAllTrips}
        userTravelData={userTravelData}
        countryData={countryData}
        setEditingTrip={setEditingTrip}
        deleteCityTrip={deleteCityTrip}
        isMobile={isMobile}
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
        onSignOut={handleSignOut}
      />

      <ResetPasswordModal
        showResetPassword={showResetPassword}
        setShowResetPassword={setShowResetPassword}
      />

      {/* 성공 메시지 모달 */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md shadow-2xl border border-green-500/30 text-center">
            
            <p className="text-white whitespace-pre-line">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage('')}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}
      
      {/* 여행 기록 삭제 확인 모달 */}
      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTripData(null);
        }}
        onConfirm={executeDeleteCityTrip}
        title="⚠️ 여행 기록 삭제"
        message={
          deleteTripData ? (
            <div className="text-center text-white">
              <p className="font-bold text-lg mb-2 text-blue-400">
                {(countryData[deleteTripData.tripToDelete.country]?.koreanName || deleteTripData.tripToDelete.country || '알 수 없는 국가')} ({deleteTripData.tripToDelete.country})
              </p>
              <p className="text-sm text-slate-300 mb-1">
                📍 {(deleteTripData.tripToDelete.cities || []).join(', ')}
              </p>
              <p className="text-sm text-slate-400">
                📅 {(deleteTripData.tripToDelete.startDate || '날짜 미정')} ~ {(deleteTripData.tripToDelete.endDate || '날짜 미정')}
              </p>
              <p className="mt-4">이 여행 기록을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.</p>
            </div>
          ) : (
            <div className="text-center">
              이 여행 기록을 삭제하시겠습니까?
              <br />
              삭제된 데이터는 복구할 수 없습니다.
            </div>
          )
        }
        confirmText="삭제"
        cancelText="취소"
        isDestructive={true}
      />

      <AlertDialog
        show={showAlertModal}
        message={alertMessage}
        onClose={() => setShowAlertModal(false)}
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
