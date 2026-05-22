import os

docs_dir = 'src/content/docs'
step_blocks = []
for root, _, files in os.walk(docs_dir):
    for f in files:
        if not f.endswith('.md'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fh:
            lines = fh.readlines()
        for i, line in enumerate(lines, 1):
            if line.strip() == ':::step':
                prev_heading = None
                for idx in range(i-2, -1, -1):
                    if lines[idx].strip().startswith('#'):
                        prev_heading = lines[idx].strip()
                        break
                step_blocks.append((path, i, prev_heading))

for path, i, heading in step_blocks:
    print(f'{path}:{i} | Heading: {heading}')
