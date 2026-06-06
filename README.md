# Akira Site Monorepo

This repo is now split into two app folders:

- `frontend/`: the existing Next.js site for Vercel
- `backend/`: a FastAPI backend deployed as a separate Vercel project

## Local commands

Run the frontend from the repo root:

```bash
npm run dev
```

Or run it directly from the frontend folder:

```bash
cd frontend
npm run dev
```

## Deploy targets

- Frontend Vercel project should use `frontend/` as the Root Directory
- Backend Vercel project should use `backend/` as its project root

## Future deployment notes

- Future backend work can include voting logic
