import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { funcionarioService, setorService } from '../../services/services'

const TURNO_LABEL  = { matutino: 'Matutino', vespertino: 'Vespertino', noturno: 'Noturno' }
const GENERO_LABEL = { masculino: 'Masculino', feminino: 'Feminino', sem_genero: 'Não informado' }
const TURNO_COLOR  = { matutino: 'badge-info', vespertino: 'badge-warn', noturno: 'badge-rh' }

export default function FuncionariosListagem() {
  const navigate = useNavigate()
  const [funcionarios, setFuncionarios] = useState([])
  const [setores, setSetores]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Filtros
  const [filtroNome,   setFiltroNome]   = useState('')
  const [filtroSetor,  setFiltroSetor]  = useState('')
  const [filtroTurno,  setFiltroTurno]  = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [resF, resS] = await Promise.all([
        funcionarioService.listar(),
        setorService.listar()
      ])
      setFuncionarios(resF.data)
      setSetores(resS.data)
    } catch { toast.error('Erro ao carregar funcionários.') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleDesativar = async (id) => {
    try {
      await funcionarioService.desativar(id)
      toast.success('Funcionário desativado.')
      setConfirmDelete(null)
      carregar()
    } catch { toast.error('Erro ao desativar funcionário.') }
  }

  const limparFiltros = () => {
    setFiltroNome(''); setFiltroSetor(''); setFiltroTurno(''); setFiltroGenero('')
  }

  // Aplicar filtros localmente
  const filtrados = funcionarios.filter(f => {
    const nomeOk   = !filtroNome   || f.nome.toLowerCase().includes(filtroNome.toLowerCase())
    const setorOk  = !filtroSetor  || String(f.setorId) === filtroSetor
    const turnoOk  = !filtroTurno  || f.turno === filtroTurno
    const generoOk = !filtroGenero || f.genero === filtroGenero
    return nomeOk && setorOk && turnoOk && generoOk
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Funcionários</h1>
          <p>{funcionarios.length} colaborador{funcionarios.length !== 1 ? 'es' : ''} cadastrado{funcionarios.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary-rh" onClick={() => navigate('/funcionarios/novo')}>
          <i className="bi bi-plus-lg" /> Adicionar Funcionário
        </button>
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        <div className="filter-bar-title">Filtros</div>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label-rh">Nome</label>
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
          <div className="col-md-3">
            <label className="form-label-rh">Setor</label>
            <select className="form-control-rh" value={filtroSetor} onChange={e => setFiltroSetor(e.target.value)}>
              <option value="">Todos os setores</option>
              {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label-rh">Turno</label>
            <select className="form-control-rh" value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)}>
              <option value="">Todos</option>
              <option value="matutino">Matutino</option>
              <option value="vespertino">Vespertino</option>
              <option value="noturno">Noturno</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label-rh">Gênero</label>
            <select className="form-control-rh" value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)}>
              <option value="">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="sem_genero">Não informado</option>
            </select>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn-ghost-rh w-100" onClick={limparFiltros} title="Limpar">
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
            <i className="bi bi-people" />
            <h3>Nenhum funcionário encontrado</h3>
            <p>Ajuste os filtros ou adicione um novo colaborador.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-rh">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Setor</th>
                  <th>Turno</th>
                  <th>Gênero</th>
                  <th>Senha Temp.</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(f => (
                  <tr key={f.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{f.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{f.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{f.telefone}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{f.cpf}</td>
                    <td style={{ fontSize: 13 }}>{f.email}</td>
                    <td>
                      <span className="badge-rh badge-info">{f.nomeSetor ?? '—'}</span>
                    </td>
                    <td>
                      <span className={`badge-rh ${TURNO_COLOR[f.turno] ?? 'badge-info'}`}>
                        {TURNO_LABEL[f.turno] ?? f.turno}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                      {GENERO_LABEL[f.genero] ?? f.genero}
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 6, color: 'var(--primary-dark)' }}>
                        {f.senhaTemporaria}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-edit-rh"
                          onClick={() => navigate(`/funcionarios/editar/${f.id}`)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn-danger-rh"
                          onClick={() => setConfirmDelete(f)}
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

        {/* Rodapé da tabela */}
        {!loading && filtrados.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-500)' }}>
            Exibindo <strong>{filtrados.length}</strong> de <strong>{funcionarios.length}</strong> resultado{funcionarios.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="modal-backdrop-rh" onClick={() => setConfirmDelete(null)}>
          <div className="modal-rh" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header-rh">
              <h2>Desativar funcionário</h2>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body-rh">
              <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
                Tem certeza que deseja desativar <strong>{confirmDelete.nome}</strong>?
                Ele não conseguirá mais acessar o sistema.
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
