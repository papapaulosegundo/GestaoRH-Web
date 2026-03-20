import { Component } from 'react'
import { Outlet }    from 'react-router-dom'
import { withRouter }  from '../../common/withRouter'
import Sidebar from '../Sidebar/Sidebar'

const PAGE_TITLES = {
  '/dashboard':         { title: 'Dashboard',            sub: 'Visão geral do sistema' },
  '/funcionarios':      { title: 'Funcionários',          sub: 'Gestão de colaboradores' },
  '/funcionarios/novo': { title: 'Novo Funcionário',      sub: 'Cadastro de colaborador' },
  '/setores':           { title: 'Setores',               sub: 'Gestão de departamentos' },
  '/setores/novo':      { title: 'Novo Setor',            sub: 'Cadastro de setor' },
  '/empresa':           { title: 'Perfil da Empresa',     sub: 'Informações da sua empresa' },
  '/modelos':           { title: 'Modelos de Documentos', sub: 'Templates reutilizáveis' },
  '/modelos/novo':      { title: 'Novo Modelo',           sub: 'Monte a estrutura do documento' },
}

class Layout extends Component {
  getPageTitle() {
    const { pathname } = this.props.router.location
    for (const [path, meta] of Object.entries(PAGE_TITLES)) {
      if (pathname === path || pathname.startsWith(path + '/')) return meta
    }
    return { title: 'GestãoRH', sub: '' }
  }

  render() {
    const { title, sub } = this.getPageTitle()
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <header className="topbar">
            <div className="topbar-title">
              {title}
              {sub && <span className="topbar-sub ms-2">— {sub}</span>}
            </div>
          </header>
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }
}

export default withRouter(Layout)
