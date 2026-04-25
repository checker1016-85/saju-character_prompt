import pandas as pd
import json
import os

db_folder = 'Saju-Myungli-DB'
output_folder = 'Saju-Myungli-JSON'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for file_name in os.listdir(db_folder):
    if file_name.endswith('.xlsx'):
        file_path = os.path.join(db_folder, file_name)
        df = pd.read_excel(file_path)
        json_data = df.to_json(orient='records', force_ascii=False, indent=4)
        output_file_name = file_name.replace('.xlsx', '.json')
        output_path = os.path.join(output_folder, output_file_name)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(json_data)
