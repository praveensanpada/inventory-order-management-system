#!/usr/bin/env bash
set -euo pipefail

python3 -m venv ethara_ai_venv
source ethara_ai_venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
