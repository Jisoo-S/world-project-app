import React, { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
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

const Globe = ({ globeMode, userTravelData, homeCountry, onPointClick }) => {
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
                allTripsFlat.push({ country: countryEnglishName, coords: data.coordinates, startDate: trip.startDate, endDate: trip.endDate });
            });
        });
        allTripsFlat.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const routesMap = {};
        const defaultCountry = homeCountry || 'South Korea';
        const defaultCoords = countryData[defaultCountry]?.coords;

        if (defaultCoords) {
            const getRouteKey = (c1, c2) => [c1, c2].sort().join('-');
            const isDateOverlapping = (s1, e1, s2, e2) => new Date(s1) <= new Date(e2) && new Date(s2) <= new Date(e1);
            const createRoute = (c1, c2, co1, co2) => {
                const startPos = latLngToVector3(co1[0], co1[1], 10);
                const endPos = latLngToVector3(co2[0], co2[1], 10);
                const distance = startPos.distanceTo(endPos);
                const heightMultiplier = 0.1 + (distance / 20) * 0.4;
                const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5).normalize().multiplyScalar(10 + distance * heightMultiplier);
                return new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
            };

            allTripsFlat.forEach((currentTrip, index) => {
                let hasConnection = false;
                const connectingTrips = allTripsFlat.filter((trip, i) => i < index && trip.endDate === currentTrip.startDate);
                if (connectingTrips.length > 0) {
                    connectingTrips.forEach(cTrip => {
                        const routeKey = getRouteKey(cTrip.country, currentTrip.country);
                        if (!routesMap[routeKey]) routesMap[routeKey] = createRoute(cTrip.country, currentTrip.country, cTrip.coords, currentTrip.coords);
                    });
                    hasConnection = true;
                }
                if (!hasConnection) {
                    const routeKey = getRouteKey(defaultCountry, currentTrip.country);
                    if (currentTrip.country !== defaultCountry && !routesMap[routeKey]) {
                        routesMap[routeKey] = createRoute(defaultCountry, currentTrip.country, defaultCoords, currentTrip.coords);
                    }
                }
            });
        }
        const arcs = Object.values(routesMap);
        return { travelPoints: points, travelArcs: arcs };
    }, [userTravelData, homeCountry]);

    return (
        <group>
            <ambientLight intensity={globeMode === 'night' ? 0.1 : 0.3} />
            <directionalLight position={[10, 10, 5]} intensity={globeMode === 'night' ? 0.3 : 1.0} />
            <Atmosphere />
            <mesh>
                <sphereGeometry args={[10, 64, 64]} />
                <meshStandardMaterial map={currentTexture} bumpMap={bumpMap} bumpScale={0.05} metalness={0.1} roughness={0.7} />
            </mesh>
            {travelPoints.map(point => <TravelMarker key={point.country} point={point} onPointClick={onPointClick} onPointerOver={setHoveredPoint} onPointerOut={() => setHoveredPoint(null)} /> )}
            {travelArcs.map((curve, index) => <Line key={index} points={curve.getPoints(50)} color="#60a5fa" lineWidth={1} transparent opacity={0.6} /> )}
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
};

const SceneWrapper = forwardRef(({ globeMode, userTravelData, homeCountry, onPointClick }, ref) => {
    const { camera } = useThree();
    const controlsRef = useRef();
    const [target, setTarget] = useState(null);

    useImperativeHandle(ref, () => ({
        goToCountry: (countryName) => {
            const countryInfo = countryData[countryName];
            if (countryInfo) {
                setTarget({ lat: countryInfo.coords[0], lng: countryInfo.coords[1], altitude: 2.2 });
            }
        },
        pointOfView: ({ lat, lng, altitude }) => {
            setTarget({ lat, lng, altitude: altitude || 2.2 });
        },
        resetView: () => {
            const homeData = countryData[homeCountry || 'South Korea'];
            if (homeData) {
                setTarget({ lat: homeData.coords[0], lng: homeData.coords[1], altitude: 2.5 });
            }
        },
        toggleRotation: () => {
            if (controlsRef.current) {
                controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
            }
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

    useFrame(() => {
        if (target && controlsRef.current) {
            controlsRef.current.enabled = false;
            const targetPosition = latLngToVector3(target.lat, target.lng, 10);
            const altitude = target.altitude || 2.2;
            const cameraPosition = new THREE.Vector3().copy(targetPosition).normalize().multiplyScalar(10 + altitude * 5);

            camera.position.lerp(cameraPosition, 0.1);
            // controlsRef.current.target.lerp(targetPosition, 0.05); // Keep target at center

            if (camera.position.distanceTo(cameraPosition) < 0.1) {
                setTarget(null);
                controlsRef.current.enabled = true;
                controlsRef.current.update();
            }
        } else if (controlsRef.current) {
            controlsRef.current.update();
        }
    });

    return (
        <>
            <Stars radius={200} depth={50} count={8000} factor={5} saturation={0} fade speed={1} />
            <Globe globeMode={globeMode} userTravelData={userTravelData} homeCountry={homeCountry} onPointClick={(point) => { onPointClick(point); setTarget({ lat: point.lat, lng: point.lng, altitude: 2.2 }); }} />
            <OrbitControls ref={controlsRef} target={[0, 0, 0]} enablePan={false} enableZoom enableRotate minDistance={12} maxDistance={100} autoRotate={!target} autoRotateSpeed={0.3} />
        </>
    );
});

const R3FGlobe = forwardRef(({ globeMode, userTravelData, homeCountry, onPointClick }, ref) => (
    <Canvas camera={{ position: [0, 10, 35], fov: 40 }}>
        <SceneWrapper ref={ref} globeMode={globeMode} userTravelData={userTravelData} homeCountry={homeCountry} onPointClick={onPointClick} />
    </Canvas>
));

export default R3FGlobe;