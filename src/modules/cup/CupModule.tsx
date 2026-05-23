import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import PredictionsPage from './pages/PredictionsPage'
import RankingPage from './pages/RankingPage'
import StageMatchesPage from './pages/StageMatchesPage'

export default function CupModule() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="stage/:stageSlug" element={<StageMatchesPage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="ranking" element={<RankingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cup" replace />} />
    </Routes>
  )
}
