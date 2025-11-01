import React, { useRef, useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { countryData, getVisitStyle } from '../data/countryData';

import earthDayTextureUrl from '../assets/textures/earth-day.jpg';
import earthTopologyTextureUrl from '../assets/textures/earth-topology.png';
import earthNightTextureUrl from '../assets/textures/earth-night.jpg';
import earthBlueMarbleTextureUrl from '../assets/textures/earth-blue-marble.jpg';

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getArcHeight(lat1, lng1, lat2, lng2) {
  const distance = haversineDistance(lat1, lng1, lat2, lng2);
  // 웹 버전 값을 THREE.js 환경에 맞게 2배 증폭
  if (distance > 18000) return 2.0;      // 1.3
  else if (distance > 16000) return 1.7;  // 16000 이상은 높이 유지하고 곡선 형태로 완만하게
  else if (distance > 13000) return 1.2;  // 1.0
  else if (distance > 10000) return 1.0;  // 0.6
  else if (distance > 8000) return 0.7;  // 0.5
  else if (distance > 6000) return 0.6;   // 0.4
  else if (distance > 4000) return 0.3;  // 0.3
  else if (distance > 2000) return 0.24;  // 0.24
  else if (distance > 1000) return 0.1;  // 0.1
  else return 0.05;                      // 0.03
}

const TravelMarker = ({ point, onPointClick, onPointerOver, onPointerOut }) => {
    const meshRef = useRef();
    const [isHovered, setIsHovered] = useState(false);
    const style = getVisitStyle(point.visits);
    const scale = style.size * 0.12;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.scale.set(scale, scale, scale);
            if (isHovered) { meshRef.current.scale.multiplyScalar(1.5); }
        }
    });

    return (
        <mesh ref={meshRef} position={point.position} onClick={(e) => { e.stopPropagation(); onPointClick(point); }} onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); onPointerOver(point); }} onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); onPointerOut(); }}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color={style.color} transparent opacity={0.8} />
        </mesh>
    );
};

const Atmosphere = () => (
    <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[10, 64, 64]} />
        <shaderMaterial transparent vertexShader={`varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`} fragmentShader={`varying vec3 vNormal; void main() { float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0); gl_FragColor = vec4(0.3, 0.6, 1.0, 0.4) * intensity; }`} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
);

const Globe = forwardRef(({ globeMode, userTravelData, homeCountry, onPointClick, onLineClick }, ref) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [dayTexture, bumpMap, nightTexture, satelliteTexture] = useTexture([
        earthDayTextureUrl,
        earthTopologyTextureUrl,
        earthNightTextureUrl,
        earthBlueMarbleTextureUrl
    ]);

    const textures = {
        satellite: dayTexture,
        night: nightTexture,
        topographic: satelliteTexture
    };
    const currentTexture = textures[globeMode] || textures.satellite;

    const { travelPoints, travelArcs } = useMemo(() => {
        const points = Object.entries(userTravelData).map(([countryEnglishName, data]) => {
            if (!data.coordinates) return null;
            const style = getVisitStyle(data.visits);
            const displayCountryName = countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName;
            const position = latLngToVector3(data.coordinates[0], data.coordinates[1], 10);
            return {
                position, lat: data.coordinates[0], lng: data.coordinates[1],
                country: countryEnglishName, displayCountry: displayCountryName,
                visits: data.visits, lastVisit: data.lastVisit, cities: data.cities,
                description: data.description, size: style.size, color: style.color,
                glowColor: style.glow, trips: data.trips
            };
        }).filter(Boolean);

        // --- Arc Logic with Route Merging ---
        const allTripsFlat = [];
        Object.entries(userTravelData).forEach(([countryEnglishName, data]) => {
            if (!data.coordinates) return;
            (data.trips || []).forEach(trip => {
                allTripsFlat.push({ 
                    country: countryEnglishName, 
                    coords: data.coordinates, 
                    startDate: trip.startDate, 
                    endDate: trip.endDate, 
                    id: trip.id, 
                    cities: trip.cities 
                });
            });
        });
        allTripsFlat.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        const routesMap = {}; // 같은 경로 합치기 위해 Map 사용
        const defaultCountry = homeCountry || 'South Korea';
        const defaultCoords = countryData[defaultCountry]?.coords;

        if (defaultCoords) {
            const getRouteKey = (c1, c2) => [c1, c2].sort().join('-');
            
            const addOrUpdateRoute = (fromCountry, toCountry, fromCoords, toCoords, tripData, isHomeConnection = false) => {
                // 홈국가 연결이 아닌 경우, 한글 이름 기준 ㄱㄴㄷ 순 정렬
                let startCountry = fromCountry;
                let endCountry = toCountry;
                let startCoords = fromCoords;
                let endCoords = toCoords;
                
                if (!isHomeConnection) {
                    const fromKoreanName = countryData[fromCountry]?.koreanName || fromCountry;
                    const toKoreanName = countryData[toCountry]?.koreanName || toCountry;
                    
                    if (fromKoreanName > toKoreanName) {
                        startCountry = toCountry;
                        endCountry = fromCountry;
                        startCoords = toCoords;
                        endCoords = fromCoords;
                    }
                }
                
                const routeKey = getRouteKey(startCountry, endCountry);
                
                if (routesMap[routeKey]) {
                    // 기존 경로에 여행 추가
                    routesMap[routeKey].userData.trips.push(tripData);
                } else {
                    // 새 경로 생성
                    const startPos = latLngToVector3(startCoords[0], startCoords[1], 10.1);
                    const endPos = latLngToVector3(endCoords[0], endCoords[1], 10.1);
                    const distance = haversineDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
                    
                    // 웹 버전처럼 heightMultiplier를 직접 높이 비율로 사용
                    const heightMultiplier = getArcHeight(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
                    const arcHeight = 10 * (1 + heightMultiplier * 0.8);
                    
                    let curve;
                    
                    // 13000km 이상의 거리는 CubicBezierCurve3로 부드러운 U자 곡선 생성 (끊김 방지)
                    if (distance > 13000) {
                        // 제어점 1: 시작점에서 45% 지점, 높이는 arcHeight의 82%
                        const control1 = new THREE.Vector3().lerpVectors(startPos, endPos, 0.45)
                            .normalize()
                            .multiplyScalar(arcHeight * 0.80);
                        
                        // 제어점 2: 시작점에서 55% 지점, 높이는 arcHeight의 82%
                        const control2 = new THREE.Vector3().lerpVectors(startPos, endPos, 0.55)
                            .normalize()
                            .multiplyScalar(arcHeight * 0.80);
                        
                        curve = new THREE.CubicBezierCurve3(startPos, control1, control2, endPos);
                    } else {
                        // 13000km 이하는 기존 QuadraticBezierCurve3 사용
                        const mid = new THREE.Vector3().addVectors(startPos, endPos)
                            .multiplyScalar(0.5)
                            .normalize()
                            .multiplyScalar(arcHeight);
                        
                        curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
                    }
                    
                    curve.userData = { 
                        startCountry: startCountry, 
                        endCountry: endCountry, 
                        trips: [tripData] 
                    };
                    routesMap[routeKey] = curve;
                }
            };
            
            // 각 여행에 대해 연결 처리
            allTripsFlat.forEach((currentTrip) => {
                let connectedToCountry = null;
                let isOverlapping = false; // overlapping 여행인지 추적
                
                // 1. 다른 여행의 기간 내에 속하는지 확인
                const overlappingTrip = allTripsFlat.find(trip => {
                    if (trip.id === currentTrip.id) return false;
                    const tripStart = new Date(trip.startDate);
                    const tripEnd = new Date(trip.endDate);
                    const currentStart = new Date(currentTrip.startDate);
                    const currentEnd = new Date(currentTrip.endDate);
                    return currentStart >= tripStart && currentEnd <= tripEnd;
                });
                
                if (overlappingTrip) {
                    connectedToCountry = overlappingTrip.country;
                    isOverlapping = true; // overlapping 여행으로 표시
                    addOrUpdateRoute(
                        overlappingTrip.country,
                        currentTrip.country,
                        overlappingTrip.coords,
                        currentTrip.coords,
                        currentTrip,
                        false
                    );
                } else {
                    // 2. 이전 여행의 끝날과 현재 여행의 시작날이 같은지 확인
                    const connectingTrip = allTripsFlat.find(trip => 
                        trip.id !== currentTrip.id && trip.endDate === currentTrip.startDate
                    );
                    
                    if (connectingTrip) {
                        connectedToCountry = connectingTrip.country;
                        addOrUpdateRoute(
                            connectingTrip.country,
                            currentTrip.country,
                            connectingTrip.coords,
                            currentTrip.coords,
                            currentTrip,
                            false
                        );
                    } else {
                        // 3. 연결되지 않으면 홈 국가와 연결
                        if (currentTrip.country !== defaultCountry) {
                            addOrUpdateRoute(
                                defaultCountry,
                                currentTrip.country,
                                defaultCoords,
                                currentTrip.coords,
                                currentTrip,
                                true
                            );
                        }
                    }
                }
                
                // 4. 현재 여행이 끝난 후 홈 국가로 돌아가는 선 추가
                // overlapping 여행은 홈국가 연결을 만들지 않음
                if (connectedToCountry && !isOverlapping) {
                    const nextTrip = allTripsFlat.find(trip => 
                        trip.id !== currentTrip.id && trip.startDate === currentTrip.endDate
                    );
                    
                    if (!nextTrip && currentTrip.country !== defaultCountry) {
                        addOrUpdateRoute(
                            currentTrip.country,
                            defaultCountry,
                            currentTrip.coords,
                            defaultCoords,
                            currentTrip,
                            true
                        );
                    }
                }
            });
        }
        
        const routes = Object.values(routesMap);
        return { travelPoints: points, travelArcs: routes };
    }, [userTravelData, homeCountry]);

    return (
        <group ref={ref}>
            <ambientLight intensity={globeMode === 'night' ? 0.5 : 0.6} />
            <directionalLight position={[10, 10, 5]} intensity={globeMode === 'night' ? 1.0 : 1.2} />
            <Atmosphere />
            <mesh>
                <sphereGeometry args={[10, 64, 64]} />
                <meshStandardMaterial map={currentTexture} bumpMap={bumpMap} bumpScale={0.05} metalness={0.1} roughness={0.7} />
            </mesh>
            {travelPoints.map(point => <TravelMarker key={point.country} point={point} onPointClick={onPointClick} onPointerOver={setHoveredPoint} onPointerOut={() => setHoveredPoint(null)} /> )}
            {travelArcs.map((curve, index) => <Line key={index} points={curve.getPoints(150)} color="#60a5fa" lineWidth={5} transparent opacity={1.0} onPointerDown={(e) => { e.stopPropagation(); onLineClick(curve.userData); }} /> )}
        </group>
    );
});

const SceneWrapper = forwardRef(({ globeMode, userTravelData, homeCountry, onPointClick, onLineClick }, ref) => {
    const { camera } = useThree();
    const controlsRef = useRef();
    const [target, setTarget] = useState(null);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    useImperativeHandle(ref, () => ({
        goToCountry: (countryName, altitude) => {
            const countryInfo = countryData[countryName];
            if (countryInfo) {
                const lat = countryInfo.coords[0];
                const lng = countryInfo.coords[1];
                setTarget({
                    lat: lat,
                    lng: lng,
                    altitude: altitude || 3.0
                });
            }
        },
        resetView: () => {
            const homeData = countryData[homeCountry || 'South Korea'];
            if (homeData) {
                const lat = homeData.coords[0];
                const lng = homeData.coords[1];
                setTarget({
                    lat: lat,
                    lng: lng,
                    altitude: 3.5
                });
            }
        },
        pointOfView: ({ lat, lng, altitude }) => {
            setTarget({
                lat: lat,
                lng: lng,
                altitude: altitude || 3.0
            });
        },
        toggleRotation: () => {
            setIsAutoRotating(prev => !prev);
        },
        zoomIn: () => {
            if (controlsRef.current) {
                controlsRef.current.dollyIn(1.2);
            }
        },
        zoomOut: () => {
            if (controlsRef.current) {
                controlsRef.current.dollyOut(1.2);
            }
        }
    }));

    useEffect(() => {
        if (target && controlsRef.current) {
            const controls = controlsRef.current;
            controls.enabled = false;
            
            // 타겟 지점의 표면 좌표 계산
            const targetPoint = latLngToVector3(target.lat, target.lng, 10);
            
            // 카메라가 타겟을 바라보는 위치 계산
            const distance = 10 + (target.altitude || 3.0) * 5;
            const cameraTarget = targetPoint.clone().normalize().multiplyScalar(distance);
            
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            
            let animationFrameId;
            const duration = 1000;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeInOutCubic
                const eased = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                camera.position.lerpVectors(startPosition, cameraTarget, eased);
                const newTarget = new THREE.Vector3().lerpVectors(startTarget, new THREE.Vector3(0, 0, 0), eased);
                controls.target.copy(newTarget);
                
                controls.update();
                
                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    camera.position.copy(cameraTarget);
                    controls.target.set(0, 0, 0);
                    controls.update();
                    setTarget(null);
                    controls.enabled = true;
                }
            };
            
            animationFrameId = requestAnimationFrame(animate);
            
            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [target, camera]);

    useFrame(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = isAutoRotating && !target;
            controlsRef.current.update();
        }
    });

    return (
        <>
            <Stars radius={200} depth={50} count={8000} factor={5} saturation={0} fade speed={1} />
            <Globe globeMode={globeMode} userTravelData={userTravelData} homeCountry={homeCountry} 
                onPointClick={(point) => { 
                    onPointClick(point); 
                    setTarget({
                        lat: point.lat,
                        lng: point.lng,
                        altitude: 3.0
                    });
                }} 
                onLineClick={onLineClick} 
            />
            <OrbitControls ref={controlsRef} target={[0, 0, 0]} enablePan={false} enableZoom enableRotate minDistance={12} maxDistance={100} autoRotate={!target} autoRotateSpeed={0.3} />
        </>
    );
});

const R3FGlobe = forwardRef(({ globeMode, userTravelData, homeCountry, onPointClick, onLineClick }, ref) => (
    <Canvas camera={{ position: [0, 0, 35], fov: 40 }}>
        <SceneWrapper ref={ref} globeMode={globeMode} userTravelData={userTravelData} homeCountry={homeCountry} onPointClick={onPointClick} onLineClick={onLineClick} />
    </Canvas>
));

export default R3FGlobe;
