import api from './api'

// ── Empresa ────────────────────────────────────────────────
export const empresaService = {
  cadastrar:  (data) => api.post('/empresa/cadastrar', data),
  login:      (data) => api.post('/empresa/login', data),
  obterPorId: (id)   => api.get(`/empresa/${id}`),
  atualizar:  (id, data) => api.put(`/empresa/${id}`, data),
  listar:     ()     => api.get('/empresa'),
}

// ── Setor ──────────────────────────────────────────────────
export const setorService = {
  listar:     ()         => api.get('/setor'),
  obterPorId: (id)       => api.get(`/setor/${id}`),
  cadastrar:  (data)     => api.post('/setor', data),
  atualizar:  (id, data) => api.put(`/setor/${id}`, data),
  desativar:  (id)       => api.delete(`/setor/${id}`),
}

// ── Funcionário ────────────────────────────────────────────
export const funcionarioService = {
  listar:         ()         => api.get('/funcionario'),
  listarPorSetor: (setorId)  => api.get(`/funcionario/setor/${setorId}`),
  obterPorId:     (id)       => api.get(`/funcionario/${id}`),
  cadastrar:      (data)     => api.post('/funcionario/cadastrar', data),
  atualizar:      (id, data) => api.put(`/funcionario/${id}`, data),
  desativar:      (id)       => api.delete(`/funcionario/${id}`),
}
