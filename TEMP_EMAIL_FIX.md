# TEMPORARY EMAIL FIX

## Quick Fix for Testing
Change this line in `send-approval-email` function:

```typescript
// CHANGE FROM:
from: "StarStore <noreply@starstore.site>",

// CHANGE TO:
from: "johnwanderi202@gmail.com",
```

This will allow emails to be sent during testing phase.

## Production Fix Required
You need to:
1. Go to https://resend.com/domains
2. Add and verify your domain (starstore.site)
3. Then change back to: `from: "StarStore <noreply@starstore.site>"`