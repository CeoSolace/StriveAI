# striveAI

A self-hosted, no-external-API conversational AI.

## Features
- Login required (username + password)
- Trains from `train/` folder
- Instant IP ban for Nazi/racist content
- Auto-deletes stale conversations hourly
- Public API + web UI
- 100% free to run on Render.com

## Deploy
1. Push this repo to GitHub
2. Create new Web Service on Render.com
3. Connect to this repo
4. Add MongoDB (free)
5. Deploy!

API: `POST /api/chat` with `Authorization: Bearer <user_id>` and `{ "message": "..." }`
