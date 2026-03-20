import { Component } from 'react'
import { Outlet }    from 'react-router-dom'
import { withRouter }  from '../../common/withRouter'
import { withAuth }    from '../../contexts/AuthContext'
import {
  BiGrid, BiFileBlank, BiGroup, BiLogOut, BiUser
} from 'react-icons/bi'
import { NavLink } from 'react-router-dom'

const PAGE_TITLES = {
  '/fn/dashboard':  { title: 'Dashboard',         sub: 'Visão geral' },
  '/fn/documentos': { title: 'Documentos',         sub: 'Seus documentos e assinaturas' },
  '/fn/equipe':     { title: 'Equipe do Setor',    sub: 'Colaboradores do seu setor' },
}

class LayoutFuncionario extends Component {
  getPageTitle() {
    const { pathname } = this.props.router.location
    for (const [path, meta] of Object.entries(PAGE_TITLES)) {
      if (pathname === path || pathname.startsWith(path + '/')) return meta
    }
    return { title: 'GestãoRH', sub: '' }
  }

  handleLogout = () => {
    this.props.auth.logout()
    this.props.router.navigate('/fn')
  }

  render() {
    const { title, sub } = this.getPageTitle()
    const { funcionario, perfil } = this.props.auth
    const isChefe = perfil === 'chefe'

    const iniciais = funcionario
      ? funcionario.nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
      : 'F'

    return (
      <div className="app-layout">
        {/* Sidebar funcionário */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">📋</div>
            <div>
              <div className="logo-text">GestãoRH</div>
              <div className="logo-sub">{isChefe ? 'Chefe de Setor' : 'Colaborador'}</div>
            </div>
          </div>

          {/* Avatar do funcionário */}
          <div className="sidebar-profile">
            <div className="avatar">{iniciais}</div>
            <div className="profile-info">
              <div className="name">{funcionario?.nome ?? 'Colaborador'}</div>
              <div className="role">{funcionario?.nomeSetor ?? 'Setor'}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Menu</div>

            <NavLink to="/fn/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <BiGrid size={16} /> Dashboard
            </NavLink>

            <NavLink to="/fn/documentos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <BiFileBlank size={16} /> Documentos
            </NavLink>

            {/* Equipe: visível apenas para chefe */}
            {isChefe && (
              <NavLink to="/fn/equipe" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <BiGroup size={16} /> Equipe do Setor
              </NavLink>
            )}

            <div className="nav-section-label" style={{ marginTop: 8 }}>Em breve</div>
            <div className="nav-item disabled"><BiUser size={16} /> Meu Perfil <span className="nav-badge">Em breve</span></div>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={this.handleLogout} style={{ color: '#F87171' }}>
              <BiLogOut size={16} style={{ color: '#F87171' }} /> Sair
            </button>
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="app-main">
          <header className="topbar">
            <div className="topbar-title">
              {title}
              {sub && <span className="topbar-sub ms-2">— {sub}</span>}
            </div>
            {isChefe && (
              <span className="badge-rh badge-info ms-auto" style={{ fontSize: 12 }}>
                Chefe de Setor
              </span>
            )}
          </header>
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }
}

export default withAuth(withRouter(LayoutFuncionario))
