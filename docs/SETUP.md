# ThaiTune Setup Guide

## Firebase Configuration

The application requires Firebase configuration to work properly. Follow these steps to set up your Firebase project:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

### Step 2: Configure Firebase Authentication

1. In your Firebase project, go to Authentication > Sign-in method
2. Enable the sign-in providers you want to use (Email/Password, Google, etc.)

### Step 3: Configure Firestore Database

1. Go to Firestore Database in your Firebase project
2. Click "Create database"
3. Choose your security rules (start in test mode for development)

### Step 4: Get Firebase Configuration

1. In your Firebase project settings, go to "General" tab
2. Scroll down to "Your apps" section
3. Click on the web app (</>) icon or select your existing web app
4. Copy the Firebase configuration values

### Step 5: Create Environment File

Create a `.env.local` file in the root directory of your project with the following content:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (required for support tickets)
RESEND_API_KEY=your_resend_api_key_here

# Development Settings
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

Replace the placeholder values with your actual Firebase configuration values.

### Step 6: Start the Development Server

```bash
npm run dev
```

## Development Mode

The application includes fallback configuration that allows it to run without Firebase credentials for development purposes. However, Firebase-dependent features will not work without proper configuration.

## Troubleshooting

### Firebase Authentication Error
If you see "Firebase: Error (auth/invalid-api-key)", it means:
1. The `.env.local` file is missing
2. The Firebase configuration values are incorrect
3. The Firebase project is not properly set up

### Solution
1. Verify your `.env.local` file exists and contains the correct values
2. Check that your Firebase project is active and properly configured
3. Ensure all required environment variables are set

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `OPENAI_API_KEY` | OpenAI API Key (for AI features) | Optional |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | Use Firebase emulators | Optional | 