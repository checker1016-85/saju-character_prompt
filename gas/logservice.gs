/**
 * ===== logservice.gs =====
 * 학습 시스템 — 이미지 + Vision 캡션 + 프롬프트 JSON 저장
 */

/**
 * 학습 저장 메인
 * @param {Object} body - { ilju, gender, imageBase64, mimeType, prompt, options }
 * @return {{ fileName, captionFile, jsonFile, error }}
 */
function saveSuccessLog_(body) {
  try {
    var folderName = body.ilju + '_' + body.gender;
    var charFolder = getCharFolder_(folderName);
    var learnFolder = getSubFolder_(charFolder, folderName + '_Learning');

    // 파일명 생성
    var ts = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd_HHmmss');
    var baseName = body.ilju + '_' + ts;

    // 1. 이미지 저장
    var imgFile = saveBase64ToDrive_(
      learnFolder,
      baseName + '.png',
      body.imageBase64,
      body.mimeType || 'image/png'
    );
    log_('save', 'Image saved: ' + imgFile.getName());

    // 2. Vision 캡션 생성 + 저장
    var caption = generateCaption_(body.imageBase64, body.mimeType || 'image/png');
    var captionFile = null;
    if (caption) {
      captionFile = learnFolder.createFile(baseName + '.txt', caption, 'text/plain');
      log_('save', 'Caption saved: ' + captionFile.getName());
    }

    // 3. 프롬프트 JSON 저장
    var jsonData = {
      ilju: body.ilju,
      gender: body.gender,
      prompt: body.prompt,
      options: body.options || {},
      timestamp: new Date().toISOString(),
      caption: caption || ''
    };
    var jsonFile = learnFolder.createFile(
      baseName + '.json',
      JSON.stringify(jsonData, null, 2),
      'application/json'
    );
    log_('save', 'JSON saved: ' + jsonFile.getName());

    // 4. 썸네일 생성
    try {
      var thumbFolder = getSubFolder_(charFolder, folderName + '_thumbs');
      var thumbBlob = Utilities.newBlob(
        Utilities.base64Decode(body.imageBase64),
        body.mimeType || 'image/png',
        baseName + '_thumb.png'
      );
      thumbFolder.createFile(thumbBlob);
    } catch (thumbErr) {
      log_('save', 'Thumb error (non-fatal): ' + thumbErr.message);
    }

    return {
      fileName: imgFile.getName(),
      captionFile: captionFile ? captionFile.getName() : null,
      jsonFile: jsonFile.getName(),
      imageId: imgFile.getId()
    };

  } catch (e) {
    log_('save', 'ERROR: ' + e.message);
    return { error: e.message };
  }
}

/**
 * 학습 저장 건수 조회
 * @param {string} folderName
 * @return {number}
 */
function getLearningCount_(folderName) {
  try {
    var root = DriveApp.getFolderById(RES_FOLDER_ID);
    var iter = root.getFoldersByName(folderName);
    if (!iter.hasNext()) return 0;

    var charFolder = iter.next();
    var learnIter = charFolder.getFoldersByName(folderName + '_Learning');
    if (!learnIter.hasNext()) return 0;

    var learnFolder = learnIter.next();
    var pngs = learnFolder.getFilesByType(MimeType.PNG);
    var count = 0;
    while (pngs.hasNext()) { pngs.next(); count++; }
    return count;
  } catch (e) {
    return 0;
  }
}
