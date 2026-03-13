import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { funcionarioService, setorService } from '../../services/services'

export default function Dashboard() {
  const [stats, setStats] = useState({ funcionarios: 0, setores: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([funcionarioService.listar(), setorService.listar()]).then(([f, s]) => {
      setStats({ funcionarios: f.data.length, setores: s.data.length })
    }).catch(() => {})
  }, [])

  const cards = [
    { icon: 'bi-people-fill', label: 'Funcionários ativos', value: stats.funcionarios, color: '#DBEAFE', iconColor: '#2563EB', link: '/funcionarios' },
    { icon: 'bi-diagram-3-fill', label: 'Setores cadastrados', value: stats.setores, color: '#D1FAE5', iconColor: '#10B981', link: '/setores' },
    { icon: 'bi-file-earmark-text', label: 'Documentos', value: '—', color: '#FEF3C7', iconColor: '#F59E0B', disabled: true },
    { icon: 'bi-pen', label: 'Assinaturas', value: '—', color: '#EDE9FE', iconColor: '#7C3AED', disabled: true },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Visão Geral</h1>
          <p>Acompanhe os dados do seu RH em tempo real.</p>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map(c => (
          <div
            key={c.label}
            className="stat-card"
            style={{ cursor: c.disabled ? 'default' : 'pointer' }}
            onClick={() => !c.disabled && navigate(c.link)}
          >
            <div className="stat-icon" style={{ background: c.color }}>
              <i className={`bi ${c.icon}`} style={{ color: c.iconColor }} />
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
            {c.disabled && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--gray-400)' }}>Em breve</div>}
          </div>
        ))}
      </div>

      {/* Módulos em breve */}
      <div className="card-rh">
        <div className="card-rh-body">
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <i className="bi bi-rocket-takeoff" style={{ fontSize: 36, color: 'var(--primary)', display: 'block', marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>
              Sistema em construção 🚀
            </div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto' }}>
              Os módulos de documentos, assinaturas eletrônicas e notificações estão sendo desenvolvidos.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
