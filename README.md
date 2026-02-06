# Frontend Setup Guide

## Environment Configuration

Create a `.env` file in the `frontend` directory (or set environment variables) with:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For Android emulator, use:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

For iOS simulator, use:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For physical device, use your computer's IP address:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## API Integration

The frontend now uses the backend API for:
- Authentication (login/signup)
- Videos (fetching from backend)
- FlipBooks (fetching from backend)
- Exam Results (fetching and creating)

All API calls are handled through the service layer:
- `services/api.ts` - Base API service
- `services/auth.ts` - Authentication service
- `services/videos.ts` - Video service
- `services/flipbooks.ts` - FlipBook service
- `services/exam-results.ts` - Exam results service

## Backend Connection

Make sure the backend server is running on port 3000 (or update the API URL accordingly).
