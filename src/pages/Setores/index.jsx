import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { setorService } from '../../services/services'

export default function SetoresListagem() {
  const navigate = useNavigate()
  const [setores, setSetores]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filtroNome, setFiltroNome]       = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await setorService.listar()
      setSetores(res.data)
    } catch { toast.error('Erro ao carregar setores.') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleDesativar = async (id) => {
    try {
      await setorService.desativar(id)
      toast.success('Setor desativado.')
      setConfirmDelete(null)
      carregar()
    } catch { toast.error('Erro ao desativar setor.') }
  }

  const filtrados = setores.filter(s =>
    !filtroNome || s.nome.toLowerCase().includes(filtroNome.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Setores</h1>
          <p>{setores.length} setor{setores.length !== 1 ? 'es' : ''} cadastrado{setores.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary-rh" onClick={() => navigate('/setores/novo')}>
          <i className="bi bi-plus-lg" /> Adicionar Setor
        </button>
      </div>

      {/* Filtro */}
      <div className="filter-bar">
        <div className="filter-bar-title">Filtros</div>
        <div className="row g-3">
          <div className="col-md-5">
            <label className="form-label-rh">Nome do setor</label>
            <div className="input-icon-wrap">
              <i className="bi bi-search" />
              <input
                className="form-control-rh"
                placeholder="Buscar por nome..."
                value={filtroNome}
                onChange={e => setFiltroNome(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn-ghost-rh w-100" onClick={() => setFiltroNome('')} title="Limpar">
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card-rh">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-diagram-3" />
            <h3>Nenhum setor encontrado</h3>
            <p>Adicione o primeiro setor da empresa.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-rh">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{s.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        <i className="bi bi-diagram-3 me-2" style={{ color: 'var(--primary)', fontSize: 14 }} />
                        {s.nome}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)', maxWidth: 300 }}>
                      {s.descricao || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge-rh ${s.ativo ? 'badge-active' : 'badge-inactive'}`}>
                        <i className={`bi bi-${s.ativo ? 'check-circle' : 'x-circle'}`} />
                        {s.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-edit-rh"
                          onClick={() => navigate(`/setores/editar/${s.id}`)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn-danger-rh"
                          onClick={() => setConfirmDelete(s)}
                          title="Desativar"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtrados.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-500)' }}>
            Exibindo <strong>{filtrados.length}</strong> de <strong>{setores.length}</strong> setor{setores.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Modal confirmação */}
      {confirmDelete && (
        <div className="modal-backdrop-rh" onClick={() => setConfirmDelete(null)}>
          <div className="modal-rh" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header-rh">
              <h2>Desativar setor</h2>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body-rh">
              <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
                Tem certeza que deseja desativar o setor <strong>{confirmDelete.nome}</strong>?
              </p>
            </div>
            <div className="modal-footer-rh">
              <button className="btn-ghost-rh" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-danger-rh" onClick={() => handleDesativar(confirmDelete.id)}>
                <i className="bi bi-trash" /> Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
