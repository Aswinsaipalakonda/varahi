import os
from os.path import relpath
import re

APP_DIR = r"f:\Projects\Varahi\apps\mobile\app"

def update_file(filepath):
    if os.path.basename(filepath) == 'config.ts':
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Calculate relative path
    relpath_str = relpath(APP_DIR, os.path.dirname(filepath))
    import_path = os.path.join(relpath_str, 'config').replace('\\', '/')
    
    if not import_path.startswith('.'):
        import_path = './' + import_path

    pattern = r'const\s+API_URL\s*=\s*[\'"`]http://localhost:8000/api/v1[\'"`];?\s*'
    
    if re.search(pattern, content):
        content = re.sub(pattern, '', content)
        import_stmt = f"import {{ API_URL }} from '{import_path}';\n"
        content = import_stmt + content
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated API_URL import in: {filepath} ({import_path})")

def main():
    for root, _, files in os.walk(APP_DIR):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                update_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
