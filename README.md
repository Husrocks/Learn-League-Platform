<div align="center">
  <h1>🏆 LearnLeague Platform</h1>
  <p>
    <b>Gamified learning for developers. Team up, earn XP, and compete on leaderboards.</b>
  </p>
  <p>
    <a href="https://github.com/Husrocks/Learn-League-Platform/issues"><img alt="Issues" src="https://img.shields.io/github/issues/Husrocks/Learn-League-Platform?style=for-the-badge&color=blue" /></a>
    <a href="https://github.com/Husrocks/Learn-League-Platform/pulls"><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/Husrocks/Learn-League-Platform?style=for-the-badge&color=green" /></a>
    <a href="https://github.com/Husrocks/Learn-League-Platform/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/Husrocks/Learn-League-Platform?style=for-the-badge&color=orange" /></a>
    <a href="https://github.com/Husrocks/Learn-League-Platform/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/Husrocks/Learn-League-Platform?style=for-the-badge&color=purple" /></a>
  </p>
</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Roadmap](#-project-roadmap)
- [Contributing (We need you!)](#-contributing-we-need-you)
- [License](#-license)

---

## 🚀 About the Project

**LearnLeague** is an open-source platform designed to make learning engaging and collaborative. By blending education with gamification, the platform allows users to track their study progress, earn experience points (XP), and tackle challenges alongside their peers in a competitive yet supportive environment.

Powered by modern AI integrations via the Groq API, LearnLeague offers intelligent insights, automatic progress tracking, and interactive feedback loops to accelerate the learning process.

---

## ✨ Key Features

- **🎮 Gamified Progression:** Earn XP and level up by completing learning modules and coding tasks.
- **🧠 AI-Powered Insights:** Fast, intelligent learning assistance powered by the Groq API.
- **🛡️ Secure & Performant:** A lightweight FastAPI Python backend handling global error boundaries, rate-limiting, and robust database migrations.
- **🤝 Guilds & Teams (Coming Soon):** Form alliances, track team progress, and compete on global leaderboards.
- **⚡ Modern Frontend:** A highly responsive React (Next.js) interface with strict TypeScript safety.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) / [Next.js](https://nextjs.org/)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Assumed based on Next.js standards)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Testing:** [Pytest](https://docs.pytest.org/)

### Infrastructure & AI
- **AI Engine:** [Groq API](https://console.groq.com)
- **Architecture:** Asynchronous REST endpoints with global error boundaries.

---

## 🏁 Getting Started

To set up the project locally for development or testing, follow these steps:

### 1. Prerequisites
- **Python 3.10+** and **Node.js 20+** installed on your machine.
- A free [Groq API key](https://console.groq.com) for backend AI features.

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables (add your Groq API key and Secret Key)
cp .env.example .env

# Run migrations and start the server
alembic upgrade head
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd learnleague

# Install dependencies and setup environment
npm install
cp .env.example .env.local

# Start the development server
npm run dev
```

For a comprehensive guide, please refer to our full [Local Setup Documentation](./CONTRIBUTING.md#local-setup).

---

## 🗺️ Project Roadmap

We are constantly improving LearnLeague. Here is a glimpse of what is actively being worked on:

- **v1.0 (Current):** Core testing, async AI integrations, database migrations, and rate-limiting.
- **v1.1 (Next):** GitHub integrations for automatic XP, Team/Guild creation, and weekly digest emails.
- **v2.0 (Future):** Multi-admin workspaces, webhook integrations (Discord/Slack), and a public API.

Check out our full [ROADMAP.md](./ROADMAP.md) for detailed task tracking.

---

## ❤️ Contributing (We need you!)

**LearnLeague is an open-source initiative, and we actively welcome contributions from developers of all skill levels!** 

Whether you're fixing a typo, adding a new test, or building out our upcoming Guilds feature, your help is incredibly valuable.

### How to get involved:
1. **Find an Issue:** Look for issues tagged with [`good-first-issue`](https://github.com/Husrocks/Learn-League-Platform/issues?q=is%3Aissue+is%3Aopen+label%3A%22good-first-issue%22) if you are new to the codebase.
2. **Fork the Repo:** Click the "Fork" button at the top right of this page.
3. **Branch Out:** Create a new branch for your feature (`git checkout -b feat/amazing-feature`).
4. **Commit:** Write clear, concise commit messages.
5. **Test:** Ensure all backend tests pass (`pytest tests/ -v`).
6. **Submit a PR:** Open a Pull Request detailing your changes.

Please read our complete [Contributing Guidelines](./CONTRIBUTING.md) to understand our coding standards (PEP 8 for Python, strict TypeScript for the frontend) and PR process.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  <i>Built with ❤️ by the LearnLeague Community.</i>
</p>
