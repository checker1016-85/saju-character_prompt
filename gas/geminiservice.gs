/**
 * ===== geminiservice.gs =====
 * Gemini API — 이미지 생성 / Vision 캡션
 */

/**
 * Gemini로 이미지 생성
 * @param {string} prompt - 이미지 생성 프롬프트
 * @param {string[]} refImages - 레퍼런스 이미지 base64 배열 (optional)
 * @return {{ base64, mimeType, error }}
 */
function generateImageGemini_(prompt, refImages) {
  var key = getKey_('GEMINI_API_KEY');
  if (!key) return { error: 'GEMINI_API_KEY not set' };

  var url = GEMINI_API_URL + GEMINI_MODEL + ':generateContent?key=' + key;

  // 프롬프트 구성
  var parts = [];

  // 레퍼런스 이미지가 있으면 먼저 추가
  if (refImages && refImages.length > 0) {
    for (var i = 0; i < Math.min(refImages.length, 3); i++) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: refImages[i]
        }
      });
    }
    parts.push({ text: 'Using the reference images above as style guide, generate the following character:\n\n' + prompt });
  } else {
    parts.push({ text: prompt });
  }

  var payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.8
    }
  };

  var opts = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var res = UrlFetchApp.fetch(url, opts);
    var code = res.getResponseCode();
    if (code !== 200) {
      log_('gemini', 'Error ' + code + ': ' + res.getContentText().substring(0, 500));
      return { error: 'Gemini API error: ' + code };
    }

    var data = JSON.parse(res.getContentText());
    var candidates = data.candidates || [];
    if (candidates.length === 0) return { error: 'No candidates returned' };

    // 이미지 파트 찾기
    var content = candidates[0].content || {};
    var resParts = content.parts || [];
    for (var j = 0; j < resParts.length; j++) {
      if (resParts[j].inlineData) {
        return {
          base64: resParts[j].inlineData.data,
          mimeType: resParts[j].inlineData.mimeType || 'image/png'
        };
      }
    }
    return { error: 'No image in response' };

  } catch (e) {
    log_('gemini', 'Exception: ' + e.message);
    return { error: e.message };
  }
}

/**
 * Gemini Vision으로 이미지 캡션 생성 (LoRA용)
 * @param {string} imageBase64
 * @param {string} mimeType
 * @return {string} 캡션 텍스트
 */
function generateCaption_(imageBase64, mimeType) {
  var key = getKey_('GEMINI_API_KEY');
  if (!key) return '';

  var url = GEMINI_API_URL + GEMINI_VISION + ':generateContent?key=' + key;

  var payload = {
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: imageBase64
          }
        },
        {
          text: 'Describe this character image with 15-30 comma-separated tags for AI image training. Include: gender, age range, hair style/color, eye shape, facial features, body type, clothing, accessories, pose, expression, art style, background, color palette. Use English only. Output tags only, no explanation.'
        }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 300
    }
  };

  var opts = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var res = UrlFetchApp.fetch(url, opts);
    if (res.getResponseCode() !== 200) return '';
    var data = JSON.parse(res.getContentText());
    var parts = ((data.candidates || [])[0] || {}).content || {};
    var textParts = (parts.parts || []).filter(function(p) { return p.text; });
    return textParts.map(function(p) { return p.text; }).join(' ').trim();
  } catch (e) {
    log_('caption', 'Error: ' + e.message);
    return '';
  }
}
