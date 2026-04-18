import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RequireAdmin } from './components/routing/Guards';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AchievementsPage from './pages/AchievementsPage';
import AssessmentPage from './pages/AssessmentPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import LandingPage from './pages/LandingPage';
import LearningPage from './pages/LearningPage';
import PathwaysPage from './pages/PathwaysPage';
import ProgressPage from './pages/ProgressPage';
import QuestionnairePage from './pages/QuestionnairePage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/learn/:topicId" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/pathways" element={<ProtectedRoute><PathwaysPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/assessment/:type" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />

            <Route path="/preview/dashboard" element={<DashboardPage />} />
            <Route path="/preview/questionnaire" element={<QuestionnairePage />} />
            <Route path="/preview/learning" element={<LearningPage />} />
            <Route path="/preview/assessment" element={<AssessmentPage />} />
            <Route path="/preview/assessment/:type" element={<AssessmentPage />} />
            <Route path="/preview/progress" element={<ProgressPage />} />
            <Route path="/preview/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
            <Route path="/preview/explore" element={<ExplorePage />} />
            <Route path="/preview/pathways" element={<PathwaysPage />} />
            <Route path="/preview/achievements" element={<AchievementsPage />} />
            <Route path="/preview/settings" element={<SettingsPage />} />
        </Routes>
    );
}
