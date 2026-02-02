# Environment Setup

## Security Notice
⚠️ **IMPORTANT**: The `.env` file contains your actual MongoDB Atlas credentials for development.
- **Never commit** `.env` to version control
- **Rotate credentials** if accidentally exposed
- **Use environment variables** in production

## MongoDB Atlas Setup
1. Your current credentials are in `.env` (already configured)
2. For new setup: Copy `.env.example` to `.env` and add your Atlas credentials
3. Get connection string from MongoDB Atlas dashboard

## Production Security
- Use environment variables instead of `.env` file
- Enable IP whitelisting in MongoDB Atlas
- Use database-specific users with minimal permissions