# World Travel Tracker 🌍

인터랙티브한 3D 지구본으로 여행 기록을 시각화하는 React 애플리케이션입니다.

## 기능

- 🌐 인터랙티브 3D 지구본
- ✈️ 여행 경로 시각화
- 📍 방문 국가 및 도시 관리
- 🎨 다양한 지구본 모드 (위성, 야간, 지형)
- 📊 여행 통계
- 🔐 Supabase를 통한 사용자 인증 및 데이터 저장

## 설치 및 실행

### 1. 의존성 설치

```bash
cd travel-app
npm install
npm install @supabase/supabase-js
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `src/supabaseClient.js` 파일에서 다음 값을 업데이트:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

3. Supabase SQL Editor에서 다음 테이블 생성:
   ```sql
   -- 사용자 프로필 테이블
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     home_country TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- 사용자 여행 데이터 테이블
   CREATE TABLE user_travels (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     country TEXT NOT NULL,
     cities TEXT[] NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- RLS (Row Level Security) 활성화
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_travels ENABLE ROW LEVEL SECURITY;

   -- RLS 정책 생성
   -- user_profiles 테이블 정책
   CREATE POLICY "Users can view own profile" 
   ON user_profiles FOR SELECT 
   USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" 
   ON user_profiles FOR INSERT 
   WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" 
   ON user_profiles FOR UPDATE 
   USING (auth.uid() = id);

   -- user_travels 테이블 정책
   CREATE POLICY "Users can view own travels" 
   ON user_travels FOR SELECT 
   USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own travels" 
   ON user_travels FOR INSERT 
   WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own travels" 
   ON user_travels FOR UPDATE 
   USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own travels" 
   ON user_travels FOR DELETE 
   USING (auth.uid() = user_id);
   ```

### 3. 애플리케이션 실행

```bash
npm start
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 사용 방법

1. **로그인 없이 사용**: 즉시 여행 기록을 추가하고 시각화할 수 있습니다 (데이터는 브라우저에만 저장)
2. **로그인하여 사용**: 
   - 오른쪽 상단의 "Sign In" 버튼 클릭
   - 회원가입 시 홈 국가 선택 (홈 버튼의 기본 위치가 됩니다)
   - 로그인 후 모든 여행 데이터가 클라우드에 저장됩니다

## 주요 기능

- **여행지 추가**: 🌍 버튼을 클릭하여 새로운 여행지 추가
- **대륙별 이동**: AS, EU, NA, SA, AF, AU 버튼으로 빠른 이동
- **지구본 모드 변경**: 위성, 야간, 지형 모드 선택
- **홈 버튼**: 설정된 홈 국가로 이동 (로그인 시 사용자 설정 국가)
- **회전 토글**: 지구본 자동 회전 켜기/끄기

## 기술 스택

- React 18
- Globe.gl (3D 지구본 렌더링)
- Tailwind CSS (스타일링)
- Supabase (인증 및 데이터베이스)

## 배포

Vercel을 통한 배포가 설정되어 있습니다:

```bash
npm run build
```

빌드 후 `build` 폴더의 내용을 배포하면 됩니다.
