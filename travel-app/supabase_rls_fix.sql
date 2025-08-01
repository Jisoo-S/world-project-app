-- RLS 정책 수정/재생성
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own travels" ON user_travels;

-- user_profiles 테이블 정책
-- 사용자가 자신의 프로필을 볼 수 있도록
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 추가할 수 있도록 (회원가입 시)
CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 사용자가 자신의 프로필을 수정할 수 있도록
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- user_travels 테이블 정책
-- 사용자가 자신의 여행 데이터를 볼 수 있도록
CREATE POLICY "Users can view own travels" 
ON user_travels FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자가 자신의 여행 데이터를 추가할 수 있도록
CREATE POLICY "Users can insert own travels" 
ON user_travels FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 여행 데이터를 수정할 수 있도록
CREATE POLICY "Users can update own travels" 
ON user_travels FOR UPDATE 
USING (auth.uid() = user_id);

-- 사용자가 자신의 여행 데이터를 삭제할 수 있도록
CREATE POLICY "Users can delete own travels" 
ON user_travels FOR DELETE 
USING (auth.uid() = user_id);

-- 테이블 권한 확인 (선택사항)
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_travels TO authenticated;
