import './styles/base.css'
import './styles/auth.css'
import './styles/cards.css'
import './styles/catalog.css'
import './styles/cup.css'
import './styles/mobile.css'
import './styles/paint.css'
import { AuthProvider } from './auth/AuthProvider'
import AppShell from './AppShell'

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
