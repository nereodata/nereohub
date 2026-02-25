"""Parse markdown files with YAML frontmatter for task/anomaly items."""
import re
from pathlib import Path
from typing import Optional

import yaml


def parse_markdown_frontmatter(file_path: Path, project_root: Path) -> Optional[dict]:
    """Parse a .md file with --- frontmatter --- and return dict with path (relative to project_root) and content_text."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
        if match:
            fm = yaml.safe_load(match.group(1))
            if not fm:
                return None
            fm["path"] = str(file_path.relative_to(project_root)).replace("\\", "/")
            fm["content_text"] = content[match.end():].strip()
            return fm
    except Exception:
        pass
    return None
