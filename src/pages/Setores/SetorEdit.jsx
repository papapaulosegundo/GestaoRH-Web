import { Component } from 'react'
import { Card, Form, Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { PageHeader, LoadingSpinner, FormField } from '../../common/_components'
import { BiArrowBack, BiCheck, BiPlus } from 'react-icons/bi'
import api from '../../services/api'

class SetorEdit extends Component {
  state = {
    nome:        '',
    descricao:   '',
    ativo:       true,
    loading:     false,
    loadingData: false,
  }

  get isEdit() { return !!this.props.router.params.id }
  get id()     { return this.props.router.params.id }

  componentDidMount() {
    if (!this.isEdit) return
    this.setState({ loadingData: true })
    api.get(`/setor/${this.id}`)
      .then(res => this.setState({
        nome:        res.data.nome,
        descricao:   res.data.descricao,
        ativo:       res.data.ativo,
        loadingData: false,
      }))
      .catch(() => {
        toast.error('Setor não encontrado.')
        this.props.router.navigate('/setores')
      })
  }

  handleChange = (e) => {
    const { name, value, type, checked } = e.target
    this.setState({ [name]: type === 'checkbox' ? checked : value })
  }

  enviaRegistro = (e) => {
    e.preventDefault()
    const { nome, descricao, ativo } = this.state
    if (!nome || nome.length < 2) return toast.error('Nome deve ter mínimo 2 caracteres.')

    this.setState({ loading: true })
    const promise = this.isEdit
      ? api.put(`/setor/${this.id}`, { nome, descricao, ativo })
      : api.post('/setor', { nome, descricao })

    promise
      .then(() => {
        toast.success(this.isEdit ? 'Setor atualizado!' : 'Setor cadastrado!')
        this.props.router.navigate('/setores')
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao salvar setor.')
        this.setState({ loading: false })
      })
  }

  render() {
    const { nome, descricao, ativo, loading, loadingData } = this.state
    if (loadingData) return <LoadingSpinner />

    return (
      <div>
        <PageHeader
          title={this.isEdit ? 'Editar Setor' : 'Novo Setor'}
          sub={this.isEdit ? 'Atualize as informações do setor.' : 'Cadastre um novo departamento na empresa.'}
          action={
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/setores')}>
              <BiArrowBack className="me-1" /> Voltar
            </Button>
          }
        />

        <Card className="card-rh" style={{ maxWidth: 600 }}>
          <Card.Body className="card-rh-body">
            <Form onSubmit={this.enviaRegistro}>
              <FormField label="Nome do setor *" className="form-group-rh">
                <Form.Control className="form-control-rh"
                  placeholder="Ex: Recursos Humanos, Financeiro, TI..."
                  name="nome" value={nome} onChange={this.handleChange} required />
              </FormField>

              <FormField
                label="Descrição"
                hint="Ajuda os colaboradores a entenderem onde pertencem."
                className="form-group-rh"
              >
                <Form.Control as="textarea" rows={4} className="form-control-rh"
                  placeholder="Descreva as responsabilidades deste setor..."
                  name="descricao" value={descricao} onChange={this.handleChange}
                  style={{ resize: 'vertical' }} />
              </FormField>

              {/* Campo ativo apenas na edição */}
              {this.isEdit && (
                <FormField label="Status" className="form-group-rh">
                  <Form.Select className="form-control-rh" name="ativo"
                    value={ativo ? 'true' : 'false'}
                    onChange={e => this.setState({ ativo: e.target.value === 'true' })}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </Form.Select>
                </FormField>
              )}

              <div className="d-flex gap-3 justify-content-end mt-2">
                <Button variant="light" className="btn-ghost-rh"
                  onClick={() => this.props.router.navigate('/setores')}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary-rh" disabled={loading}>
                  {loading
                    ? <><Spinner size="sm" className="me-2" />{this.isEdit ? 'Salvando...' : 'Cadastrando...'}</>
                    : this.isEdit
                      ? <><BiCheck className="me-1" /> Salvar alterações</>
                      : <><BiPlus className="me-1" /> Cadastrar setor</>
                  }
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withRouter(SetorEdit)
