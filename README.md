# StarStore Ambassador Dashboard

A modern, feature-rich ambassador dashboard for the StarStore Telegram bot ecosystem. This application enables ambassadors to track referrals, manage their performance, and earn commissions through the StarStore platform.

## 🌟 Features

- **Referral Tracking**: Track and manage referrals from the StarStore Telegram bot
- **Real-time Statistics**: View live updates on referral performance and earnings
- **Tier System**: Progress through ambassador tiers (Explorer → Pioneer → Trailblazer → Legend)
- **Performance Analytics**: Comprehensive analytics dashboard with charts and insights
- **Telegram Integration**: Seamless connection with StarStore's main Telegram bot
- **Commission Management**: Track earnings and payout history
- **Admin Dashboard**: Full administrative controls for managing ambassadors

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Data Source**: StarStore MongoDB (via API integration)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Access to StarStore main server API

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd amb-starstore-site
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## 🏗️ Project Structure

```
src/
├── components/         # React components
│   ├── dashboard/     # Dashboard-specific components
│   ├── ui/           # Reusable UI components (shadcn)
│   └── theme/        # Theme components
├── contexts/          # React contexts (Auth, Theme)
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API services
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── integrations/     # External integrations (Supabase)
```

## 🔑 Key Components

### Authentication Flow
- Ambassadors sign up and complete onboarding
- Telegram account connection required for referral tracking
- Admin approval process for new ambassadors

### Referral System
- Each ambassador gets a unique referral code
- Referrals tracked via StarStore Telegram bot
- Activation threshold: 100 stars
- Real-time sync with main StarStore server

### Tier Progression
- **Explorer**: Entry level (0+ referrals)
- **Pioneer**: Growing ambassador (10+ referrals)
- **Trailblazer**: Advanced ambassador (50+ referrals)
- **Legend**: Elite status (100+ referrals)

## 📚 Documentation

Additional documentation available in the `/docs` directory:
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `TELEGRAM_INTEGRATION_GUIDE.md` - Telegram bot integration
- `STARSTORE_INTEGRATION_GUIDE.md` - StarStore API integration
- `EMAIL_SETUP_GUIDE.md` - Email configuration
- `AMBASSADOR_ACTIVATION_FLOW.md` - Activation workflow

## 🔧 Configuration

### Telegram Bot Configuration
Update `src/config/telegram.ts` with your bot details:
```typescript
export const TELEGRAM_CONFIG = {
  BOT_USERNAME: 'YourBot_bot',
  SERVER_URL: 'https://your-starstore-api.com',
  // ...
};
```

### Supabase Setup
1. Create a new Supabase project
2. Run migrations from `supabase/migrations/`
3. Deploy edge functions from `supabase/functions/`
4. Configure environment variables

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚢 Deployment

The application is configured for deployment on:
- **Vercel** (recommended)
- **Netlify**
- Any static hosting service

Deploy configuration is in `vercel.json`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for StarStore Ambassador program.

## 🆘 Support

For support and questions:
- Contact StarStore admin team
- Check documentation in `/docs`
- Review issue tracker

## 🙏 Acknowledgments

- Built for the StarStore Telegram bot ecosystem
- Powered by Supabase and React
- UI components by shadcn/ui
