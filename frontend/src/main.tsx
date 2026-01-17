import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Context
import { AuthProvider } from './context/AuthContext'

// Layouts
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { DashboardLayout } from './components/layout/DashboardLayout'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import { DashboardPage } from './pages/DashboardPage'
import { LecturesPage } from './pages/LecturesPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { LessonPage } from './pages/LessonPage'

const MainLayout = ({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) => (
  <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
    <Header />
    <main className="flex-grow flex flex-col pt-[80px]"> {/* Add padding for fixed header */}
      {children}
    </main>
    {showFooter && <Footer />}
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />

          {/* Auth Routes - No Footer */}
          <Route path="/login" element={<MainLayout showFooter={false}><LoginPage /></MainLayout>} />
          <Route path="/signup" element={<MainLayout showFooter={false}><SignupPage /></MainLayout>} />

          {/* Protected Routes */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="lectures" element={<LecturesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="lessons/:id" element={<LessonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

