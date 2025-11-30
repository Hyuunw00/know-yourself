# 푸시 알림 시스템 아키텍처

## 📋 목차
1. [전체 시스템 구조](#전체-시스템-구조)
2. [컴포넌트별 역할](#컴포넌트별-역할)
3. [데이터 흐름](#데이터-흐름)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [설정 및 구현 상세](#설정-및-구현-상세)
6. [배포 체크리스트](#배포-체크리스트)

---

## 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                          React Native App                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ App.tsx                                                     │    │
│  │ - FCM 초기화 (initializeFCM)                               │    │
│  │ - FCM 토큰 → push_tokens 테이블 저장                       │    │
│  │ - last_app_open_at 업데이트                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ HomeScreen.tsx                                              │    │
│  │ - 답변 안 한 AI 질문 조회                                  │    │
│  │ - AI 질문 모달 표시                                        │    │
│  │ - 유저 답변 입력 & 저장                                    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ FCM Token 저장
                                  │ last_app_open_at 업데이트
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Supabase Database                           │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   push_tokens    │  │  user_profiles   │  │  ai_questions   │  │
│  │ ──────────────── │  │ ──────────────── │  │ ─────────────── │  │
│  │ - user_id        │  │ - id             │  │ - user_id       │  │
│  │ - token (FCM)    │  │ - name           │  │ - question_text │  │
│  │ - platform       │  │ - last_app_open  │  │ - answer_text   │  │
│  │ - created_at     │  │ - created_at     │  │ - created_at    │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Cron Job 조회
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase Cron Job                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 매일 오전 10시 (KST) 실행                                  │    │
│  │ Cron: "0 1 * * *" (UTC 01:00)                              │    │
│  │                                                             │    │
│  │ → daily-notification-check 함수 호출                       │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Edge Function: daily-notification-check                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. 2일 이상 앱 실행 안 한 유저 조회                        │    │
│  │    WHERE last_app_open_at < 2일 전                         │    │
│  │                                                             │    │
│  │ 2. 각 유저마다:                                            │    │
│  │    ├─ generate-question 호출                               │    │
│  │    │  (Gemini API로 유저 맞춤 질문 생성)                   │    │
│  │    │                                                        │    │
│  │    └─ send-push-notification 호출                          │    │
│  │       (FCM으로 푸시 알림 전송)                             │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
        ┌───────────▼────────────┐    ┌───────────▼────────────────┐
        │  generate-question     │    │ send-push-notification     │
        └───────────┬────────────┘    └───────────┬────────────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐    ┌────────────────────────────┐
        │    Gemini API         │    │ Firebase Cloud Messaging   │
        │                       │    │         (FCM V1)           │
        │ - 유저 프로필 분석    │    │                            │
        │ - 유저 일기 분석      │    │ 1. Service Account 인증    │
        │ - 맞춤 질문 생성      │    │ 2. FCM 토큰 조회           │
        │ - DB 저장             │    │ 3. 모든 디바이스에 알림    │
        └───────────────────────┘    └────────────┬───────────────┘
                                                  │
                                                  ▼
                                     ┌────────────────────────────┐
                                     │    유저의 스마트폰         │
                                     │  (iOS / Android)          │
                                     │                            │
                                     │  📱 푸시 알림 수신         │
                                     │  → 앱 열기                │
                                     │  → AI 질문 모달 표시       │
                                     └────────────────────────────┘
```

---

## 컴포넌트별 역할

### 1. React Native App

#### **App.tsx**
- **역할**: FCM 초기화 및 앱 실행 추적
- **동작**:
  1. 유저 로그인 시 `initializeFCM(userId)` 호출
  2. FCM 토큰을 `push_tokens` 테이블에 저장
  3. 앱 실행할 때마다 `last_app_open_at` 업데이트

#### **pushNotification.ts**
- **역할**: FCM 관련 서비스 로직
- **주요 함수**:
  - `requestPushPermission()`: 푸시 알림 권한 요청
  - `getFCMToken()`: FCM 토큰 가져오기
    - iOS: `registerDeviceForRemoteMessages()` 먼저 호출 필요
    - Android: 바로 토큰 발급 가능
  - `saveFCMToken()`: FCM 토큰 DB 저장 (upsert 방식)
  - `initializeFCM()`: FCM 초기화 및 토큰 갱신 리스너 설정
- **코드 위치**: `src/services/pushNotification.ts`

#### **HomeScreen.tsx**
- **역할**: AI 질문 표시 및 답변 수집
- **동작**:
  1. 앱 실행 시 `ai_questions` 테이블에서 답변 안 한 질문 조회
  2. 질문 있으면 모달 표시
  3. 유저 답변 입력 후 DB 저장

---

### 2. Supabase Database

#### **push_tokens 테이블**
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  token TEXT NOT NULL,                    -- FCM 토큰
  platform TEXT CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, token)                  -- 같은 기기는 중복 저장 방지
);
```
- **역할**: 유저별 FCM 토큰 저장 (유저가 여러 기기 사용 가능)

#### **user_profiles 테이블**
```sql
ALTER TABLE user_profiles
ADD COLUMN last_app_open_at TIMESTAMP DEFAULT NOW();

CREATE INDEX idx_profiles_last_app_open_at
ON user_profiles(last_app_open_at);
```
- **역할**: 유저의 마지막 앱 실행 시간 추적
- **용도**: 2일 이상 비활성 유저 찾기
- **인덱스**: 성능 최적화를 위한 인덱스 추가

#### **ai_questions 테이블**
```sql
CREATE TABLE ai_questions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  question_text TEXT NOT NULL,            -- AI 생성 질문
  answer_text TEXT,                       -- 유저 답변 (nullable)
  created_at TIMESTAMP,
  answered_at TIMESTAMP                   -- 답변 시간
);
```
- **역할**: AI 생성 질문 및 유저 답변 저장

---

### 3. Supabase Edge Functions

#### **daily-notification-check**
- **역할**: 메인 오케스트레이터 - 알림 대상 유저 찾고 워크플로우 실행
- **입력**: 없음 (Cron Job이 자동 호출)
- **동작**:
  1. `user_profiles` 테이블에서 `last_app_open_at < 2일 전` 유저 조회
  2. 각 유저마다:
     - `generate-question` 호출 → AI 질문 생성
     - `send-push-notification` 호출 → 푸시 알림 전송
- **출력**:
  ```json
  {
    "message": "일일 알림 체크 완료",
    "total": 10,
    "success": 9,
    "failed": 1
  }
  ```

#### **generate-question**
- **역할**: Gemini API로 유저 맞춤 AI 질문 생성
- **입력**:
  ```json
  {
    "userId": "user-uuid"
  }
  ```
- **동작**:
  1. 유저의 프로필 정보 조회
  2. 유저의 최근 일기 10개 조회
  3. Gemini API에 유저 맥락 전달
  4. 맞춤 질문 생성
  5. `ai_questions` 테이블에 저장

#### **send-push-notification**
- **역할**: Firebase Cloud Messaging API V1으로 푸시 알림 전송
- **입력**:
  ```json
  {
    "userId": "user-uuid",
    "title": "오늘의 질문이 도착했어요 💭",
    "body": "자신을 더 깊이 이해할 수 있는 질문이 준비되었습니다",
    "data": {
      "type": "ai_question",
      "screen": "Home"
    }
  }
  ```
- **동작**:
  1. `push_tokens` 테이블에서 해당 유저의 FCM 토큰 조회
  2. Google Service Account로 OAuth 2.0 액세스 토큰 발급
  3. 각 FCM 토큰(= 각 디바이스)에 푸시 알림 전송
- **출력**:
  ```json
  {
    "message": "푸시 알림 전송 완료",
    "total": 2,      // 유저가 2개 기기 사용 중
    "success": 2,
    "failed": 0
  }
  ```

---

## 데이터 흐름

### 1️⃣ **유저가 앱을 처음 실행할 때**

```
유저 로그인
  ↓
App.tsx: initializeFCM(userId)
  ↓
iOS: registerDeviceForRemoteMessages() 먼저 호출
  ↓
FCM 토큰 발급 (Firebase SDK)
  ↓
push_tokens 테이블에 저장 (upsert)
  - user_id: "abc-123"
  - token: "FCM_TOKEN_XYZ"
  - platform: "ios"
  ↓
last_app_open_at 업데이트
  ↓
토큰 갱신 리스너 등록
  - 토큰 변경 시 자동으로 DB 업데이트
```

---

### 2️⃣ **매일 오전 10시 (자동)**

```
Cron Job 실행 (0 1 * * *)
  ↓
daily-notification-check 호출
  ↓
user_profiles 조회: WHERE last_app_open_at < 2일 전
  ↓
비활성 유저 리스트: [유저A, 유저B, 유저C]
  ↓
각 유저마다:
  ├─ generate-question 호출
  │    ↓
  │  Gemini API: 유저 프로필 + 일기 분석 → 맞춤 질문 생성
  │    ↓
  │  ai_questions 테이블에 저장
  │
  └─ send-push-notification 호출
       ↓
     push_tokens 조회: WHERE user_id = 유저A
       ↓
     FCM 토큰 리스트: ["token1", "token2"] (2개 기기)
       ↓
     Firebase Cloud Messaging API V1
       ↓
     각 기기에 푸시 알림 전송
       ↓
     📱 유저의 스마트폰에 알림 도착
```

---

### 3️⃣ **유저가 알림을 받고 앱을 열 때**

```
📱 푸시 알림 클릭
  ↓
앱 실행
  ↓
App.tsx: last_app_open_at 업데이트 (지금 시간으로)
  ↓
HomeScreen.tsx: ai_questions 조회
  - WHERE user_id = 현재유저
  - AND answer_text IS NULL (답변 안 한 질문)
  ↓
질문 있으면 모달 표시
  ↓
유저가 답변 입력
  ↓
ai_questions 테이블 업데이트
  - answer_text = "유저의 답변"
  - answered_at = NOW()
  ↓
완료!
```

---

## 설정 및 구현 상세

### Android 설정

#### 1. Firebase 설정 파일
- `android/app/google-services.json` 추가
- Firebase Console에서 다운로드

#### 2. Gradle 설정
**`android/build.gradle`**:
```gradle
buildscript {
    dependencies {
        classpath("com.android.tools.build:gradle")  // 버전 자동 선택
        classpath("com.google.gms:google-services:4.4.4")
    }
}
```

**`android/app/build.gradle`**:
```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: "com.google.gms.google-services"

// react-native-config
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

**`android/gradle.properties`**:
```properties
# Gradle이 Java 17을 사용하도록 설정 (React Native 0.82 권장)
org.gradle.java.home=/opt/homebrew/opt/openjdk@17
```

#### 3. Gradle 버전
- **Gradle**: 8.13
- **Android Gradle Plugin**: 자동 선택 (8.12.0 사용 중)
- **Java**: 17 (Homebrew 설치)

---

### iOS 설정

#### 1. Firebase 설정 파일
- `ios/KnowYourself/GoogleService-Info.plist` 추가
- Firebase Console에서 다운로드

#### 2. AppDelegate 수정
**`ios/KnowYourself/AppDelegate.swift`**:
```swift
import Firebase

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()  // Firebase 초기화
        // ...
        return true
    }
}
```

#### 3. Podfile 수정
```ruby
use_frameworks! :linkage => :static

# Firebase 모듈 맵 활성화
$RNFirebaseAsStaticFramework = true
```

#### 4. PrivacyInfo.xcprivacy
```xml
<dict>
    <key>NSPrivacyAccessedAPICategoryUserDefaults</key>
    <!-- Firebase 관련 개인정보 접근 항목 -->
</dict>
```

---

### Firebase 설정

#### 필요한 환경 변수
Supabase Edge Functions에 설정:
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `FIREBASE_SERVICE_ACCOUNT`: Service Account JSON 전체 내용
- `GEMINI_API_KEY`: Gemini API 키

#### Service Account 발급
1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. Supabase → Project Settings → Edge Functions → Secrets에 전체 JSON 내용 붙여넣기

---

## 배포 체크리스트

### ✅ 1. Firebase 설정
- [x] Firebase Console에서 Service Account JSON 발급
- [x] `FIREBASE_PROJECT_ID` 확인
- [x] `google-services.json` (Android) 프로젝트에 추가
- [x] `GoogleService-Info.plist` (iOS) 프로젝트에 추가
- [x] iOS AppDelegate에 `FirebaseApp.configure()` 추가
- [x] iOS Podfile에 `use_frameworks!` 및 `$RNFirebaseAsStaticFramework` 설정

### ✅ 2. Supabase Database 마이그레이션
- [ ] `push_tokens` 테이블 생성
- [ ] `user_profiles` 테이블에 `last_app_open_at` 컬럼 추가
- [ ] 인덱스 생성 (`idx_profiles_last_app_open_at`)

### ✅ 3. Supabase Edge Functions 배포
- [ ] `send-push-notification` 함수 배포
- [ ] `daily-notification-check` 함수 배포
- [ ] `generate-question` 함수 배포 (Gemini API 사용)
- [ ] 환경 변수 설정:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_SERVICE_ACCOUNT`
  - `GEMINI_API_KEY`

### ✅ 4. Cron Job 설정
```sql
SELECT cron.schedule(
  'daily-push-notification',
  '0 1 * * *',  -- UTC 01:00 = KST 10:00
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-notification-check',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_ANON_KEY'),
    body := '{}'::jsonb
  );
  $$
);
```

### ✅ 5. React Native App 빌드
- [x] 패키지 설치: `npm install`
- [x] iOS: `cd ios && pod install`
- [x] Android: Gradle 빌드 성공 확인
- [x] FCM 토큰 저장 테스트
- [ ] 푸시 알림 수신 테스트

---

## 테스트 시나리오

### 1. FCM 토큰 저장 테스트
1. 앱 실행 → 로그인
2. Supabase → `push_tokens` 테이블 확인
3. 유저의 FCM 토큰이 저장되었는지 확인

### 2. 푸시 알림 수동 테스트
1. Supabase Dashboard → Edge Functions → `send-push-notification`
2. Invoke 탭에서 테스트:
```json
{
  "userId": "실제-유저-UUID",
  "title": "테스트 알림",
  "body": "푸시 알림 테스트입니다"
}
```
3. 스마트폰에 알림 도착 확인

### 3. AI 질문 생성 테스트
1. Supabase Dashboard → Edge Functions → `generate-question`
2. Invoke:
```json
{
  "userId": "실제-유저-UUID"
}
```
3. `ai_questions` 테이블에 질문 생성 확인

### 4. 전체 플로우 테스트
1. 유저의 `last_app_open_at`을 3일 전으로 수동 변경
2. `daily-notification-check` 함수 수동 실행
3. AI 질문 생성 → 푸시 알림 전송 → 앱에서 모달 표시 확인

---

## 문제 해결

### FCM 토큰이 저장되지 않을 때
- Firebase 설정 파일 확인 (`google-services.json`, `GoogleService-Info.plist`)
- iOS: `AppDelegate.swift`에서 `FirebaseApp.configure()` 호출 확인
- iOS: `registerDeviceForRemoteMessages()` 호출 확인
- 앱 권한 설정 확인 (푸시 알림 권한)
- Android: `react-native-config` dotenv.gradle 적용 확인

### 푸시 알림이 도착하지 않을 때
- FCM 토큰 유효성 확인
- Firebase Service Account JSON 확인
- Supabase Edge Function 로그 확인
- Firebase Console → Cloud Messaging 활성화 확인

### Cron Job이 실행되지 않을 때
- Supabase → Database → Extensions → `pg_cron` 활성화 확인
- Cron 표현식 확인 (`0 1 * * *`)
- Edge Function URL 및 Authorization 헤더 확인

### Gradle 빌드 실패 시
- Java 17 설치 확인: `java --version`
- `android/gradle.properties`에 `org.gradle.java.home` 설정 확인
- Gradle 버전 확인: `./gradlew --version` (8.13 권장)
- Android Gradle Plugin 자동 선택 확인

---

## 참고 자료

- [Firebase Cloud Messaging 문서](https://firebase.google.com/docs/cloud-messaging)
- [Supabase Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [React Native Firebase 문서](https://rnfirebase.io/)
- [Supabase pg_cron 문서](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [React Native 0.82 환경 설정](https://reactnative.dev/docs/environment-setup)
