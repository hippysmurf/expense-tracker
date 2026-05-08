# password-reset — Technical Implementation

> **Cross-reference**: User guide → [How to password-reset](../../user/how-to-password-reset.md)

## Overview

The password-reset feature allows users to recover access to their account by requesting a time-limited reset link sent to their registered email address. This feature is not yet implemented in the codebase — this document describes the recommended implementation for a Next.js (App Router) project.

## Feature Type

**Full-stack** — requires a frontend request form and confirmation page, plus backend API routes to generate and validate reset tokens, and email delivery.

## Architecture

### Files & Responsibilities

| File | Role |
|------|------|
| `app/auth/forgot-password/page.tsx` | Form where user enters their email to request a reset link |
| `app/auth/reset-password/page.tsx` | Form where user enters and confirms their new password |
| `app/api/auth/forgot-password/route.ts` | Generates a reset token, stores it, and sends the reset email |
| `app/api/auth/reset-password/route.ts` | Validates the token and updates the user's password |
| `lib/auth/tokens.ts` | Utility functions for generating, hashing, and expiring reset tokens |
| `lib/email/send-reset-email.ts` | Email template and sending logic |
| `types/auth.ts` | TypeScript interfaces for reset request/response payloads |

### Data Flow

1. User submits their email on `/auth/forgot-password`
2. `POST /api/auth/forgot-password` generates a secure random token, hashes and stores it in the database with a 1-hour expiry, then sends the reset email
3. User clicks the link in their email, landing on `/auth/reset-password?token=<raw-token>`
4. User submits a new password; `POST /api/auth/reset-password` hashes the token, looks it up, validates expiry, updates the password, and invalidates the token

## API Reference

### Endpoints

#### Request a reset link

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (always 200 to prevent user enumeration)
```json
{
  "message": "If an account exists for that email, a reset link has been sent."
}
```

#### Reset the password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<raw-token-from-email>",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response**
```json
{
  "message": "Password updated successfully."
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400  | Missing or invalid input (e.g., passwords don't match, token malformed) |
| 410  | Token has expired or already been used |
| 422  | Password does not meet complexity requirements |
| 500  | Internal server error |

## State Management

The forgot-password and reset-password pages are lightweight forms with local component state (React `useState`). No global state manager is required. Form submission state (loading, error, success) should be managed with `useActionState` (Next.js App Router) or a local `useState` flag.

## Database Schema

A `password_reset_tokens` table (or equivalent collection) is required:

```sql
CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,   -- SHA-256 hash of the raw token
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,            -- NULL until consumed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Index `token_hash` for fast lookup. Index `expires_at` for cleanup jobs.

## Configuration

```env
# Email provider credentials
EMAIL_FROM=no-reply@yourdomain.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Base URL used to construct the reset link in the email
NEXT_PUBLIC_APP_URL=https://yourapp.com

# Token TTL in seconds (default: 3600 = 1 hour)
PASSWORD_RESET_TOKEN_TTL=3600
```

## Testing

```bash
# Run auth-related tests
npm test -- --grep "password-reset"
```

**Key test cases to cover:**

- [ ] Happy path: valid email triggers email send and token creation
- [ ] Unknown email returns 200 without revealing account existence
- [ ] Expired token returns 410
- [ ] Already-used token returns 410
- [ ] Mismatched passwords return 400
- [ ] Password too short / too weak returns 422
- [ ] Successful reset invalidates the token and updates the password hash
- [ ] Multiple outstanding tokens: only the most recent should be valid

## Security Considerations

- **Token storage**: store only a SHA-256 hash of the raw token in the database; the raw token is sent only in the email and never persisted.
- **Token entropy**: use `crypto.randomBytes(32)` (Node.js) to generate tokens — never `Math.random()`.
- **Expiry**: tokens must expire (recommended: 1 hour). Clean up expired rows regularly.
- **One-time use**: mark tokens as used immediately upon successful password change.
- **No user enumeration**: the API always returns 200 for the request-reset endpoint, regardless of whether the email exists.
- **Rate limiting**: apply rate limiting to both endpoints to prevent abuse.
- **HTTPS only**: reset links must use HTTPS; never send tokens over HTTP.
- **Password hashing**: always hash the new password with bcrypt/argon2 before storing.

## Known Limitations & Future Work

- Email delivery is not yet implemented — needs an SMTP provider or transactional email service (e.g., Resend, SendGrid, Postmark).
- No admin UI to manually invalidate all active reset tokens for a user.
- Consider adding magic-link login as an extension of this same flow.

## Related Documentation

No existing cross-references found in the codebase at time of writing.
