import os
import re

docs_dir = "src/content/docs"
heading_regex = re.compile(r'^(#{2,3})\s+(?:(?:Step|Stage)\s+)?\d+[\.\-\:]\s+', re.IGNORECASE)
general_heading_regex = re.compile(r'^#+\s+')

for root, _, files in os.walk(docs_dir):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            has_num_headings = any(heading_regex.match(line) for line in lines)
            
            if not has_num_headings:
                continue
                
            clean_lines = [line for line in lines if line.strip() not in [":::step", ":::"]]
            
            new_lines = []
            in_heading_step = False
            
            for line in clean_lines:
                if heading_regex.match(line):
                    if in_heading_step:
                        popped_blanks = []
                        while new_lines and new_lines[-1].strip() == "":
                            popped_blanks.insert(0, new_lines.pop())
                        new_lines.append(":::\n")
                        new_lines.extend(popped_blanks)
                    
                    new_lines.append(line)
                    new_lines.append(":::step\n")
                    in_heading_step = True
                    
                elif general_heading_regex.match(line) or line.startswith("---"):
                    if in_heading_step:
                        popped_blanks = []
                        while new_lines and new_lines[-1].strip() == "":
                            popped_blanks.insert(0, new_lines.pop())
                        new_lines.append(":::\n")
                        new_lines.extend(popped_blanks)
                        in_heading_step = False
                    new_lines.append(line)
                else:
                    new_lines.append(line)
            
            if in_heading_step:
                popped_blanks = []
                while new_lines and new_lines[-1].strip() == "":
                    popped_blanks.insert(0, new_lines.pop())
                new_lines.append(":::\n")
                new_lines.extend(popped_blanks)
            
            new_content = "".join(new_lines)
            if "".join(lines) != new_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Wrapped headings in {path}")
