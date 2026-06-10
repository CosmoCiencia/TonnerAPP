import { Navigate, useLocation } from 'react-router-dom'

export default function ParticipantTypeScreen() {
  const location = useLocation()

  return <Navigate to="/register" state={location.state} replace />
}
