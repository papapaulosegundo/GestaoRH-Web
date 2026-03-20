import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token — tenta empresa primeiro, depois funcionário
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rh_token') || localStorage.getItem('fn_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Em 401: limpa TUDO e redireciona para o login correto
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const eraDeFuncionario = !!localStorage.getItem('fn_token')

      // Limpa ambas as sessões
      localStorage.removeItem('rh_token')
      localStorage.removeItem('rh_empresa')
      localStorage.removeItem('fn_token')
      localStorage.removeItem('fn_funcionario')

      // Redireciona para o login correto
      window.location.href = eraDeFuncionario ? '/fn' : '/'
    }
    return Promise.reject(err)
  }
)

export default api