import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import AuthPage from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Funcionarios from './pages/Funcionarios/Funcionarios'
import FuncionarioEdit from './pages/Funcionarios/FuncionarioEdit'
import Setores from './pages/Setores/Setores'
import SetorEdit from './pages/Setores/SetorEdit'
import PerfilEmpresa from './pages/Empresa/PerfilEmpresa'

function PrivateRoute({ children }) {
  const { empresa, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)', width: 40, height: 40 }} />
    </div>
  )
  return empresa ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const { empresa, loading } = useAuth()
  if (loading) return null
  return empresa ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/funcionarios/novo" element={<FuncionarioEdit />} />
        <Route path="/funcionarios/editar/:id" element={<FuncionarioEdit />} />

        <Route path="/setores" element={<Setores />} />
        <Route path="/setores/novo" element={<SetorEdit />} />
        <Route path="/setores/editar/:id" element={<SetorEdit />} />

        <Route path="/empresa" element={<PerfilEmpresa />} />
      </Route>

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
          toastStyle={{ fontFamily: 'var(--font-body)', fontSize: 14, borderRadius: 10 }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
