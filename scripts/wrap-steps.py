import os
import re

docs_dir = "/home/theapiartist/work/agentsecrets-website/src/content/docs"

# Pattern to match numbered items: e.g., "1. " at the start of a line
num_item_pattern = re.compile(r"^\s*\d+\.\s+")

def wrap_numbered_lists(content):
    lines = content.splitlines()
    new_lines = []
    
    # We want to identify contiguous blocks of lines that form numbered lists.
    # A numbered list block starts with a line matching `num_item_pattern` (if not inside an existing :::step block).
    # It continues as long as lines are:
    #   - matching num_item_pattern
    #   - indented (starting with spaces/tabs)
    #   - blank lines (to allow spacing between list items)
    # But we need to make sure we don't wrap lists that are ALREADY inside a `:::step` block.
    
    in_step_block = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Track if we are inside an existing :::step block
        if line.strip() == ":::step":
            in_step_block = True
            new_lines.append(line)
            i += 1
            continue
        elif line.strip() == ":::":
            # Only ends step block if we were in one.
            # (Wait, there could be other ::: blocks like :::warning, but let's assume they are structured)
            if in_step_block:
                in_step_block = False
            new_lines.append(line)
            i += 1
            continue
        
        if in_step_block:
            new_lines.append(line)
            i += 1
            continue
        
        # If we are NOT in a step block, check if this line starts a numbered list
        if num_item_pattern.match(line):
            # We found the start of a numbered list!
            # Let's collect all lines that belong to this list
            list_lines = []
            
            # Read ahead to find the end of the list block
            j = i
            last_list_item_index = i
            while j < len(lines):
                curr_line = lines[j]
                
                # If we encounter a :::step block, stop
                if curr_line.strip() == ":::step":
                    break
                
                # If it's a new list item
                if num_item_pattern.match(curr_line):
                    list_lines.append(curr_line)
                    last_list_item_index = j
                # If it's an indented line (part of the list item)
                elif curr_line.startswith(" ") or curr_line.startswith("\t"):
                    list_lines.append(curr_line)
                # If it's a blank line, we might continue if the next line is part of the list
                elif curr_line.strip() == "":
                    # Check ahead if there is any list item or indented line after this blank line
                    k = j + 1
                    is_list_continuing = False
                    while k < len(lines):
                        next_line = lines[k]
                        if next_line.strip() == "":
                            k += 1
                            continue
                        if num_item_pattern.match(next_line) or next_line.startswith(" ") or next_line.startswith("\t"):
                            is_list_continuing = True
                        break
                    
                    if is_list_continuing:
                        list_lines.append(curr_line)
                    else:
                        break
                else:
                    # Non-indented, non-numbered line: list ends
                    break
                j += 1
            
            # We wrap the list lines from i to last_list_item_index (or j-1)
            # Let's trim any trailing blank lines from list_lines
            while list_lines and list_lines[-1].strip() == "":
                list_lines.pop()
                j -= 1
            
            new_lines.append(":::step")
            new_lines.extend(list_lines)
            new_lines.append(":::")
            
            i = j
        else:
            new_lines.append(line)
            i += 1
            
    return "\n".join(new_lines) + ("\n" if content.endswith("\n") else "")

modified_files = []

for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith(".md"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            wrapped = wrap_numbered_lists(content)
            if wrapped != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(wrapped)
                modified_files.append(os.path.relpath(filepath, docs_dir))

print(f"Modified {len(modified_files)} files:")
for f in modified_files:
    print(f"- {f}")
