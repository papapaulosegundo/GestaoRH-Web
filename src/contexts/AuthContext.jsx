import { createContext, useContext, useState, useEffect } from 'react'
import React from 'react'

const AuthContext = createContext(null)

const KEYS = {
  empresa:     { token: 'rh_token',   data: 'rh_empresa' },
  funcionario: { token: 'fn_token',   data: 'fn_funcionario' },
}

function loadSession() {
  // Tenta empresa
  const eToken = localStorage.getItem(KEYS.empresa.token)
  const eRaw   = localStorage.getItem(KEYS.empresa.data)
  if (eToken && eRaw) {
    try {
      const data = JSON.parse(eRaw)
      // Valida que os dados têm o mínimo necessário
      if (data && data.id && data.razaoSocial) {
        return { perfil: 'empresa', token: eToken, data }
      }
    } catch { /* corrompido */ }
    // Dados inválidos — limpa
    localStorage.removeItem(KEYS.empresa.token)
    localStorage.removeItem(KEYS.empresa.data)
  }

  // Tenta funcionário
  const fToken = localStorage.getItem(KEYS.funcionario.token)
  const fRaw   = localStorage.getItem(KEYS.funcionario.data)
  if (fToken && fRaw) {
    try {
      const data = JSON.parse(fRaw)
      // Valida que os dados têm o mínimo necessário
      if (data && data.id && data.nome && data.cpf) {
        const perfil = data.isChefe ? 'chefe' : 'funcionario'
        return { perfil, token: fToken, data }
      }
    } catch { /* corrompido */ }
    // Dados inválidos — limpa automaticamente
    localStorage.removeItem(KEYS.funcionario.token)
    localStorage.removeItem(KEYS.funcionario.data)
  }

  return null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = loadSession()
    if (s) setSession(s)
    setLoading(false)
  }, [])

  const loginEmpresa = (empresaData, jwt) => {
    const s = { perfil: 'empresa', token: jwt, data: empresaData }
    setSession(s)
    localStorage.setItem(KEYS.empresa.token, jwt)
    localStorage.setItem(KEYS.empresa.data,  JSON.stringify(empresaData))
  }

  const loginFuncionario = (funcData, jwt) => {
    const perfil = funcData.isChefe ? 'chefe' : 'funcionario'
    const s = { perfil, token: jwt, data: funcData }
    setSession(s)
    localStorage.setItem(KEYS.funcionario.token, jwt)
    localStorage.setItem(KEYS.funcionario.data,  JSON.stringify(funcData))
  }

  const logout = () => {
    setSession(null)
    Object.values(KEYS).forEach(k => {
      localStorage.removeItem(k.token)
      localStorage.removeItem(k.data)
    })
  }

  const updateEmpresa = (data) => {
    if (session?.perfil !== 'empresa') return
    const s = { ...session, data }
    setSession(s)
    localStorage.setItem(KEYS.empresa.data, JSON.stringify(data))
  }

  const empresa     = session?.perfil === 'empresa' ? session.data : null
  const funcionario = (session?.perfil === 'funcionario' || session?.perfil === 'chefe')
    ? session.data : null
  const perfil = session?.perfil ?? null

  return (
    <AuthContext.Provider value={{
      session, perfil, empresa, funcionario,
      loading, loginEmpresa, loginFuncionario, logout, updateEmpresa
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export function withAuth(Component) {
  return function ComponentWithAuth(props) {
    const auth = useAuth()
    return <Component {...props} auth={auth} />
  }
}