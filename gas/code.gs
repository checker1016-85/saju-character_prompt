/**
 * ===== code.gs =====
 * 사주 캐릭터 엔진 — REST API 라우터
 * 
 * 액션 목록:
 *   getSaju       — SAZU API로 만세력 조회
 *   generateImage — Gemini로 이미지 생성
 *   saveSuccess   — 학습 저장 (이미지 + 캡션 + 프롬프트)
 *   getCharImages — 캐릭터 이미지 목록 조회
 */

function doGet(e) {
  return jsonOk_({ ok: true, version: '1.0', engine: 'Saju Character' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    log_('doPost', 'action=' + action);

    switch (action) {

      // ── 만세력 조회 ──
      case 'getSaju':
        return handleGetSaju_(body);

      // ── 이미지 생성 ──
      case 'generateImage':
        return handleGenerateImage_(body);

      // ── 학습 저장 ──
      case 'saveSuccess':
        return handleSaveSuccess_(body);

      // ── 캐릭터 이미지 목록 ──
      case 'getCharImages':
        return handleGetCharImages_(body);

      default:
        return jsonErr_('Unknown action: ' + action, 400);
    }
  } catch (err) {
    log_('doPost', 'ERROR: ' + err.message);
    return jsonErr_(err.message, 500);
  }
}

// ═══════════════════════════════════════════════════════
// 액션 핸들러
// ═══════════════════════════════════════════════════════

/**
 * SAZU 만세력 API 호출
 * body: { birthYear, birthMonth, birthDay, birthHour, isFemale }
 */
function handleGetSaju_(body) {
  var key = getKey_('SAZU_API_KEY');
  if (!key) return jsonErr_('SAZU_API_KEY not set', 500);

  var payload = {
    birthYear:  body.birthYear,
    birthMonth: body.birthMonth,
    birthDay:   body.birthDay,
    birthHour:  body.birthHour,
    isFemale:   body.isFemale || false,
    modules:    ['fourPillars', 'evaluation', 'elements'],
    detail:     'standard'
  };

  var opts = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var res = UrlFetchApp.fetch(SAZU_API_URL, opts);
  var code = res.getResponseCode();

  if (code !== 200) {
    log_('getSaju', 'SAZU API error: ' + code + ' ' + res.getContentText());
    return jsonErr_('SAZU API error: ' + code, code);
  }

  var data = JSON.parse(res.getContentText());
  return jsonOk_({ ok: true, saju: data });
}

/**
 * Gemini 이미지 생성
 * body: { prompt, refImages(optional, base64[]) }
 */
function handleGenerateImage_(body) {
  var result = generateImageGemini_(body.prompt, body.refImages || []);
  if (result.error) return jsonErr_(result.error, 500);
  return jsonOk_({ ok: true, image: result.base64, mimeType: result.mimeType });
}

/**
 * 학습 저장
 * body: { ilju, gender, imageBase64, mimeType, prompt, options }
 */
function handleSaveSuccess_(body) {
  var result = saveSuccessLog_(body);
  if (result.error) return jsonErr_(result.error, 500);
  return jsonOk_({ ok: true, saved: result });
}

/**
 * 캐릭터 이미지 목록
 * body: { ilju, gender }
 */
function handleGetCharImages_(body) {
  var folderName = body.ilju + '_' + body.gender;
  var images = getCharImages_(folderName);
  return jsonOk_({ ok: true, images: images });
}
