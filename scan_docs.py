import os, re

docs_dir = 'src/content/docs'
issues = []
non_numbered_step_blocks = []

for root, _, files in os.walk(docs_dir):
    for f in files:
        if not f.endswith('.md'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fh:
            lines = fh.readlines()
        
        # Find all :::step blocks and find the preceding header
        for i, line in enumerate(lines, 1):
            if line.strip() == ':::step':
                # find preceding heading
                prev_heading = None
                for idx in range(i-2, -1, -1):
                    if lines[idx].strip().startswith('#'):
                        prev_heading = lines[idx].strip()
                        break
                
                # Check if preceding heading starts with a number, e.g. "### 1." or "## 2." or "### Step 1."
                if prev_heading:
                    # Match pattern like "## 1.", "### 1.", "### Step 1", "## Step 1"
                    # But exclude standard non-numbered text
                    is_numbered = re.search(r'#+\s+(?:Step\s+)?\d+\b', prev_heading)
                    if not is_numbered:
                        non_numbered_step_blocks.append({
                            'file': path,
                            'line': i,
                            'heading': prev_heading,
                            'context': [l.strip() for l in lines[i:i+3] if l.strip()]
                        })
                else:
                    non_numbered_step_blocks.append({
                        'file': path,
                        'line': i,
                        'heading': 'NONE',
                        'context': [l.strip() for l in lines[i:i+3] if l.strip()]
                    })

print("=== VERIFYING NON-NUMBERED / SUSPICIOUS :::step BLOCKS ===")
for info in non_numbered_step_blocks:
    print(f"File: {info['file']}:{info['line']}")
    print(f"  Preceding Heading: {info['heading']}")
    print(f"  First few lines: {info['context']}")
    print("-" * 40)

print(f"\nTotal suspicious step blocks: {len(non_numbered_step_blocks)}")
