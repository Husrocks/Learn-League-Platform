# LearnLeague Platform 🏆

A modern, gamified learning platform designed for small groups (like 3 friends) to track daily study hours, assign tasks, and maintain consistency through friendly competition.

## 🚀 Features

- **Gamified Dashboard:** Track XP, study streaks, and weekly hours.
- **Task Management:** Assign and review tasks for each other.
- **Leaderboards:** Real-time ranking based on XP and consistency.
- **AI-Powered Testing:** Generate interview questions and evaluate answers via Groq.
- **Dark Mode UI:** Sleek, modern, and accessible design (glassmorphism UI).

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management:** Zustand
- **Hosting:** Vercel

### Backend (See Backend Repo/Service)
- **Framework:** FastAPI (Python)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Hugging Face Spaces (Docker/Gradio)
- **AI Integration:** Groq API (LLaMA 3)

## 💻 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Husrocks/Learn-League-Platform.git
   cd Learn-League-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000 # Replace with your live backend URL for production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the app.

## 📦 Deployment (Vercel)

This frontend is configured to be deployed easily on Vercel. 
Simply import this repository into Vercel, and ensure you add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed FastAPI backend.
