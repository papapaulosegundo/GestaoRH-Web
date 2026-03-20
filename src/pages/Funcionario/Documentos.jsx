import { Component } from 'react'
import { Card } from 'react-bootstrap'
import { withAuth }   from '../../contexts/AuthContext'
import { PageHeader } from '../../common/_components'
import { BiFileBlank } from 'react-icons/bi'
import { FaPencilAlt } from 'react-icons/fa'

class Documentos extends Component {
  render() {
    const { perfil } = this.props.auth
    const isChefe = perfil === 'chefe'

    return (
      <div>
        <PageHeader
          title="Documentos"
          sub={isChefe
            ? 'Documentos do setor para assinar e gerenciar.'
            : 'Seus documentos e pendências de assinatura.'}
        />

        {/* Card principal — Em breve */}
        <Card className="card-rh mb-4">
          <Card.Body className="card-rh-body">
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <BiFileBlank size={48} color="var(--primary)" style={{ display: 'block', margin: '0 auto 16px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>
                Módulo de Documentos
              </div>
              <span className="badge-rh badge-warn" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex' }}>
                Em desenvolvimento
              </span>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', maxWidth: 460, margin: '0 auto' }}>
                {isChefe
                  ? 'Aqui você poderá gerenciar e aprovar documentos do seu setor, visualizar pendências de assinatura e acompanhar o status de cada colaborador.'
                  : 'Aqui você poderá visualizar documentos enviados pelo RH, assinar eletronicamente e acompanhar o histórico das suas assinaturas.'}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Card assinaturas — Em breve */}
        <Card className="card-rh">
          <Card.Body className="card-rh-body">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <FaPencilAlt size={36} color="var(--gray-400)" style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                Assinaturas Eletrônicas
              </div>
              <span className="badge-rh badge-warn" style={{ fontSize: 12, marginBottom: 12, display: 'inline-flex' }}>
                Em breve
              </span>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', maxWidth: 380, margin: '0 auto' }}>
                Assinatura digital com validade jurídica, registros de auditoria e notificações automáticas.
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withAuth(Documentos)
