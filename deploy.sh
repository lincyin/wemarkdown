#!/bin/bash
# Deploy WeMarkdown to OA Pages (https://wemd.pages.woa.com)
#
# Usage:
#   ./deploy.sh                          # deploy with default description
#   ./deploy.sh "Fix footnote drawer"    # deploy with a custom description
#   ./deploy.sh --dry-run                # list files that WOULD be uploaded, no network call
#
# API Key resolution order:
#   1. $OA_PAGES_API_KEY env var (recommended — see https://pages.woa.com/skill.md)
#   2. Fallback key baked into this script (convenient but please rotate if leaked)

set -e

DRY_RUN=0
if [ "$1" = "--dry-run" ] || [ "$1" = "-n" ]; then
  DRY_RUN=1
  shift
fi

CNAME="wemd.pages.woa.com"
FALLBACK_KEY="oa-pages-key-797f345a47c2973cdf4de56ab8ca6fcfb1f91d1a10230460"
API_KEY="${OA_PAGES_API_KEY:-$FALLBACK_KEY}"
DIR="$(cd "$(dirname "$0")" && pwd)"
DESCRIPTION="${1:-WeMarkdown - in-browser Markdown renderer & style workbench}"

if [ "$DRY_RUN" = "1" ]; then
  echo "==> DRY RUN — no network calls will be made"
else
  echo "==> Deploying to https://${CNAME}"
fi
echo "    Source dir: ${DIR}"
if [ -n "$OA_PAGES_API_KEY" ]; then
  echo "    API Key:    \$OA_PAGES_API_KEY (env)"
else
  echo "    API Key:    fallback (baked in deploy.sh)"
fi
echo

export OA_PAGES_DRY_RUN="$DRY_RUN"
python3 - <<PYEOF
import base64
import json
import os
import sys
import urllib.error
import urllib.request

API_KEY     = "${API_KEY}"
CNAME       = "${CNAME}"
DIR         = "${DIR}"
DESCRIPTION = """${DESCRIPTION}"""
DRY_RUN     = os.environ.get("OA_PAGES_DRY_RUN") == "1"

# ---- File collection rules --------------------------------------------------
# Treat anything in these extension groups as "text" (uploaded raw as UTF-8).
# Everything else is treated as binary and base64-encoded (server decodes by
# extension, per skill.md).
TEXT_EXT = {
    ".html", ".htm", ".css", ".js", ".mjs", ".json", ".svg",
    ".md", ".txt", ".xml", ".yml", ".yaml", ".csv",
    ".map", ".ts", ".tsx", ".jsx",
}

# Never upload these (build artifacts, version control, local tooling, etc.)
SKIP_DIRS  = {".git", ".github", ".vscode", ".idea", "node_modules", "__pycache__"}
SKIP_FILES = {".DS_Store", "deploy.sh", "dev-server.py"}

def is_text_file(path):
    return os.path.splitext(path)[1].lower() in TEXT_EXT

def read_file(abs_path):
    """Return (content_str, is_binary). Binary files are base64-encoded."""
    if is_text_file(abs_path):
        with open(abs_path, "r", encoding="utf-8") as f:
            return f.read(), False
    with open(abs_path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii"), True

def collect_files(root):
    files = {}
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune skipped directories in-place so os.walk doesn't descend.
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if name in SKIP_FILES or name.startswith("."):
                continue
            abs_path = os.path.join(dirpath, name)
            rel_path = os.path.relpath(abs_path, root).replace(os.sep, "/")
            content, is_bin = read_file(abs_path)
            files[rel_path] = content
            size = os.path.getsize(abs_path)
            tag  = "bin" if is_bin else "txt"
            print(f"    [{tag}] {rel_path}  ({size:,} B)")
    return files

def site_exists(cname, api_key):
    """GET /api/repos/:cname -> True if site is reachable, False on 404."""
    req = urllib.request.Request(
        f"https://pages.woa.com/api/repos/{cname}",
        method="GET",
        headers={"X-Api-Key": api_key},
    )
    try:
        urllib.request.urlopen(req, timeout=15)
        return True
    except urllib.error.HTTPError as e:
        if e.code in (403, 404):
            return False
        raise

# ---- Build payload ----------------------------------------------------------
print("==> Collecting files")
files = collect_files(DIR)
if not files:
    print("ERROR: No files to upload.", file=sys.stderr)
    sys.exit(1)

payload = {"files": files, "description": DESCRIPTION}
body    = json.dumps(payload).encode("utf-8")
size_kb = len(body) / 1024
print()
print(f"    Files: {len(files)}")
print(f"    Size:  {size_kb:.1f} KB (limit: 5120 KB)")
if size_kb > 5120:
    print("ERROR: payload exceeds the 5 MB API limit.", file=sys.stderr)
    sys.exit(1)

if DRY_RUN:
    print()
    print("==> Dry-run complete. Re-run without --dry-run to actually deploy.")
    sys.exit(0)

# ---- Create or update -------------------------------------------------------
print()
exists = site_exists(CNAME, API_KEY)
if exists:
    url    = f"https://pages.woa.com/api/sites/{CNAME}"
    method = "PUT"
    print(f"==> Site exists — updating via PUT {url}")
else:
    url    = "https://pages.woa.com/api/sites"
    method = "POST"
    payload["cname"] = CNAME
    body = json.dumps(payload).encode("utf-8")
    print(f"==> Site not found — creating via POST {url}")

req = urllib.request.Request(
    url,
    data=body,
    method=method,
    headers={"X-Api-Key": API_KEY, "Content-Type": "application/json"},
)
try:
    resp   = urllib.request.urlopen(req, timeout=60)
    result = json.loads(resp.read().decode("utf-8"))
    print()
    print(f"    ✓ {result.get('message', 'OK')}")
    if "updated_at" in result:
        print(f"    updated_at: {result['updated_at']}")
    print(f"    URL: https://{CNAME}")
except urllib.error.HTTPError as e:
    detail = e.read().decode("utf-8", errors="replace")
    print(f"    ✗ HTTP {e.code}: {detail}", file=sys.stderr)
    sys.exit(1)
PYEOF
