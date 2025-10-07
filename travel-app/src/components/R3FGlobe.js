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
            if (!data.coordinates) return null; // Fix for delete crash
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

        // --- Full Original Arc Logic ---
        const allTripsFlat = [];
        Object.entries(userTravelData).forEach(([countryEnglishName, data]) => {
            if (!data.coordinates) return; // Fix for delete crash
            (data.trips || []).forEach(trip => {
                allTripsFlat.push({ country: countryEnglishName, coords: data.coordinates, startDate: trip.startDate, endDate: trip.endDate, id: trip.id, cities: trip.cities });
            });
        });
        allTripsFlat.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const routesMap = {};
        const defaultCountry = homeCountry || 'South Korea';
        const defaultCoords = countryData[defaultCountry]?.coords;

        if (defaultCoords) {
            const getRouteKey = (c1, c2) => [c1, c2].sort().join('-');
            const createRoute = (c1, c2, co1, co2, trips) => {
                const startPos = latLngToVector3(co1[0], co1[1], 10.1);
                const endPos = latLngToVector3(co2[0], co2[1], 10.1);
                const distance = startPos.distanceTo(endPos);
                const heightMultiplier = 0.1 + (distance / 20) * 0.6;
                const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5).normalize().multiplyScalar(10 + distance * heightMultiplier);
                const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
                curve.userData = { from: c1, to: c2, trips: trips };
                return curve;
            };

            allTripsFlat.forEach((currentTrip, index) => {
                let hasConnection = false;
                const connectingTrips = allTripsFlat.filter((trip, i) => i < index && trip.endDate === currentTrip.startDate);
                if (connectingTrips.length > 0) {
                    connectingTrips.forEach(cTrip => {
                        const routeKey = getRouteKey(cTrip.country, currentTrip.country);
                        if (!routesMap[routeKey]) routesMap[routeKey] = createRoute(cTrip.country, currentTrip.country, cTrip.coords, currentTrip.coords, [cTrip, currentTrip]);
                    });
                    hasConnection = true;
                }
                if (!hasConnection) {
                    const routeKey = getRouteKey(defaultCountry, currentTrip.country);
                    if (currentTrip.country !== defaultCountry && !routesMap[routeKey]) {
                        routesMap[routeKey] = createRoute(defaultCountry, currentTrip.country, defaultCoords, currentTrip.coords, [currentTrip]);
                    }
                }
            });
        }
        const arcs = Object.values(routesMap);
        return { travelPoints: points, travelArcs: arcs };
    }, [userTravelData, homeCountry]);

    return (
        <group ref={ref}>
            <ambientLight intensity={globeMode === 'night' ? 0.1 : 0.6} />
            <directionalLight position={[10, 10, 5]} intensity={globeMode === 'night' ? 0.3 : 1.2} />
            <Atmosphere />
            <mesh>
                <sphereGeometry args={[10, 64, 64]} />
                <meshStandardMaterial map={currentTexture} bumpMap={bumpMap} bumpScale={0.05} metalness={0.1} roughness={0.7} />
            </mesh>
            {travelPoints.map(point => <TravelMarker key={point.country} point={point} onPointClick={onPointClick} onPointerOver={setHoveredPoint} onPointerOut={() => setHoveredPoint(null)} /> )}
            {travelArcs.map((curve, index) => <Line key={index} points={curve.getPoints(50)} color="#60a5fa" lineWidth={1} transparent opacity={0.6} onPointerDown={(e) => { e.stopPropagation(); onLineClick(curve.userData); }} /> )}
            {hoveredPoint && (
                <Html position={hoveredPoint.position.clone().multiplyScalar(1.05)}>
                    <div className="html-label">
                        <h3>{hoveredPoint.displayCountry}</h3>
                        <p>방문 횟수: {hoveredPoint.visits}회</p>
                        <p>마지막 방문: {hoveredPoint.lastVisit}</p>
                        <p>방문 도시: {hoveredPoint.cities.join(', ')}</p>
                    </div>
                </Html>
            )}
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
                const lng = countryInfo.coords[1];
                const lat = countryInfo.coords[0];
                setTarget({
                    lat: lat,
                    lng: lng,
                    altitude: altitude || 3.0,
                    angles: {
                        azimuthal: -lng * Math.PI / 180,
                        polar: (90 - lat) * Math.PI / 180
                    }
                });
            }
        },
        resetView: () => {
            const homeData = countryData[homeCountry || 'South Korea'];
            if (homeData) {
                const lng = homeData.coords[1];
                const lat = homeData.coords[0];
                setTarget({
                    lat: lat,
                    lng: lng,
                    altitude: 3.5,
                    angles: {
                        azimuthal: -lng * Math.PI / 180,
                        polar: (90 - lat) * Math.PI / 180
                    }
                });
            }
        },
        pointOfView: ({ lat, lng, altitude }) => {
            setTarget({
                lat: lat,
                lng: lng,
                altitude: altitude || 3.0,
                angles: {
                    azimuthal: -lng * Math.PI / 180,
                    polar: (90 - lat) * Math.PI / 180
                }
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
            
            const startAzimuthal = controls.getAzimuthalAngle();
            const startPolar = controls.getPolarAngle();
            const startDistance = camera.position.length();
            
            const targetAzimuthal = target.angles.azimuthal;
            const targetPolar = target.angles.polar;
            const targetDistance = 10 + (target.altitude || 3.0) * 5;
            
            let animationFrameId;
            const duration = 1000; // 1 second animation
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const newAzimuthal = THREE.MathUtils.lerp(startAzimuthal, targetAzimuthal, progress);
                const newPolar = THREE.MathUtils.lerp(startPolar, targetPolar, progress);
                const newDistance = THREE.MathUtils.lerp(startDistance, targetDistance, progress);
                
                controls.setAzimuthalAngle(newAzimuthal);
                controls.setPolarAngle(newPolar);
                camera.position.copy(camera.position.clone().normalize().multiplyScalar(newDistance));
                
                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
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
                    const lng = point.lng;
                    const lat = point.lat;
                    setTarget({
                        lat: lat,
                        lng: lng,
                        altitude: 3.0,
                        angles: {
                            azimuthal: -lng * Math.PI / 180,
                            polar: (90 - lat) * Math.PI / 180
                        }
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