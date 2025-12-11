# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for CocoFile Python Backend

import sys
from pathlib import Path
from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

# Collect all dependencies for packages with dynamic imports
datas = [
    ('analyzers', 'analyzers'),
    ('utils', 'utils'),
    ('database', 'database'),
]
binaries = []
hiddenimports = [
    'pdfplumber',
    'openpyxl',
    'docx2txt',
    'pptx',
    'PIL',
    'pypdfium2',
]

# Collect pkg_resources and all its dependencies (jaraco, platformdirs, etc.)
for pkg in ['pkg_resources', 'jaraco', 'platformdirs', 'setuptools']:
    try:
        pkg_datas, pkg_binaries, pkg_hiddenimports = collect_all(pkg)
        datas += pkg_datas
        binaries += pkg_binaries
        hiddenimports += pkg_hiddenimports
    except Exception:
        pass

# Explicitly add platformdirs to hiddenimports (critical for pkg_resources)
hiddenimports += ['platformdirs', 'platformdirs.unix', 'platformdirs.windows']

# Also collect submodules explicitly
for pkg in ['jaraco.text', 'jaraco.functools', 'jaraco.context']:
    try:
        hiddenimports += collect_submodules(pkg)
    except Exception:
        pass

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
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
    name='python-analyzer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # stdin/stdout通信を使うため、consoleが必要（Tauri側で非表示にする）
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
