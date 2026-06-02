# Akira Site Monorepo

This repo is now split into two app folders:

- `frontend/`: the existing Next.js site for Vercel
- `backend/`: a new FastAPI scaffold for Render

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

- Vercel should use `frontend/` as the Root Directory
- Render should use `backend/` as the service root

## Migration rule of thumb

Keep these in the frontend for now:

- Supabase browser login/session handling
- public reads that are safe with the anon key

Move these into the backend next:

- create/update/delete character endpoints
- storage uploads and deletes
- future voting logic and protected mutations
