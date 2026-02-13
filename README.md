# 🐍 Snake Word Game

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

A creative web application combining the classic Snake game with English word learning. Players control the snake to eat the correct letters to spell out target words, making learning fun.

## 🎮 Gameplay

### Core Mechanics
- **Guess the Word**: Each game provides a hint and some revealed letters of the target English word.
- **Eat Letters**: Control the snake on the grid to find and eat the **correct letters** that fill in the blanks.
- **Avoid Danger**:
  - Avoid hitting walls.
  - Avoid hitting the snake's body.
  - Avoid eating **wrong letters** (deducts health).
- **Health**: Start with 2 health points. Eating a wrong letter deducts 1 point. Game over if health reaches zero.

### Victory & Defeat
- **Victory**: Successfully fill in all letters of the word.
- **Defeat**: Hitting a wall, self-collision, or running out of health.

### ⌨️ Controls
- **Start Game**: Click the "Start Game" button on the interface.
- **Move**: Use keyboard arrow keys `↑` `↓` `←` `→` to control the snake's direction.
- **Pause/Resume**: Press `P` key or click the "Pause" button.

## 🛠️ Tech Stack

This project is built with a modern frontend stack:

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Framer Motion (for smooth interactions)
- **Package Manager**: Bun

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have [Bun](https://bun.sh/) or Node.js installed in your local environment.

### 2. Install Dependencies
```bash
bun install
# or
npm install
```

### 3. Start Development Server
```bash
bun run dev
# or
npm run dev
```
After starting, visit [http://localhost:3000](http://localhost:3000) to start playing.

### 4. Build for Production
```bash
bun run build
# or
npm run build
```

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Core game logic and UI
│   └── layout.tsx       # Global layout
├── components/          # React components
│   └── ui/              # shadcn/ui generic components
└── lib/                 # Utility functions
```

## 📝 To-Do / Future Plans

- [ ] Add more word libraries
- [ ] Add difficulty levels (speed changes, word length)
- [ ] Local storage for high scores
- [ ] Mobile touch control support
- [ ] Online leaderboard (using Prisma + Database)

## 📄 License

MIT License
