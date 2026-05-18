import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import PredictionsPage from './pages/PredictionsPage'
import RankingPage from './pages/RankingPage'
import ResultsPage from './pages/ResultsPage'

export default function CupModule() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="ranking" element={<RankingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cup" replace />} />
    </Routes>
  )
}
