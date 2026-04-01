"""Parse markdown files with YAML frontmatter for task/anomaly items."""
import re
from pathlib import Path
from typing import Optional

import yaml

from . import config


def parse_markdown_frontmatter(file_path: Path, project_root: Path) -> Optional[dict]:
    """Parse a .md file with --- frontmatter --- and return dict.
    Includes logic to detect 'corrupt' files (missing fields or duplicate attributes).
    """
    try:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="iso-8859-1") as f:
                content = f.read()
        
        match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
        if not match:
            return None
            
        fm_text = match.group(1)
        fm = yaml.safe_load(fm_text) or {}
        
        fm["path"] = str(file_path.relative_to(project_root)).replace("\\", "/")
        fm["is_corrupt"] = False
        fm["corruption_errors"] = []
        
        # 1. Detect duplicates (scanning raw FM lines with regex for precision)
        keys_found = set()
        # Buscamos claves al principio de línea (clave: valor)
        key_pattern = re.compile(r"^([a-zA-Z0-9_-]+)\s*:", re.MULTILINE)
        for key in key_pattern.findall(fm_text):
            if key in keys_found:
                fm["is_corrupt"] = True
                if f"Atributo duplicado: {key}" not in fm["corruption_errors"]:
                    fm["corruption_errors"].append(f"Atributo duplicado: {key}")
            keys_found.add(key)
        
        # 2. Check for required fields
        required = ["id", "title", "status"]
        for req in required:
            if req not in fm:
                fm["is_corrupt"] = True
                fm["corruption_errors"].append(f"Falta campo requerido: {req}")
        
        # 3. Check for valid status
        if "status" in fm:
            status_val = str(fm["status"]).strip().lower()
            if status_val not in config.ALLOWED_STATUSES:
                fm["is_corrupt"] = True
                fm["corruption_errors"].append(f"Estado '{fm['status']}' no permitido")
        
        # 4. Extract body text after frontmatter as 'content_body' for filtering
        body_text = content[match.end():].strip()
        fm["content_body"] = body_text
            
        return fm
    except Exception as e:
        # If it doesn't even load as YAML, it's definitely corrupt
        return {
            "path": str(file_path.relative_to(project_root)).replace("\\", "/"),
            "is_corrupt": True,
            "corruption_errors": [f"Error de formato YAML: {str(e)}"],
            "id": file_path.stem,
            "title": f"ARCHIVO CORRUPTO: {file_path.name}"
        }
