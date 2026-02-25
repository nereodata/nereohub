# PyInstaller spec for NereoHub
# Run: pyinstaller nereohub.spec

import sys
from pathlib import Path

block_cipher = None

# Path to nereohub package (when running from project root)
nereohub_root = Path('nereohub')
static_src = nereohub_root / 'static'

a = Analysis(
    ['nereohub/__main__.py'],
    pathex=[],
    binaries=[],
    datas=[
        (str(static_src), 'nereohub/static'),
    ],
    hiddenimports=[
        'nereohub.config',
        'nereohub.api',
        'nereohub.discovery',
        'nereohub.parsing',
        'nereohub.pdf_generator',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='nereohub',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
