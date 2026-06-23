import os
import re

MOBILE_APP_DIR = r"f:\Projects\Varahi\apps\mobile\app"

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # 1. Clean up wrong axios import in otp-verify.tsx
    if "import axios from 'react-native';" in content:
        content = content.replace("import axios from 'react-native';", "")
        print(f"Removed invalid axios import in {filepath}")

    # 2. Replace indigo color with fintech brand blue
    content = content.replace("#6366F1", "#2563EB")
    content = content.replace("#6366f1", "#2563EB")
    
    # 3. Update button styles specifically to have rounded-full/pill corners (borderRadius: 28 or 24)
    # We can match style blocks like:
    # button: {
    #   ...
    #   borderRadius: 12,
    # }
    
    # Pattern to find styling properties inside StyleSheets for keys containing 'button'
    # E.g., button: { ..., borderRadius: 12, ... }
    def replace_border_radius(match):
        block = match.group(0)
        # Replace borderRadius: 12 or 16 with borderRadius: 28 in buttons
        block_updated = re.sub(r'borderRadius:\s*(12|16)', 'borderRadius: 28', block)
        return block_updated

    # Regex targeting keys containing 'button' or 'btn' or 'Button' (e.g. button: {, emptyButton: {, etc.)
    pattern = r'(?P<key>\w*button\w*|\w*btn\w*)\s*:\s*\{[^}]*\}'
    content = re.sub(pattern, replace_border_radius, content, flags=re.IGNORECASE)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated styles in: {filepath}")

def main():
    for root, _, files in os.walk(MOBILE_APP_DIR):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                update_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
