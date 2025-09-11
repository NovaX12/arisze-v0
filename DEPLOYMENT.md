# ARISZE App - Local Deployment Guide

## Prerequisites

Before deploying the ARISZE application locally, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **Git**
- **MongoDB Atlas Account** (for database)

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/arisze-db?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth (Optional - for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Settings
NODE_ENV=development
```

### Required API Keys and Services

1. **MongoDB Atlas**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Whitelist your IP address

2. **NextAuth Secret**:
   - Generate a random secret: `openssl rand -base64 32`
   - Or use any secure random string generator

3. **Google OAuth** (Optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

## Local Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd arisze-app
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

### 3. Environment Setup

```bash
# Copy the environment template
cp .env.example .env.local

# Edit the .env.local file with your actual values
```

### 4. Initialize Database

```bash
# Initialize MongoDB collections and seed data
node init-collections.js
```

### 5. Start Development Server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Main App**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*

## Database Collections

The application uses the following MongoDB collections:
- `users` - User accounts and profiles
- `events` - Event listings and details
- `bookings` - Event bookings and reservations
- `cafes` - Cafe information and locations
- `universities` - University data
- `posts` - Community posts and content

## Production Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Docker Deployment

```bash
# Build the Docker image
docker build -t arisze-app .

# Run the container
docker run -p 3000:3000 --env-file .env.local arisze-app
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check MongoDB URI format
   - Verify IP whitelist in MongoDB Atlas
   - Ensure network connectivity

2. **NextAuth Errors**:
   - Verify NEXTAUTH_URL matches your domain
   - Check NEXTAUTH_SECRET is set
   - Ensure OAuth redirect URIs are correct

3. **Image Loading Issues**:
   - Check `next.config.mjs` for allowed image domains
   - Verify external image URLs are accessible

4. **Build Errors**:
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Performance Optimization

- Use `pnpm` instead of `npm` for faster installs
- Enable caching in production
- Optimize images using Next.js Image component
- Use MongoDB indexes for better query performance

## Support

For issues and questions:
- Check the error logs in terminal
- Review `current-errors.md` for known issues
- Ensure all environment variables are properly set

---

**Note**: This application is built with Next.js 14, React 18, and MongoDB. Make sure your environment supports these versions.