import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Layout            from './components/Layout/Layout'
import LayoutFuncionario from './components/Layout/LayoutFuncionario'

// Área RH
import AuthPage       from './pages/Auth/Login'
import Dashboard      from './pages/Dashboard/Dashboard'
import Funcionarios   from './pages/Funcionarios/Funcionarios'
import FuncionarioEdit from './pages/Funcionarios/FuncionarioEdit'
import Setores        from './pages/Setores/Setores'
import SetorEdit      from './pages/Setores/SetorEdit'
import PerfilEmpresa  from './pages/Empresa/PerfilEmpresa'
import Modelos        from './pages/Modelos/Modelos'
import ModeloEdit     from './pages/Modelos/ModeloEdit'
import Documentos     from './pages/Documentos/Documentos'
import GerarDocumento  from './pages/Documentos/GerarDocumento'
import DetalhesDocumento from './pages/Documentos/DetalhesDocumento'

// Área Funcionário / Chefe
import LoginFuncionario     from './pages/Auth/LoginFuncionario'
import DashboardFuncionario from './pages/FuncionarioPerfil/DashboardFuncionario'
import FuncionariosSetor    from './pages/FuncionarioPerfil/FuncionariosSetor'
import DocumentosFuncionario from './pages/FuncionarioPerfil/Documentos'

function Loading() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)', width: 40, height: 40 }} />
    </div>
  )
}

function GuestRoute({ children }) {
  const { perfil, loading } = useAuth()
  if (loading) return null
  if (perfil === 'empresa')                         return <Navigate to="/dashboard" replace />
  if (perfil === 'funcionario' || perfil === 'chefe') return <Navigate to="/fn/dashboard" replace />
  return children
}

function EmpresaRoute({ children }) {
  const { perfil, loading } = useAuth()
  if (loading) return <Loading />
  return perfil === 'empresa' ? children : <Navigate to="/" replace />
}

function FuncionarioRoute({ children }) {
  const { perfil, loading } = useAuth()
  if (loading) return <Loading />
  return (perfil === 'funcionario' || perfil === 'chefe') ? children : <Navigate to="/fn" replace />
}

function ChefeRoute({ children }) {
  const { perfil, loading } = useAuth()
  if (loading) return <Loading />
  return perfil === 'chefe' ? children : <Navigate to="/fn/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Logins */}
      <Route path="/"   element={<GuestRoute><AuthPage /></GuestRoute>} />
      <Route path="/fn" element={<GuestRoute><LoginFuncionario /></GuestRoute>} />

      {/* ── Área RH / Empresa ── */}
      <Route element={<EmpresaRoute><Layout /></EmpresaRoute>}>
        <Route path="/dashboard"               element={<Dashboard />} />

        {/* Funcionários */}
        <Route path="/funcionarios"            element={<Funcionarios />} />
        <Route path="/funcionarios/novo"       element={<FuncionarioEdit />} />
        <Route path="/funcionarios/editar/:id" element={<FuncionarioEdit />} />

        {/* Setores */}
        <Route path="/setores"                 element={<Setores />} />
        <Route path="/setores/novo"            element={<SetorEdit />} />
        <Route path="/setores/editar/:id"      element={<SetorEdit />} />

        {/* Empresa */}
        <Route path="/empresa"                 element={<PerfilEmpresa />} />

        {/* Modelos */}
        <Route path="/modelos"                 element={<Modelos />} />
        <Route path="/modelos/novo"            element={<ModeloEdit />} />
        <Route path="/modelos/editar/:id"      element={<ModeloEdit />} />

        {/* Documentos */}
        <Route path="/documentos"              element={<Documentos />} />
        <Route path="/documentos/gerar"        element={<GerarDocumento />} />
        <Route path="/documentos/:id"          element={<DetalhesDocumento />} />
      </Route>

      {/* ── Área Funcionário / Chefe ── */}
      <Route element={<FuncionarioRoute><LayoutFuncionario /></FuncionarioRoute>}>
        <Route path="/fn/dashboard"  element={<DashboardFuncionario />} />
        <Route path="/fn/documentos" element={<DocumentosFuncionario />} />
        <Route path="/fn/equipe"     element={<ChefeRoute><FuncionariosSetor /></ChefeRoute>} />
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
          position="top-right" autoClose={3500}
          hideProgressBar={false} newestOnTop closeOnClick pauseOnHover
          toastStyle={{ fontFamily: 'var(--font-body)', fontSize: 14, borderRadius: 10 }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
