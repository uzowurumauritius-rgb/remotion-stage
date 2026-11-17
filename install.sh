#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_SKILLS_DIR="$SCRIPT_DIR/skills"
TARGET_DIR="${HOME}/.gemini/config/skills"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--target DIR]

Install all 8 Remotion Stage explainer skills into an AI agent skills directory.

Options:
  --target DIR   Destination skills directory (default: ~/.gemini/config/skills)
  -h, --help     Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      [[ $# -ge 2 ]] || { echo "Error: --target requires a directory argument" >&2; exit 1; }
      TARGET_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

echo "Installing Remotion Stage skills to: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

count=0
for skill_dir in "$SOURCE_SKILLS_DIR"/remotion-*; do
  [[ -d "$skill_dir" ]] || continue
  skill_name="$(basename "$skill_dir")"
  rm -rf "${TARGET_DIR:?}/$skill_name"
  cp -a "$skill_dir" "$TARGET_DIR/$skill_name"
  echo "  ✓ Installed $skill_name"
  count=$((count + 1))
done

echo ""
echo "Installed $count Remotion Stage skills."
echo ""
echo "Prerequisite check:"
for cmd in node npm python3 uv ffmpeg ffprobe; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "  ✓ $cmd ($(command -v "$cmd"))"
  else
    echo "  ✗ $cmd not found on PATH — install before rendering videos"
  fi
done
