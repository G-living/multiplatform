# filter_images.ps1
# Coloca este archivo en la misma carpeta que las imagenes y tt_codes_to_keep.txt
# Ejecutar en PowerShell: .\filter_images.ps1

$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$txtFile = Join-Path $folder "tt_codes_to_keep.txt"

if (-not (Test-Path $txtFile)) {
    Write-Host "ERROR: No se encontro tt_codes_to_keep.txt en $folder" -ForegroundColor Red
    exit 1
}

# Cargar codigos validos en un HashSet para busqueda rapida
$validCodes = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
Get-Content $txtFile | ForEach-Object { $validCodes.Add($_.Trim()) | Out-Null }
Write-Host "Codigos cargados: $($validCodes.Count)" -ForegroundColor Cyan

# Crear carpetas destino
$keep    = Join-Path $folder "_CONSERVAR"
$discard = Join-Path $folder "_DESCARTAR"
New-Item -ItemType Directory -Force -Path $keep    | Out-Null
New-Item -ItemType Directory -Force -Path $discard | Out-Null

$countKeep = 0
$countDiscard = 0

# Procesar cada imagen jpg/jpeg en la carpeta raiz (no subcarpetas)
Get-ChildItem -Path $folder -MaxDepth 1 -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg)$' } | ForEach-Object {
    $code = $_.BaseName  # nombre sin extension
    if ($validCodes.Contains($code)) {
        Move-Item -Path $_.FullName -Destination (Join-Path $keep $_.Name)
        $countKeep++
    } else {
        Move-Item -Path $_.FullName -Destination (Join-Path $discard $_.Name)
        $countDiscard++
    }
}

Write-Host ""
Write-Host "--- RESULTADO ---" -ForegroundColor Green
Write-Host "CONSERVAR : $countKeep  imagenes -> _CONSERVAR\" -ForegroundColor Green
Write-Host "DESCARTAR : $countDiscard imagenes -> _DESCARTAR\" -ForegroundColor Yellow
Write-Host "TOTAL     : $($countKeep + $countDiscard)"
