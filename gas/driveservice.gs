/**
 * ===== driveservice.gs =====
 * Google Drive 파일 관리 — 캐릭터 이미지 저장/조회
 * 
 * 폴더 구조 (resources 폴더 내부):
 *   갑자_남/
 *     ├─ 갑자_남_Learning/    ← 학습 저장
 *     │   ├─ IL01_20260526_001.png
 *     │   ├─ IL01_20260526_001.txt   (Vision 캡션)
 *     │   └─ IL01_20260526_001.json  (프롬프트/옵션)
 *     ├─ 갑자_남_thumbs/      ← 썸네일
 *     └─ ref_01.png           ← 기본 레퍼런스
 */

/**
 * 캐릭터 폴더 가져오기 (없으면 생성)
 * @param {string} folderName - 예: "갑자_남"
 * @return {Folder}
 */
function getCharFolder_(folderName) {
  var root = DriveApp.getFolderById(RES_FOLDER_ID);
  var iter = root.getFoldersByName(folderName);
  if (iter.hasNext()) return iter.next();
  return root.createFolder(folderName);
}

/**
 * 서브폴더 가져오기 (없으면 생성)
 * @param {Folder} parent
 * @param {string} subName
 * @return {Folder}
 */
function getSubFolder_(parent, subName) {
  var iter = parent.getFoldersByName(subName);
  if (iter.hasNext()) return iter.next();
  return parent.createFolder(subName);
}

/**
 * 캐릭터 이미지 목록 조회
 * @param {string} folderName
 * @return {Array<{name, url, thumbUrl}>}
 */
function getCharImages_(folderName) {
  try {
    var root = DriveApp.getFolderById(RES_FOLDER_ID);
    var iter = root.getFoldersByName(folderName);
    if (!iter.hasNext()) return [];

    var folder = iter.next();
    var files = folder.getFilesByType(MimeType.PNG);
    var result = [];

    while (files.hasNext()) {
      var f = files.next();
      var name = f.getName();
      // _Learning, _thumbs 폴더의 파일은 제외
      if (name.indexOf('_Learning') >= 0 || name.indexOf('_thumbs') >= 0) continue;
      result.push({
        name: name,
        id: f.getId(),
        url: 'https://drive.google.com/uc?id=' + f.getId(),
        thumbUrl: getThumbUrl_(f)
      });
    }

    // JPEG도 추가
    var jpgs = folder.getFilesByType(MimeType.JPEG);
    while (jpgs.hasNext()) {
      var jf = jpgs.next();
      result.push({
        name: jf.getName(),
        id: jf.getId(),
        url: 'https://drive.google.com/uc?id=' + jf.getId(),
        thumbUrl: getThumbUrl_(jf)
      });
    }

    return result;
  } catch (e) {
    log_('getCharImages', 'Error: ' + e.message);
    return [];
  }
}

/**
 * 썸네일 URL 가져오기
 */
function getThumbUrl_(file) {
  try {
    return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w256';
  } catch (e) {
    return '';
  }
}

/**
 * base64 이미지를 Drive에 저장
 * @param {Folder} folder
 * @param {string} fileName
 * @param {string} base64
 * @param {string} mimeType
 * @return {File}
 */
function saveBase64ToDrive_(folder, fileName, base64, mimeType) {
  var blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    mimeType || 'image/png',
    fileName
  );
  return folder.createFile(blob);
}
