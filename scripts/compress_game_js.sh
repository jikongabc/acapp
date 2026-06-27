#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# TypeScript replaces the old JS concatenation step. The browser imports
# dist/main.js, and that module points to the compiled dependency modules.
npm run build
python3 manage.py collectstatic --noinput
