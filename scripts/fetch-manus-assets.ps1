<#
Safe batch downloader for /manus-storage assets via Forge presign API (PowerShell).
Usage (PowerShell):
  $env:BUILT_IN_FORGE_API_URL = 'https://forge.example.com'
  $env:BUILT_IN_FORGE_API_KEY = 'sk_...'
  # Dry run (prints signed URLs only)
  $env:DRY_RUN = '1'; .\scripts\fetch-manus-assets.ps1
  # Actual download
  .\scripts\fetch-manus-assets.ps1
#>

$Assets = @(
  'reusenet-logo_c5678801.png'
  'reusenet-logo_f3c85d59.png'
  'reusenet-about-mission_1662b3f5.png'
  'reusenet-hero_e6fe6164.png'
  'reusenet-ai-brain_1c783303.png'
  'reusenet-community_fd23ed55.png'
)

$ForgeBase = $env:BUILT_IN_FORGE_API_URL
$ForgeKey = $env:BUILT_IN_FORGE_API_KEY
$DryRun = $env:DRY_RUN
$OutDir = 'client/public/manus-storage'

if (-not $ForgeBase -or -not $ForgeKey) {
  Write-Error "BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY must be set as environment variables."
  exit 2
}

# Normalise base URL
$ForgeBase = $ForgeBase.TrimEnd('/')

if (-not (Test-Path -Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

foreach ($asset in $Assets) {
  Write-Host "Processing: $asset"
  $uri = "$ForgeBase/v1/storage/presign/get?path=$asset"
  try {
    $resp = Invoke-RestMethod -Uri $uri -Headers @{ Authorization = "Bearer $ForgeKey" } -Method Get -ErrorAction Stop
  } catch {
    Write-Warning "  Presign request failed for $asset: $($_.Exception.Message)"
    continue
  }

  $signedUrl = $resp.url
  if (-not $signedUrl) {
    Write-Warning "  Presign API returned no .url for $asset. Response: $($resp | ConvertTo-Json -Depth 5)"
    continue
  }

  Write-Host "  Signed URL obtained."
  if ($DryRun -eq '1') {
    Write-Host "  DRY RUN: $signedUrl"
    continue
  }

  $outPath = Join-Path $OutDir $asset
  try {
    Invoke-WebRequest -Uri $signedUrl -OutFile $outPath -UseBasicParsing -ErrorAction Stop
    $fi = Get-Item $outPath
    if ($fi.Length -gt 0) {
      Write-Host "  Saved ($($fi.Length) bytes)."
    } else {
      Write-Warning "  Downloaded file is empty for $asset"
    }
  } catch {
    Write-Warning "  Failed to download $asset: $($_.Exception.Message)"
  }
}

Write-Host 'Done. If files were written, run `npm run build` and `npm run preview` to verify.'