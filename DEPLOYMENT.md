# Free deployment

## Render

1. Push this repository to GitHub.
2. Create a Web Service on Render and select the repository.
3. Render can use `render.yaml`, or set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `python server.py`
4. Add these environment variables in Render:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `MONGO_DB_NAME` (for example, `titan_forge_gym`)
   - `CORS_ORIGINS` (your exact `https://YOUR-SERVICE.onrender.com` origin)
5. After Render gives the service URL, add these Google OAuth values:
   - Authorized JavaScript origin: `https://YOUR-SERVICE.onrender.com`
   - Authorized redirect URI: `https://YOUR-SERVICE.onrender.com/api/auth/google/callback`
6. Open the Render URL and test Google login.

Google sessions are stored in MongoDB when it is available, so users stay signed in after a service restart.

Do not commit OAuth secrets, client-secret JSON files, or `.env` files.
