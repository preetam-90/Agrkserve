# Authentication System

This document provides an overview of the authentication system used in the AgriServe application.

## Overview

The authentication system is built using Supabase, which provides a secure and scalable backend for user authentication. The system supports email/password authentication, OAuth providers, and password recovery.

## Features

- **Email/Password Authentication**: Users can sign up and log in using their email and password.
- **OAuth Providers**: Support for third-party authentication providers like Google, GitHub, etc.
- **Password Recovery**: Users can reset their passwords via email.
- **Session Management**: Secure session handling to ensure user sessions are maintained and protected.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Supabase account and project
- Environment variables configured in `.env.local`

### Configuration

1. **Supabase Configuration**:
   - Create a Supabase project and obtain the `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - Add these to your `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

2. **Authentication Pages**:
   - The authentication pages are located in the `src/app/auth` directory.
   - Key pages include:
     - `src/app/login/page.tsx`: Login page for users.
     - `src/app/auth/reset-password/page.tsx`: Password reset page.
     - `src/app/forgot-password/page.tsx`: Forgot password page.

3. **Middleware**:
   - Authentication middleware is configured in `src/middleware.ts` to protect routes and manage user sessions.

## Usage

### Login

Users can log in using their email and password or via OAuth providers. The login page is accessible at `/login`.

### Password Reset

Users can reset their passwords by navigating to `/forgot-password` and entering their email. A reset link will be sent to their email.

### Session Management

User sessions are managed automatically by Supabase. The session is maintained across page refreshes and browser restarts.

## Security

- **Password Hashing**: Passwords are hashed using industry-standard algorithms.
- **Session Encryption**: Sessions are encrypted to prevent unauthorized access.
- **Rate Limiting**: Authentication endpoints are rate-limited to prevent brute force attacks.

## Troubleshooting

- **Login Issues**: Ensure that the Supabase URL and anon key are correctly configured in the environment variables.
- **Session Expiry**: If sessions expire unexpectedly, check the Supabase session configuration.
- **Password Reset**: Ensure that the email service is properly configured in Supabase.

## Contributing

If you would like to contribute to the authentication system, please follow the guidelines in `CONTRIBUTING.md`.