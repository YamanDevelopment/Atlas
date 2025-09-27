# OppTrack Frontend

A Nuxt 3 application for discovering and managing campus opportunities.

## Features

- **Landing Page**: Clean introduction to OppTrack
- **Authentication**: Login/signup flows
- **Onboarding**: 4-step guided setup (Major, Interests, Current Involvement, Time Budget)
- **Dashboard**: Personalized starter plan, commitments tracking, and upcoming events
- **Explore**: Netflix-style discovery with carousels for clubs, events, and professors
- **Profile**: Settings for updating interests, preferences, and time budget

## Tech Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety
- **Architecture**: Repository pattern with mock data

## Project Structure

```
src/frontend/
├── app/
│   ├── app.vue               # Root component
│   └── assets/css/
│       └── main.css          # Tailwind imports + custom styles
├── components/
│   ├── ClubCard.vue          # Reusable club card component
│   └── EventCard.vue         # Reusable event card component
├── composables/
│   └── index.ts              # Vue composables for API calls
├── layouts/
│   └── default.vue           # Default layout
├── mock/
│   └── seed.ts               # Mock data for demo
├── pages/
│   ├── index.vue             # Landing page
│   ├── login.vue             # Login page
│   ├── signup.vue            # Signup page
│   ├── onboarding.vue        # 4-step onboarding flow
│   ├── dashboard.vue         # Main dashboard
│   ├── explore.vue           # Discovery page
│   └── profile.vue           # Settings page
├── repositories/
│   └── index.ts              # Mock API repositories
├── types/
│   └── index.ts              # TypeScript type definitions
├── nuxt.config.ts            # Nuxt configuration
├── package.json              # Dependencies
└── tailwind.config.ts        # Tailwind configuration
```

## Key Design Patterns

### Repository Pattern
All data access goes through repository classes that return Promises. Easy to swap mock data for real API calls:

```typescript
// TODO: integrate real API markers show where to replace
const authRepo = new AuthRepository();
const response = await authRepo.login(email, password); // Mock implementation
```

### Centralized Mock Data
All fake data lives in `mock/seed.ts` to make it easy to replace with real APIs later.

### TypeScript First
Comprehensive type definitions in `types/index.ts` ensure type safety across the entire application.

### Vue 3 Composition API
Modern Vue patterns with `<script setup>` and composables for reusable logic.

## Setup & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Demo Features

- **Auto-login**: Any credentials work on login page
- **Sample Data**: Rich mock data showcasing all features
- **Working Flows**: Complete user journeys from signup to dashboard
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Realistic API delay simulation

## Next Steps for Real Implementation

1. Replace mock repositories with real API calls
2. Add authentication state management (Pinia)
3. Implement real-time notifications
4. Add more detailed opportunity/event pages
5. Integrate with campus APIs for live data
6. Add search and filtering functionality
7. Implement user preferences and recommendations engine

## Architecture Notes

The app is built with hackathon speed in mind but maintains production-quality patterns:

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Scalable Structure**: Easy to add new pages, components, and features
- **Type Safety**: Prevents runtime errors and improves developer experience
- **Mock-First**: Demo-ready but prepared for real API integration

Every `// TODO: integrate real API` comment marks where mock data should be replaced with actual backend calls.