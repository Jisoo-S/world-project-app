export const countryData = {
  'South Korea': { coords: [37.5665, 126.9780], koreanName: '대한민국' },
  'Japan': { coords: [36.2048, 138.2529], koreanName: '일본' },
  'United States': { coords: [39.8283, -98.5795], koreanName: '미국' },
  'France': { coords: [46.6034, 2.2137], koreanName: '프랑스' },
  'Italy': { coords: [41.8719, 12.5674], koreanName: '이탈리아' },
  'Germany': { coords: [51.1657, 10.4515], koreanName: '독일' },
  'United Kingdom': { coords: [55.3781, -3.4360], koreanName: '영국' },
  'Spain': { coords: [40.4637, -3.7492], koreanName: '스페인' },
  'Canada': { coords: [56.1304, -106.3468], koreanName: '캐나다' },
  'Australia': { coords: [-25.2744, 133.7751], koreanName: '호주' },
  'China': { coords: [35.8617, 104.1954], koreanName: '중국' },
  'India': { coords: [20.5937, 78.9629], koreanName: '인도' },
  'Brazil': { coords: [-14.2350, -51.9253], koreanName: '브라질' },
  'Mexico': { coords: [23.6345, -102.5528], koreanName: '멕시코' },
  'Russia': { coords: [61.5240, 105.3188], koreanName: '러시아' },
  'South Africa': { coords: [-30.5595, 22.9375], koreanName: '남아프리카' },
  'Egypt': { coords: [26.8206, 30.8025], koreanName: '이집트' },
  'Turkey': { coords: [38.9637, 35.2433], koreanName: '튀르키예' },
  'Greece': { coords: [39.0742, 21.8243], koreanName: '그리스' },
  'Thailand': { coords: [15.8700, 100.9925], koreanName: '태국' },
  'Vietnam': { coords: [14.0583, 108.2772], koreanName: '베트남' },
  'Singapore': { coords: [1.3521, 103.8198], koreanName: '싱가포르' },
  'Indonesia': { coords: [-0.7893, 113.9213], koreanName: '인도네시아' },
  'Philippines': { coords: [12.8797, 121.7740], koreanName: '필리핀' },
  'New Zealand': { coords: [-40.9006, 174.8860], koreanName: '뉴질랜드' },
  'Argentina': { coords: [-38.4161, -63.6167], koreanName: '아르헨티나' },
  'Chile': { coords: [-35.6751, -71.5430], koreanName: '칠레' },
  'Peru': { coords: [-9.1900, -75.0152], koreanName: '페루' },
  'Morocco': { coords: [31.7917, -7.0926], koreanName: '모로코' },
  'Kenya': { coords: [-0.0236, 37.9062], koreanName: '케냐' },
  'Netherlands': { coords: [52.1326, 5.2913], koreanName: '네덜란드' },
  'Belgium': { coords: [50.5039, 4.4699], koreanName: '벨기에' },
  'Switzerland': { coords: [46.8182, 8.2275], koreanName: '스위스' },
  'Austria': { coords: [47.5162, 14.5501], koreanName: '오스트리아' },
  'Sweden': { coords: [60.1282, 18.6435], koreanName: '스웨덴' },
  'Norway': { coords: [60.4720, 8.4689], koreanName: '노르웨이' },
  'Denmark': { coords: [56.2639, 9.5018], koreanName: '덴마크' },
  'Finland': { coords: [61.9241, 25.7482], koreanName: '핀란드' },
  'Poland': { coords: [51.9194, 19.1451], koreanName: '폴란드' },
  'Czech Republic': { coords: [49.8175, 15.4730], koreanName: '체코' },
  'Portugal': { coords: [39.3999, -8.2245], koreanName: '포르투갈' },
  'Ireland': { coords: [53.4129, -8.2439], koreanName: '아일랜드' },
  'Scotland': { coords: [56.4907, -4.2026], koreanName: '스코틀랜드' },
  'Iceland': { coords: [64.9631, -19.0208], koreanName: '아이슬란드' },
  'Croatia': { coords: [45.1000, 15.2000], koreanName: '크로아티아' },
  'Hungary': { coords: [47.1625, 19.5033], koreanName: '헝가리' },
  'Romania': { coords: [45.9432, 24.9668], koreanName: '루마니아' },
  'Bulgaria': { coords: [42.7339, 25.4858], koreanName: '불가리아' },
  'Ukraine': { coords: [48.3794, 31.1656], koreanName: '우크라이나' },
  'Israel': { coords: [31.0461, 34.8516], koreanName: '이스라엘' },
  'UAE': { coords: [23.4241, 53.8478], koreanName: 'UAE' },
  'Saudi Arabia': { coords: [23.8859, 45.0792], koreanName: '사우디아라비아' },
  'Malaysia': { coords: [4.2105, 101.9758], koreanName: '말레이시아' },
  'Taiwan': { coords: [23.6978, 120.9605], koreanName: '대만' },
  'Hong Kong': { coords: [22.3193, 114.1694], koreanName: '홍콩' },
  'Nepal': { coords: [28.3949, 84.1240], koreanName: '네팔' },
  'Sri Lanka': { coords: [7.8731, 80.7718], koreanName: '스리랑카' },
  'Pakistan': { coords: [30.3753, 69.3451], koreanName: '파키스탄' },
  'Bangladesh': { coords: [23.6850, 90.3563], koreanName: '방글라데시' },
  'Myanmar': { coords: [21.9162, 95.9560], koreanName: '미얀마' },
  'Cambodia': { coords: [12.5657, 104.9910], koreanName: '캄보디아' },
  'Laos': { coords: [19.8563, 102.4955], koreanName: '라오스' }
};

// 방문 횟수에 따른 색상과 크기
export const getVisitStyle = (visits) => {
  const styles = {
    1: { color: '#10b981', size: 0.5, glow: '#10b98180' },
    2: { color: '#f59e0b', size: 0.6, glow: '#f59e0b80' },
    3: { color: '#3b82f6', size: 0.7, glow: '#3b82f680' },
    4: { color: '#8b5cf6', size: 0.8, glow: '#8b5cf680' },
    5: { color: '#ef4444', size: 0.9, glow: '#ef444480' }
  };
  return styles[Math.min(visits, 5)] || styles[5];
};

// 지구본 텍스처 설정
export const getGlobeTextures = (mode) => {
  const textures = {
    satellite: {
      globe: '//unpkg.com/three-globe/example/img/earth-day.jpg',
      bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
    },
    night: {
      globe: '//unpkg.com/three-globe/example/img/earth-night.jpg',
      bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
    },
    topographic: {
      globe: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
    }
  };
  return textures[mode] || textures.satellite;
};
