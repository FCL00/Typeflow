# Typeflow

A minimalist, typing speed test application built to help users improve their typing speed, accuracy, and consistency. Featuring a distraction-free interface, customizable themes, real-time typing statistics, and a keyboard-focused experience.

<p align="center">
  <img src="./public/typeflow.png" alt="typeflow preview"></img>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-2026?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=20232A&color=20232A" alt="React"></img>
  <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript"></img>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwindcss"></img>
</p>

## Features

- **Typing Speed Test** — Measure your typing speed in words per minute (WPM).
- **Real-Time Statistics** — Track typing speed, accuracy, and other performance metrics during a test.
- **Multiple Test Modes** — Configure time-based, word-count, and quote-based typing tests.
- **Interactive Typing Interface** — Track correct and incorrect characters with a visible typing cursor.
- **Customizable Themes** — Switch between multiple themes, including Serika Dark, Carbon, Nord, Dracula, Matrix, Taro, Midnight, and Paper Light.
- **Typing Preferences** — Customize the typing experience through available settings.
- **Results Summary** — Review your performance after completing a typing test.
- **Responsive Design** — Designed to work across desktop, tablet, and mobile screens.
- **Minimalist UI** — A clean, distraction-free interface.

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — A version compatible with your project dependencies.
- npm, or another package manager supported by your project.
- Git.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

**2. Navigate to the project directory**

```bash
cd YOUR_REPOSITORY
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally, if supported by your project scripts:

```bash
npm run preview
```

## Project Structure

The following is an example structure based on the application's described architecture. Adjust it to match the actual repository.

```text
project-root/
├── public/
│   └── images/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TypingArea.tsx
│   │   ├── LiveStatistics.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── SettingsPanel.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Theme System

Typeflow uses a centralized theme configuration to manage the application's color palette.

Each theme defines the following color values:

| Property | Purpose |
|---|---|
| `bg` | Main background color |
| `main` | Primary accent color |
| `caret` | Typing cursor color |
| `sub` | Secondary text and muted elements |
| `subAlt` | Secondary surface color |
| `text` | Primary text color |
| `error` | Typing error color |
| `errorExtra` | Additional error styling |

Theme colors are applied through CSS custom properties, allowing the interface to update when the active theme changes.

## Typing Statistics

The application uses the conventional typing-test definition of words per minute:

```
text{WPM}=\frac{\text{Characters Typed}}{5\times\text{Elapsed Time in Minutes}}
```

Accuracy and error penalties depend on the scoring rules implemented by the typing engine. Raw WPM, net WPM, and accuracy should be calculated and presented consistently.

## Available Scripts

Common scripts may include:

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run linting, if configured |
| `npm run test` | Run tests, if configured |

The available scripts depend on your `package.json`.

## Roadmap

Potential improvements for future versions:

- [ ] Expanded language and word-list support.
- [ ] More customizable typing tests.
- [ ] Detailed typing performance analytics.
- [ ] Personal bests and historical performance tracking.
- [ ] User accounts and cloud-synced statistics.
- [ ] Online leaderboards.
- [ ] Multiplayer typing races.
- [ ] Additional themes and personalization options.

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing your changes.
