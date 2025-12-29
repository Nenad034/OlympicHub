# Gemini API Security Setup

This guide explains how to securely configure the Gemini API key using Supabase Edge Functions.

## Why This Matters

⚠️ **Never expose API keys in frontend code!**

If the Gemini API key is in your frontend JavaScript:
- Anyone can view it in browser DevTools
- Attackers can steal your API quota
- You could face unexpected charges

## Architecture

```
┌─────────────┐     ┌───────────────────┐     ┌─────────────┐
│   Frontend  │ ──> │  Supabase Edge    │ ──> │  Gemini API │
│  (Browser)  │     │  Function (Proxy) │     │  (Google)   │
└─────────────┘     └───────────────────┘     └─────────────┘
                           │
                    API Key stored
                    securely here
```

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
cd olympichub034
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set the API Key Secret

```bash
supabase secrets set GEMINI_API_KEY=your-actual-gemini-api-key
```

### 5. Deploy the Edge Function

```bash
supabase functions deploy gemini-proxy
```

### 6. Verify Deployment

Test the function:

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/gemini-proxy' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Hello, who are you?"}'
```

## Frontend Usage

The `src/services/gemini.ts` service automatically routes requests:

- **Production Mode**: Uses Edge Function (secure)
- **Development Mode**: Falls back to direct API (set `VITE_GEMINI_API_KEY`)

### Using the Service

```typescript
import { askGemini, chatWithGemini } from '@/services/gemini';

// Simple prompt
const result = await askGemini('What is the capital of France?');

// With options
const result = await askGemini('Explain quantum computing', {
  model: 'gemini-1.5-pro',
  maxTokens: 4096,
  temperature: 0.5,
});

// Chat with history
const result = await chatWithGemini([
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'Tell me about hotels in Montenegro' },
]);
```

## Environment Variables

### Development (.env.local)

```env
# Only for local development - DO NOT commit!
VITE_GEMINI_API_KEY=your-dev-api-key

# Force use of edge function even in dev
VITE_USE_EDGE_FUNCTION=true
```

### Production (Supabase Secrets)

Set via CLI:
```bash
supabase secrets set GEMINI_API_KEY=your-production-api-key
```

## Troubleshooting

### "Edge function error"

1. Check if function is deployed: `supabase functions list`
2. Check logs: `supabase functions logs gemini-proxy`
3. Verify secret is set: `supabase secrets list`

### "API key not configured"

Make sure you've set the secret:
```bash
supabase secrets set GEMINI_API_KEY=your-key
```

### CORS Issues

The Edge Function includes CORS headers. If issues persist, verify the request origin.

## Security Checklist

- [ ] Gemini API key removed from `.env` file
- [ ] Edge Function deployed to Supabase
- [ ] Secret set via `supabase secrets set`
- [ ] Frontend service configured to use Edge Function
- [ ] `.env.local` added to `.gitignore`
- [ ] Verify no API keys in committed code

## Related Files

- `supabase/functions/gemini-proxy/index.ts` - Edge Function
- `src/services/gemini.ts` - Frontend service
- `docs/SECURITY.md` - This file
