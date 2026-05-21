# PowerShell script to install and launch NereoHub on Windows
param (
    [string]$Port = $env:NEREOHUB_PORT,
    [string]$Venv = ".venv",
    [switch]$Rebuild
)

$ProjectDir = Resolve-Path "$PSScriptRoot\.."
$VenvDir = Join-Path $ProjectDir $Venv
$FrontendDir = Join-Path $ProjectDir "frontend"
$StaticDir = Join-Path $ProjectDir "nereohub\static"

# Set port if provided
if ($Port) {
    $env:NEREOHUB_PORT = $Port
}

# 1. Create and setup Virtual Environment if it doesn't exist
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "[nereohub] Creando entorno virtual en $Venv..." -ForegroundColor Cyan
    python -m venv $VenvDir
    
    Write-Host "[nereohub] Actualizando pip e instalando dependencias..." -ForegroundColor Cyan
    & $PythonExe -m pip install --upgrade pip
    & $PythonExe -m pip install -e .
}

# 2. Check if frontend assets are missing or out of sync, and compile
$AssetsDir = Join-Path $StaticDir "assets"
$NeedsBuild = $Rebuild.IsPresent

if (-not $NeedsBuild) {
    if (-not (Test-Path $AssetsDir)) {
        $NeedsBuild = $true
    } else {
        # Verify if files referenced in index.html actually exist
        $IndexHtml = Join-Path $StaticDir "index.html"
        if (Test-Path $IndexHtml) {
            $Content = Get-Content $IndexHtml -Raw
            if ($Content -match 'src="/assets/([^"]+)"') {
                $JsFile = Join-Path $AssetsDir $Matches[1]
                if (-not (Test-Path $JsFile)) {
                    Write-Host "[nereohub] Detectado desfase en archivos JS. Reconstruyendo..." -ForegroundColor Yellow
                    $NeedsBuild = $true
                }
            }
            if ($Content -match 'href="/assets/([^"]+)"') {
                $CssFile = Join-Path $AssetsDir $Matches[1]
                if (-not (Test-Path $CssFile)) {
                    Write-Host "[nereohub] Detectado desfase en archivos CSS. Reconstruyendo..." -ForegroundColor Yellow
                    $NeedsBuild = $true
                }
            }
        } else {
            $NeedsBuild = $true
        }
    }
}

if ($NeedsBuild) {
    $NpmCheck = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $NpmCheck) {
        Write-Error "[nereohub] Faltan los assets compilados del frontend ($StaticDir\assets)`n           y no se ha encontrado 'npm' en el PATH para compilarlos.`n`nOpciones:`n  - Devs: instala Node.js 18+ y vuelve a lanzar este script.`n  - No-devs: usa un wheel/exe pre-compilado."
        exit 1
    }
    
    Write-Host "[nereohub] Compilando frontend..." -ForegroundColor Cyan
    Push-Location $FrontendDir
    try {
        npm install
        npm run build
    } finally {
        Pop-Location
    }
    
    if (-not (Test-Path $StaticDir)) {
        New-Item -ItemType Directory -Path $StaticDir -Force | Out-Null
    }
    
    # Clean old assets if any, and copy new ones
    if (Test-Path $AssetsDir) {
        Remove-Item -Recurse -Force $AssetsDir
    }
    Copy-Item -Recurse -Force (Join-Path $FrontendDir "dist\assets") $StaticDir
    Copy-Item -Force (Join-Path $FrontendDir "dist\index.html") (Join-Path $StaticDir "index.html")
    Write-Host "[nereohub] Frontend compilado y copiado con éxito." -ForegroundColor Green
}

# 3. Launch the application
Write-Host "[nereohub] Lanzando servidor..." -ForegroundColor Green
& $PythonExe -m nereohub $args
