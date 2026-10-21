# Face2BrandAI – Google Cloud Community Day 2025 New Delhi Submission

## Project Description
Face2BrandAI is a web app that writes a personal brand kit from your answers to a short form. It uses an OpenRouter model (Mixtral 8x7B Instruct) for the text. The manual form can also send a selfie to Google Cloud Vision through a small Express proxy and add the face analysis to the prompt.

## Live Demo
[https://face2brandai.vercel.app](https://face2brandai.vercel.app)

## Testing
- E2E: `npm run e2e` (one Playwright test). Set `E2E_EMAIL` and `E2E_PASSWORD` to a Clerk test account first.
- There are no unit tests yet.

## Notes
- See `.env.example` for the environment variables. Real keys go in your own `.env`, which is not committed.
