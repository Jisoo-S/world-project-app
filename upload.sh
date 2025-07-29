#!/bin/bash

# WORLD-PROJECT Git Commit Script
echo "🌍 Ultra Realistic Earth Archive - Git Upload"
echo "=============================================="

# 프로젝트 디렉토리로 이동
cd "C:\Users\user\OneDrive\Documents\GitHub\WORLD-PROJECT"

# Git 상태 확인
echo "📊 현재 Git 상태 확인 중..."
git status

# 모든 변경사항 스테이징
echo "📦 변경사항 스테이징 중..."
git add .

# 커밋 메시지와 함께 커밋
echo "💾 커밋 생성 중..."
git commit -m "🌍 feat: Ultra Realistic Globe with globe.gl

✨ 주요 기능:
- Globe.gl 라이브러리를 사용한 실제 대륙 모양 구현
- 실제 위성 이미지 텍스처 (NASA Blue Marble)
- 3가지 지구본 모드 (위성/야간/지형)
- 고급 3D 효과 및 대기권 시뮬레이션
- 인터랙티브 여행 마커 시스템
- 방문 횟수별 색상 코딩
- 부드러운 카메라 이동 애니메이션
- 실시간 통계 대시보드
- 반응형 UI 디자인

🔧 기술적 개선:
- Three.js appendChild 에러 해결
- 안정적인 Globe 인스턴스 관리
- 메모리 누수 방지
- 에러 처리 및 로딩 상태 개선
- 성능 최적화

📁 새로운 파일:
- UltraRealisticGlobe.js (메인 컴포넌트)
- RealisticGlobe.js (대체 버전)
- 업데이트된 README.md
- .gitignore 개선"

# 원격 저장소에 푸시
echo "🚀 GitHub에 업로드 중..."
git push origin main

echo "✅ 완료! 코드가 성공적으로 GitHub에 업로드되었습니다."
echo "🌐 GitHub 저장소에서 확인하세요!"
