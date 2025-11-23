# 💳 RCBC Debt Tracker

A **mobile-first Progressive Web App (PWA)** for tracking and managing RCBC credit card debt repayment. Built with React, TypeScript, Firebase, and Tailwind CSS.

### 🎨 Design Philosophy
Featuring a **Match Aesthetic** design language with a sophisticated **Sage Green & Navy Blue** color palette inspired by "Black Panther". The UI provides a premium, cohesive experience across light and dark modes with:
- Custom transparent logo integrated via Firebase Storage
- Smooth animations and micro-interactions
- Modern glassmorphism effects
- Consistent spacing and typography scale

## ✨ Features

### 📊 Debt Dashboard
- **Real-time Debt Tracking**: Display current debt balance with large, readable typography
- **Minimum Payment Calculator**: Automatic calculation of required minimum payments (5% of balance or ₱500)
- **Payment Logging**: Easy-to-use numeric pad optimized input for recording payments
- **Interest vs Principal Split**: See exactly how much of your payment goes to interest vs principal reduction
- **Recent Activity Feed**: Track your payment history with detailed breakdowns

### 📈 Payment Simulator
- **Repayment Timeline**: Calculate how long it will take to pay off your debt
- **Total Interest Projection**: See the total interest you'll pay over the life of the debt
- **Month-by-Month Schedule**: Detailed payment schedule showing balance reduction over time
- **Quick Amount Presets**: Test different payment scenarios with one tap

### 📋 Payment History
- Full transaction history (Coming Soon)
- Charts and analytics (Coming Soon)

### ✏️ Manual Adjustments
- Bottom-sheet drawer for easy debt principal adjustments
- Add notes for corrections or lump-sum payments

## 🧮 RCBC Credit Card Interest Calculation

This app uses the **RCBC-specific finance charge formula**:
- **Monthly Interest Rate**: 3.5% (42% APR) - typical for Philippine credit cards
- **Minimum Payment**: 5% of outstanding balance or ₱500, whichever is higher
- **Interest Method**: Average Daily Balance (simplified monthly calculation for tracking)

### Formula
```
Monthly Interest = Principal × 3.5%
Principal Payment = Total Payment - Interest
New Balance = Principal - Principal Payment
```

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7.2.4 (Fast, modern bundler with HMR)
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Routing**: React Router DOM
- **Backend**: 
  - Firebase Authentication (secure user sessions)
  - Cloud Firestore (real-time data sync)
  - Firebase Storage (logo and asset hosting)
  - Firebase Data Connect (GraphQL API)
- **Deployment**: Vercel with environment variable encryption
- **PWA**: Progressive Web App with offline support
- **State Management**: React Context API (ThemeContext)

## 📱 Mobile-First Design

- **Touch-Optimized**: Large touch targets, swipe gestures
- **Bottom Navigation**: Thumb-friendly navigation bar
- **Numeric Input**: `inputMode="decimal"` for native number keyboards
- **Safe Areas**: Respects device notches and rounded corners
- **Responsive**: Works perfectly on all screen sizes

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Vercel CLI (for deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Deign86/rcbc-debt-tracker.git
cd rcbc-debt-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
- Copy `.env.example` to `.env`
```bash
cp .env.example .env
```
- Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Set up Firebase**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable the following services:
  - **Authentication** (Email/Password provider)
  - **Cloud Firestore** (Database)
  - **Firebase Storage** (For logos and assets)
  - **Firebase Data Connect** (Optional, for GraphQL API)
- Configure Storage Rules (set to test mode for development)
- Copy your Firebase config values to `.env`

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production
```bash
npm run build
```

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Link your project**
```bash
vercel link
```

3. **Add environment variables to Vercel**
```bash
# Add each Firebase config variable
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

4. **Deploy**
```bash
vercel --prod
```

**Security Note**: All sensitive Firebase credentials are stored as encrypted environment variables. Never commit `.env` files or expose API keys in your codebase.

## 📂 Project Structure

```
rcbc-debt-tracker/
├── src/
│   ├── components/              # React components
│   │   ├── Layout.tsx           # Main layout with bottom nav
│   │   ├── DebtCard.tsx         # Debt display card
│   │   ├── PaymentForm.tsx      # Payment input form
│   │   ├── EditDebtSheet.tsx    # Bottom sheet for debt editing
│   │   ├── EditMinPaymentSheet.tsx # Min payment editor
│   │   ├── ResetModal.tsx       # Reset confirmation modal
│   │   └── SuccessModal.tsx     # Payment success feedback
│   ├── pages/                   # Route pages
│   │   ├── Dashboard.tsx        # Main dashboard with logo
│   │   ├── Simulator.tsx        # Payment simulator
│   │   └── History.tsx          # Payment history
│   ├── hooks/                   # Custom React hooks
│   │   └── useDebtCalculator.ts # RCBC calculation logic
│   ├── contexts/                # React Context providers
│   │   └── ThemeContext.tsx     # Theme management (light/dark)
│   ├── services/                # Firebase services
│   │   ├── firestoreService.ts  # Firestore operations
│   │   └── initializeFirestore.ts # Firestore initialization
│   ├── types/                   # TypeScript definitions
│   │   └── debt.ts              # Debt-related interfaces
│   ├── config/                  # Configuration
│   │   ├── firebase.ts          # Firebase initialization (env vars)
│   │   └── billingConstants.ts  # RCBC billing config
│   ├── dataconnect-generated/   # Firebase Data Connect SDK
│   └── App.tsx                  # Main app component
├── dataconnect/                 # GraphQL schema & queries
│   ├── dataconnect.yaml
│   ├── schema/schema.gql
│   └── example/
│       ├── queries.gql
│       └── mutations.gql
├── scripts/
│   └── upload-logos.cjs         # Firebase Storage upload script
├── public/
│   ├── manifest.json            # PWA manifest
│   └── assets/
│       └── logo-final.png       # Transparent logo source
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore (includes .env files)
├── firebase.json                # Firebase config
├── storage.rules                # Firebase Storage security rules
└── package.json
```

## 🔐 Security & Privacy

- **Environment Variables**: All Firebase credentials stored in `.env` files (gitignored)
- **Zero Secrets in Code**: Complete removal of API keys from codebase and git history
- **Vercel Encryption**: Production secrets encrypted in Vercel environment
- **Firebase Authentication**: Secure user sessions with token-based auth
- **Storage Security**: Firebase Storage rules configured for controlled access
- **HTTPS-Only**: All production traffic over secure connections
- **Client-Side Calculations**: Financial calculations performed locally
- **No Data Sharing**: User financial data never shared with third parties

### Security Measures Implemented:
1. Migrated all secrets to environment variables with `VITE_` prefix
2. Cleaned entire git history using `git-filter-repo` to remove exposed credentials
3. Added `.env`, `.env.local`, `.env.production` to `.gitignore`
4. Created `.env.example` template for secure onboarding
5. Configured Vercel CLI for encrypted environment variable management

## 📊 Roadmap

### ✅ Completed
- [x] Dark mode with theme toggle
- [x] Firebase Authentication integration
- [x] Cloud Firestore for data persistence
- [x] Firebase Storage for logo and assets
- [x] Custom transparent logo with Match aesthetic
- [x] Environment variable security implementation
- [x] Git history cleaned of sensitive data
- [x] Vercel deployment with encrypted secrets
- [x] Firebase Data Connect GraphQL API setup
- [x] Mobile-first responsive design
- [x] RCBC-specific interest calculations

### 🚧 In Progress
- [ ] Payment history visualizations and charts
- [ ] Export payment history (PDF, CSV)
- [ ] Offline support with service worker

### 📅 Planned Features
- [ ] Multiple credit card support
- [ ] Push notifications for payment reminders
- [ ] Budget forecasting and recommendations
- [ ] Debt-free celebration animations
- [ ] Payment streak tracking
- [ ] Custom payment goals

## 🎨 Design System

### Color Palette
- **Primary (Sage Green)**: 
  - Light: `#9fafa3` 
  - Dark: `#7a8a7e`
- **Secondary (Navy Blue)**: 
  - Light: `#2c3e50`
  - Dark: `#1a252f`
- **Accent**: Match-inspired complementary tones
- **Surface**: Dynamic light/dark mode backgrounds

### Typography
- **Headings**: System font stack optimized for readability
- **Body**: Inter, system-ui fallback
- **Numeric**: Tabular figures for financial data

### Components
- **Cards**: Elevated surfaces with subtle shadows
- **Buttons**: Consistent touch targets (minimum 44px height)
- **Bottom Sheets**: Native-feeling drawer interactions
- **Modals**: Centered overlays with backdrop blur

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Never commit secrets** - Use environment variables
4. **Follow the existing code style** - TypeScript + functional components
5. **Test thoroughly** - Ensure mobile responsiveness
6. **Submit a Pull Request**

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Maintain mobile-first responsive design
- Keep Firebase security rules updated
- Document new features in README

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built for managing RCBC credit card debt in the Philippines
- Inspired by the need for transparent debt tracking
- RCBC interest calculation based on typical Philippine credit card terms

## 📧 Contact

- GitHub: [@Deign86](https://github.com/Deign86)
- Project Link: [https://github.com/Deign86/rcbc-debt-tracker](https://github.com/Deign86/rcbc-debt-tracker)
- Live Demo: [https://rcbc-debt-tracker-hephfu9wj-deign86s-projects.vercel.app](https://rcbc-debt-tracker-hephfu9wj-deign86s-projects.vercel.app)

---

**Note**: This is an independent project and is not officially affiliated with RCBC (Rizal Commercial Banking Corporation).
