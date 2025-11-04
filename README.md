<div align="center">

# 🎬 GSAP GUI Editor

### *A Professional Animation Editor for the Modern Web*

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://gsap.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

*Create stunning, professional-grade animations with an intuitive visual interface powered by GSAP*

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **Modern Design System**
- Custom CSS variables & tokens
- 8px grid-based spacing
- Comprehensive color palette
- Inter font typography system

</td>
<td width="50%">

### ⚡ **Lightning Fast**
- Vite-powered development
- Hot Module Replacement (HMR)
- Optimized production builds
- Sub-second page loads

</td>
</tr>
<tr>
<td width="50%">

### 🎭 **Professional Animations**
- GSAP 3.13 integration
- Timeline-based editing
- Custom animation hooks
- Real-time preview

</td>
<td width="50%">

### 🔄 **State Management**
- XState state machines
- Predictable state flows
- Visual workflow editor
- ReactFlow node system

</td>
</tr>
<tr>
<td width="50%">

### 🌐 **Full-Stack Ready**
- Supabase backend integration
- Authentication support
- Real-time database
- Cloud storage

</td>
<td width="50%">

### 🛣️ **Modern Routing**
- React Router v7
- Client-side navigation
- Nested routes
- Lazy loading support

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/GSAP-GUI.git

# Navigate to the project
cd gsap-editor

# Install dependencies
npm install

# Set up Supabase (optional, but recommended)
# See SUPABASE_QUICKSTART.md for detailed instructions
cp env.template .env
# Then edit .env with your Supabase credentials
```

### Development

```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

### Build for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

### Testing

```bash
# Run integration tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

**Setup for tests:**
1. Copy `env.test.template` to `.env.test`
2. Add your Supabase credentials (including service role key)
3. See `supabase/tests/README.md` for detailed testing documentation

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Animations** | GSAP 3.13 |
| **State Management** | XState 5, @xstate/react |
| **Visual Workflows** | ReactFlow 11 |
| **Backend** | Supabase |
| **Routing** | React Router 7 |
| **Testing** | Vitest |
| **Code Quality** | ESLint, TypeScript Compiler |

</div>

### Core Dependencies

```json
{
  "react": "^19.1.1",
  "gsap": "^3.13.0",
  "xstate": "^5.24.0",
  "@xstate/react": "^6.0.0",
  "reactflow": "^11.11.4",
  "@supabase/supabase-js": "^2.78.0",
  "react-router-dom": "^7.9.5"
}
```

---

## 📁 Project Structure

```
gsap-editor/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Style.css
│   │   └── index.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useGSAPAnimation.ts
│   │   └── index.ts
│   ├── styles/             # Global styles & themes
│   │   └── App.css
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   └── index.ts
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry
│   └── index.css           # Design system tokens
├── public/                 # Static files
├── dist/                   # Production build
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

---

## 🎨 Design System

The project features a comprehensive design system built with CSS custom properties:

### Color Palette

```css
--primary-50 to --primary-900     /* Blue scale */
--accent-pink, --accent-purple    /* Accent colors */
--neutral-0 to --neutral-900      /* Grayscale */
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Heading Classes**: `.heading-1` through `.heading-5`
- **Text Classes**: `.text-xl` through `.text-xs`

### Spacing System

8px grid-based spacing: `--space-1` (8px) through `--space-24` (192px)

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-full`: 9999px

> All design tokens are available in `src/index.css`

---

## 📚 Documentation

### Custom Hooks

#### `useGSAPAnimation`

A custom hook for managing GSAP animations in React:

```typescript
import { useGSAPAnimation } from './hooks';

function MyComponent() {
  const { animate, timeline } = useGSAPAnimation();
  
  // Use GSAP animations with React
}
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔧 Configuration

### Supabase Setup

This project includes Supabase integration for backend functionality. To set it up:

1. **Quick Start:** Follow [SUPABASE_QUICKSTART.md](./SUPABASE_QUICKSTART.md) (5 minutes)
2. **Detailed Guide:** See [MCP_SETUP.md](./MCP_SETUP.md) for full documentation

**TL;DR:**
```bash
# 1. Create .env file from template
cp env.template .env

# 2. Add your Supabase credentials to .env
# 3. Configure MCP in Cursor (see SUPABASE_QUICKSTART.md)
# 4. Restart Cursor
```

### ESLint

For production applications, enable type-aware lint rules:

<details>
<summary>Click to expand ESLint configuration</summary>

```js
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // or tseslint.configs.strictTypeChecked for stricter rules
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

</details>

### React Compiler

The React Compiler is not enabled by default. See [React Compiler Installation](https://react.dev/learn/react-compiler/installation) for setup instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


## 🙏 Acknowledgments

- [GSAP](https://gsap.com/) - Professional animation library
- [React](https://react.dev/) - UI library
- [XState](https://xstate.js.org/) - State management
- [ReactFlow](https://reactflow.dev/) - Node-based UI
- [Supabase](https://supabase.com/) - Backend platform
- [Vite](https://vitejs.dev/) - Build tool

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by the GSAP GUI Team**

</div>
