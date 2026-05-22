import os, re

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.md'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                # Simple heuristic: remove inline code snippets in this line
                line_no_code = re.sub(r'`.*?`', '', line)
                
                # Check if it contains lowercase agentsecrets
                if re.search(r'\bagentsecrets\b', line_no_code):
                    print(f"{path}:{i+1} - {line.strip()}")
