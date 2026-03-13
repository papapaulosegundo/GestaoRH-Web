import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [empresa, setEmpresa] = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken   = localStorage.getItem('rh_token')
    const storedEmpresa = localStorage.getItem('rh_empresa')
    if (storedToken && storedEmpresa) {
      setToken(storedToken)
      setEmpresa(JSON.parse(storedEmpresa))
    }
    setLoading(false)
  }, [])

  const login = (empresaData, jwt) => {
    setEmpresa(empresaData)
    setToken(jwt)
    localStorage.setItem('rh_token',  jwt)
    localStorage.setItem('rh_empresa', JSON.stringify(empresaData))
  }

  const logout = () => {
    setEmpresa(null)
    setToken(null)
    localStorage.removeItem('rh_token')
    localStorage.removeItem('rh_empresa')
  }

  const updateEmpresa = (data) => {
    setEmpresa(data)
    localStorage.setItem('rh_empresa', JSON.stringify(data))
  }

  return (
    <AuthContext.Provider value={{ empresa, token, loading, login, logout, updateEmpresa }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
