"""
convert_excel.py — 엑셀 DB → JSON 변환 (전체 시트)

사용법:
  python convert_excel.py

입력: Saju-Myungli-DB/*.xlsx
출력: Saju-Myungli-JSON/*.json (시트별 구조 포함)
"""
import pandas as pd
import json
import os
import sys

DB_FOLDER = 'Saju-Myungli-DB'
OUT_FOLDER = 'Saju-Myungli-JSON'

os.makedirs(OUT_FOLDER, exist_ok=True)

def clean_value(val):
    """NaN, NaT 등을 None으로 변환"""
    if pd.isna(val):
        return None
    if isinstance(val, float) and val != val:
        return None
    return val

def sheet_to_records(df):
    """DataFrame → list of dicts (NaN 제거)"""
    records = []
    for _, row in df.iterrows():
        record = {}
        for col in df.columns:
            v = clean_value(row[col])
            if v is not None:
                record[str(col)] = v
        if record:
            records.append(record)
    return records

count = 0
for fname in sorted(os.listdir(DB_FOLDER)):
    if not fname.endswith('.xlsx') or fname.startswith('~'):
        continue

    fpath = os.path.join(DB_FOLDER, fname)
    out_name = fname.replace('.xlsx', '.json')
    out_path = os.path.join(OUT_FOLDER, out_name)

    try:
        xls = pd.ExcelFile(fpath)
        sheets = xls.sheet_names

        if len(sheets) == 1:
            # 시트 1개면 기존처럼 flat 배열
            df = pd.read_excel(xls, sheet_name=sheets[0])
            result = sheet_to_records(df)
        else:
            # 시트 여러 개면 { "시트명": [...records] } 딕셔너리
            result = {}
            for sname in sheets:
                df = pd.read_excel(xls, sheet_name=sname)
                result[sname] = sheet_to_records(df)

        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)

        sheet_info = f'{len(sheets)} sheets' if len(sheets) > 1 else f'{len(result)} rows'
        print(f'  ✅ {fname} → {out_name} ({sheet_info})')
        count += 1

    except Exception as e:
        print(f'  ❌ {fname} — {e}', file=sys.stderr)

print(f'\n완료: {count}개 파일 변환됨 → {OUT_FOLDER}/')
