<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
# Project Instructions

## Project Overview
HOMEGROUND is a Next.js application for managing local cricket matches, series, and tournaments. It features a mobile-first design for live scoring.

## key Features
- **Single Match**: Quick setup for one-off games.
- **Series**: Best-of-X series tracking.
- **Tournament Mode**: League table management, NRR calculations, and multi-team setup.
- **Live Scorer**: Ball-by-ball tracking with undo, extras, and Free Hit logic.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Context API (AppContext)
- **Icons**: Lucide React

## Conventions
- Use `useApp` hook for accessing global state.
- Components should be responsive and touch-friendly.
- Ensure all "Overs" are calculated correctly (6 balls per over).

