# EcoVision — See Beyond Plastic

EcoVision is a React + Vite sustainability product-identification game with a futuristic React Three Fiber environment. Identify blurred eco products, learn why each product matters, and compete locally or on the global leaderboard.

## Highlights

- 32 product-specific entries across reusable, biodegradable, plastic-alternative, zero-waste, packaging, and household categories.
- Each product owns a stable built-in illustration in the dataset; the game never uses random search images or unrelated placeholders.
- Solo mode: 5 unique, randomized questions.
- Multi-participant mode: 10 unique questions, turn-based play on one device, separate scoring, and a final local ranking.
- Four randomized choices per question, retry-on-wrong, progressive 20px → 0px blur reveal, timer, speed bonus, combo bonus, progress, confetti, results, profile stats, and leaderboard.

## Run locally

Use two terminals from this project folder.

```bash
cd backend
npm install
npm run dev
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs at `http://localhost:5000`; with no MongoDB configuration it automatically uses `backend/data/db.json`.

To check a production bundle:

```bash
cd frontend
npm run build
```

## How to play

1. Register with your name, username, email, and age group.
2. Pick Single Participant (5 questions) or Multiple Participants (10 shared questions), then add local players if needed.
3. Use clues and the blurred product illustration to choose an answer. Correct answers reveal the product and explanation; wrong answers cost 10 points and can be retried.
4. View your performance or the participant ranking when the session ends.

## Stack

React 18, Vite, Tailwind CSS, Zustand, React Router, Three.js / React Three Fiber, canvas-confetti, Node.js, Express, and optional MongoDB.
