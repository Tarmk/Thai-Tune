# Project Structure

This document outlines the organization of the ThaiTune frontend project.

## Directory Structure

```
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Common/shared components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components (buttons, inputs, etc.)
│   ├── providers/          # React context providers
│   └── [route folders]/    # Page routes
├── functions/              # Firebase Cloud Functions
├── lib/                    # Utility libraries and functions
├── public/                 # Static assets
│   └── images/             # Image assets
└── styles/                 # Global styles
```

## Key Directories

### Components

- **auth/**: Authentication-related components like `VerificationCodeInput`, `AuthForm` and `protectedroute`
- **common/**: Reusable components like `Logo`, `LoadingSpinner`, and `ErrorBoundary`
- **layout/**: Page layout components like `TopMenu`, `Footer`, `Header`, and `Main`
- **ui/**: UI components like buttons, inputs, modals, etc.

### Providers

Context providers that wrap the application:
- `theme-provider.tsx`: Theme context provider
- `i18n-provider.tsx`: Internationalization provider

### Functions

Firebase Cloud Functions for server-side functionality:
- Email verification
- Two-factor authentication
- User settings

## Best Practices

1. Keep components organized in their respective folders
2. Use proper import paths with aliases
3. Maintain consistency in naming conventions 