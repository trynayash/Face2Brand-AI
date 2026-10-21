# Face2BrandAI

![Face2BrandAI Banner](public/Face2BrandAI.png)

Face2BrandAI is a web app by Yash Suthar that writes a personal brand kit for you. You answer a few questions (and can add a selfie), and an AI model returns a brand name, tagline, color palette, font pairing, bio, content ideas and more. It was built as a project for Google Cloud Community Days New Delhi 2025.

## What it does

- **Manual brand kit** (`/custombrandkit`, `src/features/brandkit/Face2Brand.tsx`): a detailed form. The app sends your answers to OpenRouter (model `mistralai/mixtral-8x7b-instruct`) and shows the JSON result as a brand kit. If you add a selfie, it is first sent to Google Cloud Vision through a small Express proxy (`src/lib/server.ts`), and a short summary of the face analysis is added to the prompt.
- **Selfie brand kit** (`/face2brand`, `src/features/brandkit/Dashboard.tsx`): a shorter form behind Clerk sign-in. The selfie is shown on the page, but only your written answers are sent to the model.
- **PDF export** of a brand kit with `@react-pdf/renderer`.
- **Regenerate one section** through the Express proxy (`/api/brandkit/section`).
- **Public kit links and a gallery**. These are saved in your browser's localStorage, so they only work in the same browser.
- **Demo mode**: if the API call fails, the app shows a sample brand kit.

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Auth: Clerk
- AI: OpenRouter (Mixtral 8x7B Instruct), Google Cloud Vision API
- Optional proxy: Express (`src/lib/server.ts` and `src/lib/visionProxy.ts`)
- PDF: `@react-pdf/renderer`
- Tests: one Playwright end-to-end test (`e2e/brandkit-happy-path.spec.ts`)

A Supabase client is set up in `src/integrations/supabase/`, but the app does not use it yet.

## Run it locally

```bash
git clone https://github.com/trynayash/Face2Brand-AI.git
cd Face2Brand-AI
cp .env.example .env
npm install
npm run dev
```

Fill in `.env` with your Clerk publishable key and OpenRouter API key. The app runs on http://localhost:8080.

The Vision proxy is not started by any npm script. To use it, run `src/lib/server.ts` with a TypeScript runner (for example `npx ts-node`), set `GOOGLE_CLOUD_VISION_API_KEY`, and point `VITE_API_BASE_URL` at it.

Note: the OpenRouter key is read on the client (`VITE_OPENROUTER_API_KEY`), so it ends up in the browser bundle.

Production build:

```bash
npm run build
npm run preview
```

End-to-end test (start the dev server first):

```bash
npm run e2e
```

## License

MIT. See [LICENSE](LICENSE).
