# Changelog

## [2025-06-19] Batch 1: Codebase Structure, Error Handling, and Accessibility

### ErrorBoundary
- Added `src/features/common/ErrorBoundary.tsx`: Reusable error boundary with fallback UI and retry button.

### Feature-Based Folder Structure
- Moved brandkit-related files to `src/features/brandkit/`
- Moved auth-related files to `src/features/auth/`
- Moved common/shared files to `src/features/common/`
- Moved Terms page to `src/features/terms/`
- Updated all imports to match new structure.

### Lazy Loading
- Updated `App.tsx` to use `React.lazy` and `Suspense` for heavy page components.
- Added branded loading fallback for Suspense.

### Image Optimization
- Added `loading="lazy"` to all non-critical images for performance.

### Error Messages
- Improved error messages in all API error handling (Vision API, OpenRouter, Supabase) to be contextual and developer-friendly.
- Added `console.error` logs for all API errors.

### Demo Code
- Marked all mock/demo fallback code with `// DEMO ONLY: fallback for dev/testing` comments.

### Accessibility
- Added missing ARIA roles and attributes to interactive components (buttons, dialogs, inputs).

### Comments & Documentation
- Added inline comments for LLM response parsing and custom hooks with side effects.

### Environment Variables
- Created/updated `.env.example` with all required variables and descriptions. 