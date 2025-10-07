import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const ImprovedTravelGlobe = React.forwardRef(({ 
  userTravelData: propUserTravelData = {},
  homeCountry = '대한민국',
  globeMode: propGlobeMode = 'satellite',
  onCountryClick,
  onLineClick 
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const markersRef = useRef([]);
  const linesRef = useRef([]);
  const animationIdRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [globeMode, setGlobeMode] = useState(propGlobeMode);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isMobile] = useState(window.innerWidth < 768);

  const countryDatabase = {
    '대한민국': { coords: [37.5665, 126.9780] }, 'South Korea': { coords: [37.5665, 126.9780] },
    '일본': { coords: [36.2048, 138.2529] }, 'Japan': { coords: [36.2048, 138.2529] },
    '중국': { coords: [35.8617, 104.1954] }, 'China': { coords: [35.8617, 104.1954] },
    '미국': { coords: [39.8283, -98.5795] }, 'United States': { coords: [39.8283, -98.5795] },
    '캐나다': { coords: [56.1304, -106.3468] }, 'Canada': { coords: [56.1304, -106.3468] },
    '프랑스': { coords: [46.6034, 2.2137] }, 'France': { coords: [46.6034, 2.2137] },
    '독일': { coords: [51.1657, 10.4515] }, 'Germany': { coords: [51.1657, 10.4515] },
    '이탈리아': { coords: [41.8719, 12.5674] }, 'Italy': { coords: [41.8719, 12.5674] },
    '영국': { coords: [55.3781, -3.4360] }, 'United Kingdom': { coords: [55.3781, -3.4360] },
    '호주': { coords: [-25.2744, 133.7751] }, 'Australia': { coords: [-25.2744, 133.7751] },
    '태국': { coords: [15.8700, 100.9925] }, 'Thailand': { coords: [15.8700, 100.9925] }
  };

  const visitColors = { 1: 0x10b981, 2: 0xf59e0b, 3: 0x3b82f6, 4: 0x8b5cf6, 5: 0xef4444 };
  const [userTravelData, setUserTravelData] = useState(propUserTravelData);

  useEffect(() => { if (propUserTravelData && Object.keys(propUserTravelData).length > 0) setUserTravelData(propUserTravelData); }, [propUserTravelData]);
  useEffect(() => { setGlobeMode(propGlobeMode); }, [propGlobeMode]);

  const latLngToVector3 = useCallback((lat, lng, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180), theta = (lng + 90) * (Math.PI / 180);
    return new THREE.Vector3(-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const createEarthTexture = useCallback((mode) => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    let oceanColors, landColors;
    if (mode === 'satellite') {
      oceanColors = { start: '#1e40af', mid: '#2563eb', end: '#3b82f6' };
      landColors = ['#22c55e', '#16a34a', '#eab308', '#15803d', '#166534', '#ca8a04'];
    } else if (mode === 'night') {
      oceanColors = { start: '#0f172a', mid: '#1e293b', end: '#334155' };
      landColors = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
    } else {
      oceanColors = { start: '#0ea5e9', mid: '#38bdf8', end: '#7dd3fc' };
      landColors = ['#86efac', '#4ade80', '#fbbf24', '#34d399', '#10b981', '#f59e0b'];
    }
    const oceanGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.height);
    oceanGradient.addColorStop(0, oceanColors.start); oceanGradient.addColorStop(0.5, oceanColors.mid); oceanGradient.addColorStop(1, oceanColors.end);
    ctx.fillStyle = oceanGradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const continents = [
      { x: 2400, y: 400, w: 1200, h: 600, colorIndex: 0 }, { x: 1800, y: 300, w: 600, h: 400, colorIndex: 1 },
      { x: 1900, y: 700, w: 400, h: 800, colorIndex: 2 }, { x: 400, y: 200, w: 800, h: 600, colorIndex: 3 },
      { x: 800, y: 800, w: 300, h: 700, colorIndex: 4 }, { x: 2800, y: 1200, w: 400, h: 200, colorIndex: 5 }
    ];
    continents.forEach(continent => {
      ctx.fillStyle = landColors[continent.colorIndex]; ctx.beginPath();
      for (let i = 0; i <= 50; i++) {
        const angle = (i / 50) * Math.PI * 2, radiusX = continent.w / 2, radiusY = continent.h / 2;
        const centerX = continent.x + radiusX, centerY = continent.y + radiusY;
        const irregularity = 0.7 + Math.sin(angle * 5) * 0.1 + Math.sin(angle * 13) * 0.05;
        const x = centerX + Math.cos(angle) * radiusX * irregularity, y = centerY + Math.sin(angle) * radiusY * irregularity;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = mode === 'night' ? '#475569' : '#0f766e'; ctx.lineWidth = 3; ctx.stroke();
    });
    if (mode === 'night') {
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < 500; i++) { ctx.beginPath(); ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill(); }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const createGlobe = useCallback(() => new THREE.Mesh(new THREE.SphereGeometry(2, 128, 128), new THREE.MeshPhongMaterial({ map: createEarthTexture(globeMode), shininess: 30, bumpScale: 0.02 })), [globeMode, createEarthTexture]);

  const createMarkers = useCallback(() => {
    const markers = [];
    Object.entries(userTravelData).forEach(([country, data]) => {
      const countryInfo = countryDatabase[country];
      if (!countryInfo) return;
      const visits = data.visits || data.trips?.length || 1;
      const position = latLngToVector3(countryInfo.coords[0], countryInfo.coords[1], 2);
      const color = visitColors[Math.min(visits, 5)];
      const pinHeight = 0.15 + (visits * 0.02);
      const pinGroup = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.5, shininess: 100 }));
      head.position.y = pinHeight; pinGroup.add(head);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.01, pinHeight, 16), new THREE.MeshPhongMaterial({ color, opacity: 0.8, transparent: true }));
      body.position.y = pinHeight / 2; pinGroup.add(body);
      pinGroup.position.copy(position);
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize());
      pinGroup.userData = { country, data, isPin: true, visits };
      markers.push(pinGroup);
    });
    return markers;
  }, [latLngToVector3, userTravelData, countryDatabase, visitColors]);

  const createGreatCircleArc = useCallback((start, end, maxHeight) => {
    const points = [];
    for (let i = 0; i <= 200; i++) {
      const p = new THREE.Vector3().lerpVectors(start, end, i / 200);
      p.normalize().multiplyScalar(2 + maxHeight * Math.sin(Math.PI * i / 200));
      points.push(p);
    }
    return points;
  }, []);

  const createTravelLines = useCallback(() => {
    const lines = [], visitedCountries = Object.keys(userTravelData);
    if (visitedCountries.length < 2) return lines;
    const homeInfo = countryDatabase[homeCountry];
    if (!homeInfo) return lines;
    const homePos = latLngToVector3(homeInfo.coords[0], homeInfo.coords[1], 2);
    visitedCountries.forEach(country => {
      if (country === homeCountry) return;
      const countryInfo = countryDatabase[country];
      if (!countryInfo) return;
      const countryPos = latLngToVector3(countryInfo.coords[0], countryInfo.coords[1], 2);
      const distance = calculateDistance(homeInfo.coords[0], homeInfo.coords[1], countryInfo.coords[0], countryInfo.coords[1]);
      const arc = createGreatCircleArc(homePos, countryPos, Math.min(1.5, distance / 20000 * 1.5));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arc), new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7 }));
      line.userData = { type: 'travel-line', from: homeCountry, to: country, isLine: true };
      lines.push(line);
    });
    return lines;
  }, [userTravelData, countryDatabase, homeCountry, latLngToVector3, calculateDistance, createGreatCircleArc]);

  const createStarField = useCallback(() => {
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
      const radius = 100 + Math.random() * 100, theta = Math.random() * Math.PI * 2, phi = Math.random() * Math.PI;
      starVertices.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi));
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    return new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.8 }));
  }, []);

  const updateGlobeData = useCallback(() => {
    if (!globeGroupRef.current) return;
    markersRef.current.forEach(m => globeGroupRef.current.remove(m));
    linesRef.current.forEach(l => globeGroupRef.current.remove(l));
    const newMarkers = createMarkers();
    newMarkers.forEach(m => globeGroupRef.current.add(m));
    markersRef.current = newMarkers;
    const newLines = createTravelLines();
    newLines.forEach(l => globeGroupRef.current.add(l));
    linesRef.current = newLines;
  }, [createMarkers, createTravelLines]);

  const setupEvents = useCallback(() => {
    let isDragging = false, prev = { x: 0, y: 0 };
    const onDown = (e) => { isDragging = true; prev = { x: e.clientX, y: e.clientY }; };
    const onMove = (e) => {
      if (!isDragging || !globeGroupRef.current) return;
      const delta = { x: e.clientX - prev.x, y: e.clientY - prev.y };
      globeGroupRef.current.rotation.y += delta.x * 0.008;
      globeGroupRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroupRef.current.rotation.x + delta.y * 0.008));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging = false; };
    const onClick = (e) => {
      if (isDragging) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(globeGroupRef.current.children, true);
      const lineHit = intersects.find(i => i.object.userData.type === 'travel-line');
      const markerHit = intersects.find(i => i.object.parent?.userData?.isPin);
      if (lineHit) { setSelectedLine(lineHit.object.userData); setSelectedCountry(null); if (onLineClick) onLineClick(lineHit.object.userData); }
      else if (markerHit) { const m = markerHit.object.parent; setSelectedCountry({ country: m.userData.country, ...m.userData.data }); setSelectedLine(null); if (onCountryClick) onCountryClick({ country: m.userData.country, ...m.userData.data }); }
      else { setSelectedCountry(null); setSelectedLine(null); }
    };
    const onWheel = (e) => { e.preventDefault(); if (cameraRef.current) cameraRef.current.position.z = Math.max(3, Math.min(15, cameraRef.current.position.z + e.deltaY * 0.003)); };
    const r = rendererRef.current;
    if (r) {
      r.domElement.addEventListener('mousedown', onDown);
      r.domElement.addEventListener('mousemove', onMove);
      r.domElement.addEventListener('mouseup', onUp);
      r.domElement.addEventListener('click', onClick);
      r.domElement.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        r.domElement.removeEventListener('mousedown', onDown);
        r.domElement.removeEventListener('mousemove', onMove);
        r.domElement.removeEventListener('mouseup', onUp);
        r.domElement.removeEventListener('click', onClick);
        r.domElement.removeEventListener('wheel', onWheel);
      };
    }
  }, [onCountryClick, onLineClick]);

  const animate = useCallback(() => {
    if (isAnimating && globeGroupRef.current) {
      globeGroupRef.current.rotation.y += 0.002;
    }
    if (rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
    TWEEN.update();
  }, [isAnimating]);

  const goToLatLng = useCallback((lat, lng) => {
    const targetRotationY = (90 - lng) * (Math.PI / 180);
    const targetRotationX = lat * (Math.PI / 180);

    new TWEEN.Tween(globeGroupRef.current.rotation)
      .to({ x: targetRotationX, y: targetRotationY }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }, []);

  const resetView = useCallback(() => {
    const homeInfo = countryDatabase[homeCountry];
    if (homeInfo) {
      goToLatLng(homeInfo.coords[0], homeInfo.coords[1]);
    }
  }, [homeCountry, countryDatabase, goToLatLng]);

  const toggleRotation = useCallback(() => { setIsAnimating(p => !p); }, []);
  const zoomIn = useCallback(() => { if (cameraRef.current) cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 0.5); }, []);
  const zoomOut = useCallback(() => { if (cameraRef.current) cameraRef.current.position.z = Math.min(30, cameraRef.current.position.z + 0.5); }, []);

  useImperativeHandle(ref, () => ({
    goToLatLng,
    zoomIn,
    zoomOut,
    resetView,
    toggleRotation,
    goToCountry: (country) => {
      const countryInfo = countryDatabase[country];
      if (countryInfo) {
        goToLatLng(countryInfo.coords[0], countryInfo.coords[1]);
      }
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6); cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(10, 5, 10); scene.add(light);
    const globeGroup = new THREE.Group(); scene.add(globeGroup); globeGroupRef.current = globeGroup;
    globeGroup.add(createGlobe());
    const markers = createMarkers();
    markers.forEach(m => globeGroup.add(m)); markersRef.current = markers;
    const lines = createTravelLines();
    lines.forEach(l => globeGroup.add(l)); linesRef.current = lines;
    scene.add(createStarField());
    const cleanup = setupEvents();
    animationIdRef.current = requestAnimationFrame(animate);
    setTimeout(() => setIsLoading(false), 1500);
    const handleResize = () => { if (camera && renderer) { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); } };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (cleanup) cleanup();
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [createGlobe, createMarkers, createTravelLines, createStarField, setupEvents, animate]);

  useEffect(() => { if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current); animationIdRef.current = requestAnimationFrame(animate); return () => { if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current); }; }, [animate]);
  useEffect(() => { if (globeGroupRef.current && Object.keys(userTravelData).length > 0) updateGlobeData(); }, [userTravelData, updateGlobeData]);
  useEffect(() => {
    if (globeGroupRef.current) {
      const globe = globeGroupRef.current.children.find(c => c.type === 'Mesh' && c.geometry.type === 'SphereGeometry');
      if (globe) { globe.material.map = createEarthTexture(globeMode); globe.material.needsUpdate = true; }
    }
  }, [globeMode, createEarthTexture]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div ref={mountRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-black/80 p-10 rounded-2xl border border-white/10 text-center">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-white text-xl font-semibold">🌍 지구본 로딩 중...</p>
          </div>
        </div>
      )}
      <div className={`absolute ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} z-10`}>
        <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20">
          <div className="text-white font-bold text-sm mb-3">👀 모드</div>
          <div className="space-y-2">
            {['satellite', 'night', 'topographic'].map(m => (
              <button key={m} onClick={() => setGlobeMode(m)} className={`w-full px-4 py-2 rounded-lg font-medium ${globeMode === m ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                {m === 'satellite' ? '🛰️ 위성' : m === 'night' ? '🌙 야간' : '🗺️ 지형'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={zoomOut} className="flex-1 bg-blue-600 text-white font-bold rounded-lg py-2">+</button>
            <button onClick={zoomIn} className="flex-1 bg-blue-600 text-white font-bold rounded-lg py-2">-</button>
          </div>
        </div>
      </div>
      {!isMobile && (
        <div className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10">
          <div className="text-white font-bold text-sm mb-3">🎮 조작</div>
          <div className="space-y-2">
            <button onClick={resetView} className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold">🏠 홈</button>
            <button onClick={toggleRotation} className={`w-full px-4 py-2 rounded-xl font-semibold text-white ${isAnimating ? 'bg-red-600' : 'bg-green-600'}`}>
              {isAnimating ? '⏸️ 정지' : '▶️ 회전'}
            </button>
          </div>
        </div>
      )}
      {selectedCountry && (
        <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-6 left-6'} bg-white/95 rounded-2xl shadow-2xl p-5 border border-white/20 z-10 max-w-md`}>
          <button onClick={() => setSelectedCountry(null)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xl">×</button>
          <h3 className="text-slate-800 font-bold text-xl mb-3">🌍 {selectedCountry.country}</h3>
          <div className="text-slate-600 text-sm">
            <div className="mb-2"><strong>방문:</strong> {selectedCountry.visits || 1}회</div>
            {selectedCountry.trips && selectedCountry.trips.map((t, i) => (
              <div key={i} className="bg-slate-100 p-3 rounded-lg mb-2">
                <div><strong>장소:</strong> {t.location}</div>
                <div><strong>날짜:</strong> {t.dates}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedLine && (
        <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-6 left-1/2 -translate-x-1/2'} bg-white/95 rounded-2xl shadow-2xl p-4 border border-white/20 z-10`}>
          <button onClick={() => setSelectedLine(null)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">×</button>
          <div className="text-center text-slate-800 font-semibold">{selectedLine.from} → {selectedLine.to}</div>
        </div>
      )}
    </div>
  );
});

export default ImprovedTravelGlobe;