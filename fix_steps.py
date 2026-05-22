import os
import re

docs_dir = "src/content/docs"

for root, _, files in os.walk(docs_dir):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            new_lines = []
            in_step = False
            currently_wrapping_number = False
            
            for line in lines:
                if line.strip() == ":::step":
                    in_step = True
                    new_lines.append(line)
                    continue
                elif line.strip() == ":::":
                    in_step = False
                    new_lines.append(line)
                    continue
                
                match = re.match(r'^(\s*)(\d+)\.\s+(.*)', line)
                if match and not in_step:
                    if currently_wrapping_number:
                        new_lines.append(":::\n")
                    new_lines.append(":::step\n")
                    new_lines.append(line)
                    currently_wrapping_number = True
                elif currently_wrapping_number:
                    if line.strip() == "":
                        # blank line ends the item
                        new_lines.append(":::\n")
                        new_lines.append(line)
                        currently_wrapping_number = False
                    elif re.match(r'^\s*\d+\.\s+', line):
                        # another numbered item starts
                        new_lines.append(":::\n")
                        new_lines.append(":::step\n")
                        new_lines.append(line)
                    else:
                        # continuation of the numbered item
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            
            if currently_wrapping_number:
                new_lines.append(":::\n")
                
            new_content = "".join(new_lines)
            if "".join(lines) != new_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {path}")
