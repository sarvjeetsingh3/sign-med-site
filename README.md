# 🧠 SignMed Learn

> **A futuristic full-stack educational platform combining sign language training with medical knowledge.**

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📌 Overview

SignMed Learn is an educational web app that teaches **ASL, BSL, and ISL sign language** through gamified modules, while also providing a comprehensive **medical reference database** covering allergies, medications, first aid, and emergency procedures.

Built with a cyberpunk-inspired UI, it features an AI-powered medical chatbot, symptom/disease checkers, an e-commerce first aid kit, and a full admin control panel.

---

## ✨ Features

### 🎮 Sign Language Game
- 4 game modes with lives, XP, streaks and multipliers
- Supports ASL, BSL, ISL and Universal signs
- Leaderboard with per-language filtering

### 🏥 Medical Modules
- **Allergy Database** — 18 entries with symptom checker
- **Medication Database** — 18 drugs with disease checker
- **First Aid Kit** — e-commerce cart with Razorpay checkout
- **Emergency Procedures** — 6 protocols with SOS button

### 🤖 AI MEDI Chatbot
- Powered by **Groq API** (llama-3.3-70b-versatile)
- Specialises in allergies, medications, sign language, first aid
- Floating popup + dedicated section

### 🛡️ Admin Panel
- Accessible at `/admin` — admin login only
- Stats dashboard — users, scores, XP, banned accounts
- User management — ban/unban, promote/demote, delete
- Recent scores viewer

### 👤 Auth System
- JWT-based register/login
- Role-based access (user / admin)
- Rate limiting, input validation middleware

---

## 🗂️ Project Structure

```
signmed/
├── frontend/
│   └── health-sign-learn.html     # Main single-file frontend
├── admin/
│   └── index.html                 # Admin dashboard
└── backend/
    ├── server.js                  # Main server (port 5000)
    ├── .env                       # Environment variables (gitignored)
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── middleware/
    │   ├── auth.js
    │   ├── validate.js
    │   └── rateLimit.js
    ├── models/
    │   ├── User.js
    │   └── Score.js
    ├── routes/
    │   ├── auth.js
    │   ├── scores.js
    │   ├── leaderboard.js
    │   ├── admin.js
    │   └── ai.js
    └── tests/
        ├── auth.test.js
        ├── scores.test.js
        └── leaderboard.test.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Installation

```bash
# Clone the repo
git clone https://github.com/sarvjeetsingh3/sign-med-site.git
cd sign-med-site/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your values
```

### Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/signmed
JWT_SECRET=your_jwt_secret_here
ADMIN_SECRET=your_admin_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

> Get a free Groq API key at [console.groq.com](https://console.groq.com)

### Run the App

```bash
# Development
npm run dev

# Production
npm start
```

- **Main site** → `http://localhost:5000`
- **Admin panel** → `http://localhost:5000/admin`

### Run Tests

```bash
npm test
```

31 tests across auth, scores, and leaderboard routes.

---

## 🔐 Admin Access

To create the first admin account, run:

```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash('YourPassword', 12);
  await User.create({
    username: 'admin',
    email: 'admin@yourdomain.com',
    password: hashed,
    role: 'admin'
  });
  console.log('Admin created!');
  mongoose.disconnect();
});
"
```

Once logged in, you can promote any registered user to admin directly from the dashboard.

---

## 🛒 E-Commerce / Payments

The First Aid Kit section uses **Razorpay** for checkout. Replace the test key in `health-sign-learn.html`:

```js
const rzp = new Razorpay({ key: 'rzp_test_YourKeyHere', ... });
```

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/scores` | Save game score |
| GET | `/api/scores/me` | Get user scores |
| GET | `/api/scores/stats` | Get score stats |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/leaderboard/:lang` | Language leaderboard |
| POST | `/api/ai/chat` | AI chatbot |
| GET | `/api/admin/stats` | Admin stats |
| GET | `/api/admin/users` | List users |
| DELETE | `/api/admin/users/:id` | Delete user |
| PATCH | `/api/admin/users/:id/ban` | Ban/unban user |
| PATCH | `/api/admin/users/:id/promote` | Promote to admin |
| PATCH | `/api/admin/users/:id/demote` | Demote to user |
| GET | `/api/admin/scores` | All scores |

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| AI | Groq API (llama-3.3-70b) |
| Payments | Razorpay |
| Testing | Jest, Supertest |
| Fonts | Orbitron, Share Tech Mono, Rajdhani |

---

## 📄 License

MIT © 2026 SignMed Learn