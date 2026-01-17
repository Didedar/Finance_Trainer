# Finance Trainer - Gamified Financial Literacy Platform

A full-stack web application for learning financial literacy through gamified lessons with AI-generated content.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Google Gemini AI** - AI-powered lesson content generation
- **JWT** - Secure authentication

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```env
DATABASE_URL=sqlite:///./finance_trainer.db
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:5173
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment on Render

This project includes a `render.yaml` blueprint for easy deployment:

1. Fork this repository
2. Connect to Render
3. Use the Blueprint feature and select `render.yaml`
4. Set environment variables:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SECRET_KEY` - Will be auto-generated

### Manual Deployment

**Backend (Web Service):**
- Build: `cd backend && pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend (Static Site):**
- Build: `cd frontend && npm install && npm run build`
- Publish: `frontend/dist`

## 📚 Features

- 🎮 Gamified learning with XP and titles
- 🤖 AI-generated lesson content
- 📊 Progress tracking with streaks
- 🏆 5 difficulty levels (Beginner → Master)
- ✅ Quizzes and flashcards
- 🔒 JWT authentication

## 📄 License

MIT License
