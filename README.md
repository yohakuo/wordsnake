# 🐍 Snake Word Game

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Players control a snake to eat the correct letters to spell out target words.

## 🎮 Gameplay

### Core Mechanics
- **Guess the Word**: Each game provides a hint and some revealed letters of a target English word.
- **Eat Letters**: Control the snake on the grid to find and eat the **correct letters** to fill in the blanks.
- **Combo System**: Eat correct letters consecutively and quickly to earn bonus points!
- **Smart Review**: The system automatically records words you spell wrong and prioritizes them in future games to help you learn.
- **Avoid Danger**:
  - Avoid hitting walls.
  - Avoid hitting the snake's body.
  - Avoid eating **wrong letters** (deducts health).
- **Health**: Start with 2 health points. Eating a wrong letter deducts 1 point. Game over if health reaches zero.
- **Score System**:
  - Points for correct letters. Scores from cleared levels **accumulate**. Automatically records your local **High Score**.

### Victory & Defeat
- **Victory**: Successfully fill in all letters of the word.
- **Defeat**: Hitting a wall, self-collision, or running out of health.

### ⌨️ Controls
- **Desktop**:
  - **Move**: Use keyboard arrow keys `↑` `↓` `←` `→`.
  - **Pause/Resume**: Press `P`.
- **Mobile**:
  - **Touch Control**: Swipe on the screen to control direction.

### ⚙️ Custom Word Library
Click the **Settings** button in the top right to import your own word list for practice.
- Supports **JSON format** and **Text format** (Word + Space + Hint).

---

## 📦 Deployment & Sharing

Want to share the game with friends? Check out the detailed [📖 Deployment & Testing Guide](./deployment_guide.md), which covers three simple methods:
1. **Vercel Deployment** (Recommended)
2. **Local Network Sharing**
3. **Intranet Tunneling**

---

## 🛠️ Tech Stack

This project is built with a modern frontend stack:

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Framer Motion (Particle effects, Screen shake)
- **Audio**: Web Audio API

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
After starting, visit [http://localhost:3000](http://localhost:3000) to start playing.

### 3. Build for Production
```bash
npm run build
```

## � To-Do / Future Plans

- [ ] **Gameplay Optimization**:
  - [ ] Add difficulty levels (speed changes, word length).
  - [ ] Optimize Combo system detection and feedback.
  - [ ] Power-up system (Golden Apple, Time Freeze, Magnet).
- [ ] **System Features**:
  - [ ] Online Leaderboard (using Prisma + Database).
  - [ ] Skin System (Customize snake appearance).
- [ ] **Completed Features**:
  - [x] Mobile Touch Control (Swipe).
  - [x] Sound Effects (Eat, Win, Lose, Combo).
  - [x] Visual Feedback (Particles, Screen Shake).
  - [x] Review Mode (Prioritize wrong words).
  - [x] Local High Score.
  - [x] Custom Word Library Import.

## 📄 License

MIT License
