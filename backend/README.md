# Backend

This is a starter FastAPI service for Render.

## Local run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Render start command

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## What should move here first

1. Character create, update, and delete endpoints
2. Supabase storage upload and delete logic
3. Voting endpoints and duplicate-vote protection
