# LAPOR - Deployment Guide

## Railway Deployment

This guide explains how to deploy the LAPOR application to Railway.

### Prerequisites

1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app))
3. MongoDB Atlas account (for production database)

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

### Step 2: Set Up MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/lapor`)
4. Whitelist Railway's IP addresses (or use 0.0.0.0/0 for all IPs)

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your LAPOR repository
5. Railway will automatically detect the Dockerfile and start building

### Step 4: Configure Environment Variables

In your Railway project dashboard, go to Variables and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lapor
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### Step 5: Custom Domain (Optional)

1. In Railway dashboard, go to Settings
2. Add your custom domain
3. Update DNS records as instructed

### Important Notes

- Railway automatically sets the `PORT` environment variable
- The app serves both API and frontend from the same domain
- File uploads are stored in the container (consider using cloud storage for production)
- Railway provides HTTPS by default

### Troubleshooting

1. **Build fails**: Check the build logs in Railway dashboard
2. **Database connection issues**: Verify MongoDB Atlas connection string and IP whitelist
3. **Environment variables**: Ensure all required variables are set in Railway

### Local Development

To run locally:

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start development servers
cd ../server && npm run dev
# In another terminal:
cd client && npm run dev
```

### Production Build

To test production build locally:

```bash
cd server
npm run build
npm start
```

The app will be available at `http://localhost:3000`