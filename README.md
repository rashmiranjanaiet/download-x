# FrameFlow

FrameFlow is a modern, no-database web application for processing public YouTube and Instagram video links. Users can paste a supported URL, inspect the title and thumbnail, and quickly download the best video, convert to MP3, or keep the original source format.

## Stack

- React + Vite frontend
- Express backend
- `yt-dlp` for metadata extraction and downloads
- `ffmpeg` for conversion workflows
- Docker + `render.yaml` for deployment on Render

## What it does

- Paste a public YouTube or Instagram video link
- Fetch metadata like title, creator, duration, published date, views, and thumbnail
- Download the best available video
- Convert to MP3
- Download the original source format
- Run without a database or user accounts

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Download the local yt-dlp binary

```bash
npm run setup:tools
```

This downloads `yt-dlp` into `server/bin` for local development.

### 3. Optional overrides

`ffmpeg-static` is bundled through npm, so you usually do not need to install FFmpeg manually.

If you prefer custom binary paths, you can still override them:

```bash
YTDLP_PATH=yt-dlp
FFMPEG_PATH=ffmpeg
```

### 4. Start the app

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

## Production build

```bash
npm run build
npm start
```

The Express server serves the built frontend from `client/dist`.

## Deploying to Render

This project includes:

- `Dockerfile`
- `render.yaml`
- `/api/health` for Render health checks

### Option 1: Blueprint deploy

1. Push this project to GitHub, GitLab, or Bitbucket.
2. In Render, create a new Blueprint or sync the repo with the included `render.yaml`.
3. Render will build the Docker image and expose the app on port `10000`.

### Option 2: Standard web service

1. Create a new Web Service in Render.
2. Choose the `Docker` runtime.
3. Point Render to the repo root `Dockerfile`.
4. Set the health check path to `/api/health`.

## Important notes

- Only process content you own or have permission to download.
- Public Instagram and YouTube links work best. Private, age-restricted, or region-locked content may fail.
- On Render free plans, cold starts and long-running conversions will be slower than paid plans.
