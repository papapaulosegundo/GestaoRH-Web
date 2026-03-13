import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout        from './components/Layout/Layout'
import AuthPage      from './pages/Auth/AuthPage'
import Dashboard     from './pages/Dashboard/Dashboard'
import FuncionariosListagem from './pages/Funcionarios/index'
import FuncionarioForm      from './pages/Funcionarios/FuncionarioForm'
import SetoresListagem      from './pages/Setores/index'
import SetorForm            from './pages/Setores/SetorForm'
import PerfilEmpresa        from './pages/Empresa/PerfilEmpresa'

// Rota protegida — redireciona para / se não estiver logado
function PrivateRoute({ children }) {
  const { empresa, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)', width: 40, height: 40 }} />
    </div>
  )
  return empresa ? children : <Navigate to="/" replace />
}

// Rota pública — redireciona para /dashboard se já estiver logado
function PublicRoute({ children }) {
  const { empresa, loading } = useAuth()
  if (loading) return null
  return empresa ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Página pública: Login + Cadastro */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Área protegida: com sidebar */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard"              element={<Dashboard />} />

        {/* Funcionários */}
        <Route path="/funcionarios"           element={<FuncionariosListagem />} />
        <Route path="/funcionarios/novo"      element={<FuncionarioForm />} />
        <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />

        {/* Setores */}
        <Route path="/setores"               element={<SetoresListagem />} />
        <Route path="/setores/novo"          element={<SetorForm />} />
        <Route path="/setores/editar/:id"    element={<SetorForm />} />

        {/* Perfil empresa */}
        <Route path="/empresa"              element={<PerfilEmpresa />} />
      </Route>

      {/* Rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          toastStyle={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            borderRadius: 10,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
