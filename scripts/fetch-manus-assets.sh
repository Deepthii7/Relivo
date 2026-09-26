#!/usr/bin/env bash
set -euo pipefail

# Safe batch downloader for /manus-storage assets via Forge presign API.
# Usage:
#   export BUILT_IN_FORGE_API_URL="https://forge.example.com"
#   export BUILT_IN_FORGE_API_KEY="sk_..."
#   # dry run (prints presigned URLs only)
#   DRY_RUN=1 ./scripts/fetch-manus-assets.sh
#   # actual download
#   ./scripts/fetch-manus-assets.sh

ASSETS=(
  "reusenet-logo_c5678801.png"
  "reusenet-logo_f3c85d59.png"
  "reusenet-about-mission_1662b3f5.png"
  "reusenet-hero_e6fe6164.png"
  "reusenet-ai-brain_1c783303.png"
  "reusenet-community_fd23ed55.png"
)

FORGE_BASE="${BUILT_IN_FORGE_API_URL:-}"
FORGE_KEY="${BUILT_IN_FORGE_API_KEY:-}"
DRY_RUN="${DRY_RUN:-0}"
OUT_DIR="client/public/manus-storage"

if [[ -z "$FORGE_BASE" || -z "$FORGE_KEY" ]]; then
  echo "Error: BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY must be set in the environment." >&2
  echo "This script will not prompt for secrets; set them and re-run." >&2
  exit 2
fi

# Ensure required tools exist
if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required." >&2
  exit 2
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required to parse JSON. Install jq and retry." >&2
  exit 2
fi

# Normalise base URL (remove trailing slashes)
FORGE_BASE="${FORGE_BASE%/}"

mkdir -p "$OUT_DIR"

for asset in "${ASSETS[@]}"; do
  echo "Processing: $asset"

  # Perform presign request
  resp=$(curl -sS -H "Authorization: Bearer ${FORGE_KEY}" "${FORGE_BASE}/v1/storage/presign/get?path=${asset}" || true)
  if [[ -z "$resp" ]]; then
    echo "  Error: empty response from presign endpoint for $asset" >&2
    continue
  fi

  url=$(echo "$resp" | jq -r .url // empty)
  if [[ -z "$url" || "$url" == "null" ]]; then
    echo "  Error: presign API did not return a .url for $asset. Response:" >&2
    echo "$resp" | jq . >&2 || echo "$resp" >&2
    continue
  fi

  echo "  Signed URL obtained."
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  DRY RUN: signed URL -> $url"
    continue
  fi

  # Download the file following redirects
  outpath="$OUT_DIR/$asset"
  echo "  Downloading to $outpath"
  if curl -L --fail --silent --show-error -o "$outpath" "$url"; then
    size=$(wc -c <"$outpath" || echo 0)
    if [[ "$size" -gt 0 ]]; then
      echo "  Saved ($size bytes)."
    else
      echo "  Warning: downloaded file is empty for $asset" >&2
    fi
  else
    echo "  Error: failed to download $asset from signed URL" >&2
  fi

done

echo "Done. If files were written, build with: npm run build && npm run preview"