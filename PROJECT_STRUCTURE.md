# Project Structure

```
gsap-editor/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Button.tsx
│   │   └── index.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useGSAPAnimation.ts
│   │   └── index.ts
│   ├── styles/           # CSS files
│   │   └── App.css
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── index.ts
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles & design system
├── public/               # Static files
├── .gitignore
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md

## Directory Descriptions

### `/src/components`
Contains all reusable React components. Each component should have its own file and be exported through `index.ts`.

### `/src/hooks`
Custom React hooks for shared logic across components. Currently includes `useGSAPAnimation` for GSAP animations.

### `/src/styles`
CSS modules and component-specific styles. Global design system is in `index.css`.

### `/src/types`
TypeScript type definitions and interfaces used throughout the application.

### `/src/utils`
Utility functions and helper methods that are used across the application.

### `/src/assets`
Static assets like images, SVGs, fonts, etc.

## Design System

The project uses a comprehensive design system defined in `src/index.css`:

- **Colors**: Primary (blue), accent (pink, purple, green), and grayscale
- **Typography**: Inter font with predefined heading and text classes
- **Spacing**: 8px grid system (--space-1 through --space-24)
- **Border Radius**: Small, medium, large, and full options

## Key Dependencies

- **GSAP**: Animation library
- **XState**: State management
- **ReactFlow**: Node-based UI
- **Supabase**: Backend services
- **React Router**: Client-side routing

