/**
 * ===== config.gs =====
 * 사주 캐릭터 엔진 — 설정 파일
 * 
 * GAS 스크립트 속성 (프로젝트: Saju-character-engine):
 *   GEMINI_API_KEY  — Google Gemini API 키
 *   SAZU_API_KEY    — SAZU 만세력 API 키
 */

// ─── Google Drive 루트 폴더 ───
const ROOT_FOLDER_ID = '1U0Qj1XO0K7aUEGOtnOJfBIcQFw6aQDeX'; // AI Saju engine
const DB_FOLDER_ID   = '1FLYP1ghHdbycorY6wT2V4N9ZqNIHIq5O'; // Saju DB
const RES_FOLDER_ID  = '14_a3f-uzCo7MW6cTdBVV9YWncuv86PCi'; // resources (이미지 저장)

// ─── API 엔드포인트 ───
const SAZU_API_URL   = 'https://api.sazu.app/v1/sazu/calculate';
const GEMINI_MODEL   = 'gemini-2.0-flash-exp';       // 이미지 생성용
const GEMINI_VISION  = 'gemini-2.0-flash';            // Vision 캡션용
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

// ─── 이미지 설정 ───
const IMG_SIZE       = 1024;
const THUMB_SIZE     = 256;

// ─── 유틸 함수 ───
function getKey_(name) {
  return PropertiesService.getScriptProperties().getProperty(name) || '';
}

function jsonOk_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr_(msg, code) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: false, error: msg, code: code || 500
  })).setMimeType(ContentService.MimeType.JSON);
}

function log_(tag, msg) {
  console.log('[' + tag + '] ' + msg);
}
