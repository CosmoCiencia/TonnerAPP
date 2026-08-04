import './styles/base.css'
import './styles/auth.css'
import './styles/catalog.css'
import './styles/catalog/home.css'
import './styles/catalog/product-card.css'
import './styles/catalog/product-detail.css'
import './styles/catalog/stores.css'
import './styles/catalog/store-map.css'
import './styles/catalog/store-card.css'
import './styles/calculator.css'
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
