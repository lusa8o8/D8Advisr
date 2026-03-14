from pathlib import Path
content = Path('new_content.txt').read_text()
Path('src/app/(main)/plans/page.tsx').write_text(content)
