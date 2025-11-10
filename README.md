# 🌍 Ultra Realistic Earth Archive

**실제 대륙 모양을 표현하는 3D 여행 지구본**

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Globe.gl](https://img.shields.io/badge/Globe.gl-2.42.0-green)](https://github.com/vasturiano/globe.gl)
[![Three.js](https://img.shields.io/badge/Three.js-0.178.0-orange)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-teal)](https://tailwindcss.com/)

## ✨ 주요 기능

### 🛰️ 실제 지구 데이터 기반
- **Natural Earth 지형 데이터** 사용으로 정확한 대륙 모양
- **실제 위성 이미지** 텍스처 (NASA Blue Marble)
- **고해상도 지형 고도** 데이터 적용

### 🎨 3가지 지구본 모드
- **🛰️ 위성 뷰**: 실제 위성 이미지
- **🌙 야간 뷰**: 도시 불빛이 보이는 밤 지구  
- **🗺️ 지형 뷰**: 고해상도 지형 지도

### 📍 스마트 여행 추적
- 방문 횟수별 **색상 코딩** 시스템
- **상세한 여행 정보** 표시 (도시, 날짜, 소감)
- 국가간 **여행 경로 연결** 시각화
- **실시간 통계** 대시보드

### 🎮 인터랙티브 기능
- **마우스/터치**로 지구본 자유 조작
- 국가 **클릭시 상세 정보** 팝업
- **빠른 국가 이동** 버튼
- **자동 회전** 토글 기능
- **부드러운 카메라** 이동 애니메이션

### ⚡ 고급 3D 효과
- 실제 **대기권 효과**
- **별자리 배경**
- **3D 그림자**와 조명
- **고성능 렌더링**

## 🚀 시작하기

### 설치
```bash
# 프로젝트 클론
git clone https://github.com/your-username/WORLD-PROJECT.git
cd WORLD-PROJECT/travel-app

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 요구사항
- Node.js 16.0.0 이상
- 모던 웹브라우저 (Chrome, Firefox, Safari, Edge)
- WebGL 지원

## 📦 주요 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "globe.gl": "^2.42.0",
    "three": "^0.178.0",
    "tailwindcss": "^4.1.11"
  }
}
```

## 🏗️ 프로젝트 구조

```
travel-app/
├── src/
│   ├── UltraRealisticGlobe.js    # 메인 3D 지구본 컴포넌트
│   ├── RealisticGlobe.js         # 대체 지구본 컴포넌트
│   ├── TravelGlobe.js           # 기존 Three.js 버전
│   ├── App.js                   # 앱 진입점
│   └── index.js                 # React DOM 렌더링
├── public/
│   ├── index.html
│   └── manifest.json
└── package.json
```

## 🎯 사용법

### 1. 지구본 조작
- **마우스 드래그**: 지구본 회전
- **휠 스크롤**: 확대/축소
- **터치 제스처**: 모바일에서 핀치 줌

### 2. 여행 정보 보기
- **마커 클릭**: 상세 여행 정보 표시
- **국가명 버튼**: 해당 국가로 빠른 이동
- **통계 패널**: 전체 여행 현황 확인

### 3. 지구본 모드 변경
- **위성 뷰**: 낮 시간 실제 지구 모습
- **야간 뷰**: 밤 시간 도시 불빛
- **지형 뷰**: 지형과 고도 정보

## 🔧 기술적 특징

### Globe.gl 라이브러리 활용
- Three.js 기반의 고성능 3D 렌더링
- WebGL을 이용한 하드웨어 가속
- 실시간 인터랙션 지원

### 실제 지형 데이터 통합
- Natural Earth 벡터 데이터
- NASA 위성 이미지 텍스처
- 정확한 국가 경계선

### 반응형 디자인
- 데스크톱/모바일 최적화
- Tailwind CSS 유틸리티 클래스
- 다크 테마 UI

## 🌟 주요 개선사항

### v2.0.0 - Ultra Realistic Globe
- ✅ Globe.gl 라이브러리로 완전 전환
- ✅ 실제 대륙 모양 구현
- ✅ 3가지 지구본 모드 추가
- ✅ 고급 3D 효과 및 애니메이션
- ✅ 안정성 및 성능 최적화
- ✅ 에러 처리 개선

### v1.0.0 - Initial Release
- Three.js 기반 기본 지구본
- 사용자 여행 데이터 시각화
- 기본 인터랙션 기능

## 📸 스크린샷

### 위성 뷰 모드
실제 NASA 위성 이미지를 사용한 고해상도 지구본

### 야간 뷰 모드  
도시의 불빛이 아름답게 표현된 밤 지구

### 여행 마커 시스템
방문 횟수별 색상 코딩과 상세 정보 표시

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Globe.gl](https://github.com/vasturiano/globe.gl) - 훌륭한 3D 지구본 라이브러리
- [Three.js](https://threejs.org/) - 강력한 3D 그래픽 엔진
- [Natural Earth](https://www.naturalearthdata.com/) - 고품질 지형 데이터
- [NASA](https://www.nasa.gov/) - 실제 지구 위성 이미지

## Open Source Notices

This project uses the following open-source library:

- [three-globe](https://github.com/vasturiano/three-globe)  
  Copyright (c) 2019 Vasco Asturiano  
  Licensed under the MIT License

