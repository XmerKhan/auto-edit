# AutoCut Render Server

A Node.js + Express backend that renders videos server-side using Remotion's `renderMedia()` API. This replaces the unreliable browser-based WebCodecs rendering with a proper headless Chromium pipeline.

## Architecture

- **Express API server** with endpoints for uploading media, starting render jobs, polling status, and downloading the final MP4.
- **Remotion bundler + renderer** that bundles the React composition, then renders it to MP4 using headless Chromium.
- **In-memory job queue** tracking each render's progress, with automatic cleanup of old output files (after 1 hour).
- **Shared composition code** — the React components (`VideoComposition`, `SceneComponent`, `Caption`, `MotionGraphics`, etc.) are copied into `server/remotion/` so the server bundles the exact same compositions the frontend previews.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload media files (multipart form data, field name `files`). Returns file IDs and paths. |
| `POST` | `/api/render` | Start a render job. Body: `{ timeline: TimelineData, settings: EditSettings }`. Returns `{ jobId }`. |
| `GET` | `/api/render/:jobId/status` | Poll render progress. Returns `{ jobId, status, progress, message, error }`. |
| `GET` | `/api/render/:jobId/download` | Download the finished MP4 (only available when status is `done`). |
| `GET` | `/api/health` | Health check. |

## Running Locally

```bash
cd server
npm install
npm run dev
```

The server starts on `http://localhost:3001`.

### How rendering works

1. The frontend uploads media files via `POST /api/upload`, receiving file IDs.
2. The frontend builds the timeline JSON (same shape used for the Player preview) but with media URLs pointing to the server's `/api/uploads/<filename>` endpoints.
3. The frontend POSTs the timeline + settings to `/api/render`, receiving a `jobId`.
4. The frontend polls `/api/render/:jobId/status` every 1-2 seconds.
5. When status is `done`, the frontend downloads from `/api/render/:jobId/download`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the Express server listens on. |
| `ALLOWED_ORIGIN` | `*` | Comma-separated list of allowed CORS origins (e.g. `https://your-bolt-app.bolt.new`). Set to `*` to allow all. |

## Deploying to Render.com

1. Push your repo (including the `server/` directory) to GitHub.
2. On Render, create a new **Web Service** → connect your repo.
3. Set the following:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - Or use the included **Dockerfile** (Render auto-detects it if the Root Directory is `server/`).
4. Add environment variables:
   - `ALLOWED_ORIGIN` = your frontend's URL (e.g. `https://your-app.bolt.new`)
   - `PORT` = `3001` (Render sets this automatically, but you can be explicit)
5. Deploy. The first deploy will download Chromium via `npx remotion browser ensure` (included in the Dockerfile).

### Dockerfile deployment

If using Docker on Render:
- Render auto-detects the `Dockerfile` in the Root Directory.
- The Dockerfile installs all Chromium system dependencies, runs `npx remotion browser ensure`, builds TypeScript, and starts the server.

## Notes

- The server stores uploaded files in `uploads/` and rendered MP4s in `output/`. On Render's free tier, storage is ephemeral — files are lost on redeploy. This is fine for a render service since the user downloads the video immediately.
- Old render jobs and their output files are cleaned up after 1 hour.
- The composition code in `server/remotion/` is a copy of `src/remotion/` from the frontend. If you change the frontend compositions, update the server copy too.
