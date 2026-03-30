# StarStore Ambassador Program

A landing site for the StarStore Ambassador Program — promoting Telegram Stars and Premium subscriptions. Ambassadors can learn about the program, view tier levels, sign up for the newsletter, and contact the team.

## 🌟 Features

- **Landing Page**: Hero section, program overview, how it works, tier levels, policies, opt-out info, FAQ, and newsletter signup
- **Contact Page**: Contact form with subject categories, powered by a Supabase Edge Function that sends emails via Resend
- **Newsletter Signup**: Email subscription stored in Supabase with duplicate detection via RPC
- **Scroll Animations**: Section reveal animations as users scroll
- **Dark Theme**: Forced dark mode aesthetic
- **Responsive Design**: Mobile-first layout with collapsible navbar

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Email**: Resend (via Supabase Edge Function)

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx              # Responsive navigation bar
│   ├── NewsletterSignup.tsx    # Email subscription form
│   ├── ScrollReveal.tsx        # Scroll-triggered animations
│   ├── ErrorBoundary.tsx       # React error boundary
│   └── ui/                    # shadcn/ui components
├── pages/
│   ├── Home.tsx               # Main landing page
│   └── Contact.tsx            # Contact form page
├── integrations/
│   └── supabase/              # Supabase client & types
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── main.tsx                   # App entry point

supabase/
├── functions/
│   └── send-contact-email/    # Edge function for contact form emails
└── migrations/                # Database migrations
```

## 📋 Pages & Routes

| Route      | Page    | Description                          |
|------------|---------|--------------------------------------|
| `/`        | Home    | Full landing page with all sections  |
| `/contact` | Contact | Contact form with email delivery     |
| `/*`       | Home    | Catch-all fallback                   |

## 🏗️ Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

## 📦 Build

```bash
npm run build
```

## 🔒 Security

- Newsletter subscriber emails are protected by RLS — no public SELECT access
- Duplicate email checks use a `SECURITY DEFINER` RPC (`check_newsletter_email`)
- Contact form Edge Function includes rate limiting, input validation, and HTML escaping
- Database extensions moved to a separate `extensions` schema

## 📄 License

Proprietary — StarStore Ambassador Program.
