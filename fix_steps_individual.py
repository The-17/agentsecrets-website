import os
import re

docs_dir = "src/content/docs"

for root, _, files in os.walk(docs_dir):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # First, strip all existing :::step and ::: that are standalone lines
            # so we can start fresh. We'll be careful to only remove them if they
            # look like they were meant for our steps.
            lines = content.split('\n')
            clean_lines = []
            for line in lines:
                if line.strip() in [":::step", ":::"]:
                    continue
                clean_lines.append(line)
            
            # Now, iterate clean_lines and wrap EACH numbered list item.
            new_lines = []
            currently_wrapping = False
            
            for line in clean_lines:
                match = re.match(r'^(\s*)(\d+)\.\s+(.*)', line)
                if match:
                    if currently_wrapping:
                        new_lines.append(":::")
                    new_lines.append(":::step")
                    new_lines.append(line)
                    currently_wrapping = True
                elif currently_wrapping:
                    if line.strip() == "":
                        new_lines.append(":::")
                        new_lines.append(line)
                        currently_wrapping = False
                    elif re.match(r'^#|^---', line) or line.strip().startswith(">"):
                        new_lines.append(":::")
                        new_lines.append(line)
                        currently_wrapping = False
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            
            if currently_wrapping:
                new_lines.append(":::")
                
            new_content = '\n'.join(new_lines)
            if content != new_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {path}")
