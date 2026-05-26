# 사주 캐릭터 프롬프트 엔진 v1.0

## 배포 정보
- **엔진**: https://checker1016-85.github.io/saju-character_prompt/ (또는 Vercel)
- **GAS 배포 ID**: `AKfycbxiEATASurFLo0J57DDknNsT_phaNIDm82qRbLr_ufevlYmU_1SRptRzbjmydEFxfsNBw`
- **Drive**: https://drive.google.com/drive/folders/1U0Qj1XO0K7aUEGOtnOJfBIcQFw6aQDeX
- **GitHub**: https://github.com/checker1016-85/saju-character_prompt

## 아키텍처

```
[index.html]  ← Saju-Myungli-JSON/ (프롬프트 조합 DB)
     ↓ gasCall()
[GAS 백엔드]  ← SAZU API (만세력 변환)
     ↓         ← Gemini API (이미지 생성)
     ↓         ← Google Drive (학습 저장)
[출력: 프롬프트 + 이미지]
```

## 파일 구조

```
saju-character_prompt/
├── index.html                     ← 메인 UI 엔진
├── README.md                      ← 이 파일
├── Saju-Myungli-DB/               ← 엑셀 원본 DB
│   ├── 10_오행천간지지기초.xlsx
│   ├── 11_합충관계.xlsx
│   ├── 12_십성운성신살.xlsx
│   ├── 13_원국분석.xlsx
│   └── 20_일주론.xlsx
├── Saju-Myungli-JSON/             ← JSON 변환 DB (엔진에서 fetch)
│   ├── 10_오행천간지지기초.json
│   ├── 11_합충관계.json
│   ├── 12_십성운성신살.json
│   ├── 13_원국분석.json
│   └── 20_일주론.json
├── convert_excel.py               ← xlsx → json 변환 스크립트
├── Guide/                         ← 가이드 문서
│   ├── PIPELINE_GUIDE.md
│   └── ID_QUICK_REFERENCE.md
└── gas/                           ← GAS 백엔드 (GAS 에디터에 붙여넣기)
    ├── code.gs                    ← REST API 라우터
    ├── config.gs                  ← 설정 (폴더 ID, API URL)
    ├── geminiservice.gs           ← Gemini 이미지 생성 + Vision 캡션
    ├── driveservice.gs            ← Drive 파일 관리
    ├── logservice.gs              ← 학습 시스템
    └── appsscript.json            ← GAS 매니페스트
```

## 설정 순서

### 1단계: GAS 백엔드 배포

1. [GAS 에디터](https://script.google.com) → 새 프로젝트 생성
2. `gas/` 폴더의 각 `.gs` 파일 내용을 GAS 에디터에 붙여넣기
3. ⚙️ 프로젝트 설정 → "에디터에서 appsscript.json 표시" 체크 → 내용 붙여넣기
4. ⚙️ 프로젝트 설정 → 스크립트 속성 추가:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `SAZU_API_KEY` | SAZU 만세력 API 키 |

5. 배포 → 새 배포 → 웹 앱 (실행: 나, 액세스: 모든 사용자)
6. 배포 URL 복사

### 2단계: index.html에 GAS URL 설정

```html
<meta name="gas-url" content="https://script.google.com/macros/s/YOUR_NEW_ID/exec">
```

### 3단계: 배포

**GitHub Pages:**
- 저장소 Settings → Pages → Source: main branch → / (root)

**Vercel:**
- GitHub 저장소 연동 → 자동 배포

## GAS 스크립트 속성

| 속성명 | 용도 | 비고 |
|--------|------|------|
| `GEMINI_API_KEY` | Gemini 이미지 생성 + Vision 캡션 | Google AI Studio에서 발급 |
| `SAZU_API_KEY` | SAZU 만세력 API | api.sazu.app |

## Google Drive 폴더 구조

```
AI Saju engine (1U0Qj1XO0K7aUEGOtnOJfBIcQFw6aQDeX)
├── Guide/           ← 가이드 문서
├── Saju DB/         ← DB 엑셀 원본 (1FLYP1ghHdbycorY6wT2V4N9ZqNIHIq5O)
└── resources/       ← 이미지 저장 (14_a3f-uzCo7MW6cTdBVV9YWncuv86PCi)
    └── 갑자_남/
        ├── 갑자_남_Learning/     ← 학습 이미지 + 캡션 + JSON
        ├── 갑자_남_thumbs/       ← 썸네일
        └── ref_01.png            ← 레퍼런스 이미지
```

## 엔진 사용 흐름

### 사주 입력 (좌측)
1. 생년월일시 + 성별 입력
2. [만세력 조회] → SAZU API → 사주 4주 표시
3. 일주 DB 자동 매칭 → 성격·외형 해석 표시
4. 직업 선택 (선택사항) → 의상·소품 프롬프트 추가

### 프롬프트 생성 (중앙)
1. 나이대 / 아트 스타일 / 배경 / 포즈 선택
2. 프롬프트 타입: 웹AI용(한국어) / SD용(영문)
3. [프롬프트 생성] → 최종 프롬프트 표시
4. [복사] → 외부 AI에 붙여넣기 가능

### 이미지 생성 (우측)
1. [Gemini 이미지 생성] → GAS 경유 → 이미지 표시
2. [다운로드] → PNG 저장
3. [학습 저장] → Drive에 이미지 + Vision 캡션 + 프롬프트 JSON 저장

## DB 수정 흐름

```
엑셀 수정 (Saju-Myungli-DB/*.xlsx)
  → python convert_excel.py
  → JSON 재생성 (Saju-Myungli-JSON/*.json)
  → git push
  → 자동 반영
```

## 기술 스택

- **프론트**: 단일 index.html (vanilla JS, 프레임워크 없음)
- **백엔드**: Google Apps Script (V8)
- **만세력**: SAZU API (api.sazu.app)
- **이미지 생성**: Gemini API (gemini-2.0-flash-exp)
- **Vision 캡션**: Gemini API (gemini-2.0-flash)
- **저장소**: Google Drive
- **형상관리**: GitHub
- **배포**: GitHub Pages 또는 Vercel
