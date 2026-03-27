import { Component }   from 'react'
import { Tab, Tabs, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { toast }        from 'react-toastify'
import Select           from 'react-select'
import { withRouter }   from '../../common/withRouter'
import { PageHeader, LoadingSpinner, FormField } from '../../common/_components'
import { BiArrowBack, BiSave } from 'react-icons/bi'
import { CATEGORIA_OPTIONS, TIPO_USO_OPTIONS, selectStyles } from '../../common/modeloUtils'
import AbaConteudo    from './AbaConteudo'
import AbaAssinaturas from './AbaAssinaturas'
import AbaPreview     from './AbaPreview'
import api from '../../services/api'

// Converte os ids numéricos que vêm da API (int) para string,
// porque o DTO do backend declara Id como string e o .NET
// não consegue deserializar number → string automaticamente.
function normalizarSecoes(secoes = []) {
  return secoes.map((s, idx) => ({
    ...s,
    id:     String(s.id ?? `api_${idx}`),
    campos: (s.campos ?? []).map((c, cidx) => ({
      ...c,
      id: String(c.id ?? `campo_${idx}_${cidx}`),
    })),
  }))
}

function normalizarAssinantes(assinantes = []) {
  return assinantes.map((a, idx) => ({
    ...a,
    id: String(a.id ?? `assin_${idx}`),
  }))
}

// Remove campos que o backend não precisa (ou que causam conflito)
// e garante que os ids sejam sempre string no payload.
function sanitizarPayload(secoes, assinantes) {
  return {
    secoes: secoes.map((s, idx) => ({
      id:       String(s.id ?? ''),
      titulo:   s.titulo   ?? '',
      tipo:     s.tipo     ?? 'texto',
      conteudo: s.conteudo ?? '',
      ordem:    idx,
      campos: (s.campos ?? []).map((c, cidx) => ({
        id:          String(c.id ?? ''),
        label:       c.label       ?? '',
        tipoCampo:   c.tipo        ?? c.tipoCampo ?? 'texto_curto',   // normaliza nome do campo
        obrigatorio: c.obrigatorio ?? true,
        ordem:       cidx,
      })),
    })),
    assinantes: assinantes.map((a, idx) => ({
      id:          String(a.id ?? ''),
      papel:       a.papel       ?? 'funcionario',
      rotulo:      a.rotulo      ?? '',
      obrigatorio: a.obrigatorio ?? true,
      ordem:       idx + 1,
      exibirPdf:   a.exibirPdf   ?? a.exibir_pdf ?? true,
    })),
  }
}

class ModeloEdit extends Component {
  state = {
    nome:         '',
    descricao:    '',
    categoriaSel: null,
    tipoUsoSel:   null,
    secoes:       [],
    assinantes:   [],
    loading:      false,
    loadingData:  false,
    tabAtiva:     'geral',
    erros:        {},
  }

  get isEdit() { return !!this.props.router.params.id }
  get id()     { return this.props.router.params.id }

  componentDidMount() {
    if (!this.isEdit) return
    this.setState({ loadingData: true })
    api.get(`/modelo/${this.id}`)
      .then(res => {
        const m = res.data
        this.setState({
          nome:         m.nome,
          descricao:    m.descricao ?? '',
          categoriaSel: CATEGORIA_OPTIONS.find(o => o.value === m.categoria) ?? null,
          tipoUsoSel:   TIPO_USO_OPTIONS.find(o => o.value === m.tipoUso)   ?? null,
          // FIX: normaliza ids de int → string para evitar erro 400 no PUT/POST
          secoes:      normalizarSecoes(m.secoes),
          assinantes:  normalizarAssinantes(m.assinantes),
          loadingData: false,
        })
      })
      .catch(() => {
        toast.error('Modelo não encontrado.')
        this.props.router.navigate('/modelos')
      })
  }

  validar() {
    const { nome, categoriaSel, tipoUsoSel } = this.state
    const erros = {}
    if (!nome.trim())  erros.nome      = 'Nome é obrigatório.'
    if (!categoriaSel) erros.categoria = 'Selecione uma categoria.'
    if (!tipoUsoSel)   erros.tipoUso   = 'Selecione o tipo de uso.'
    this.setState({ erros })
    return Object.keys(erros).length === 0
  }

  salvar = (e) => {
    e.preventDefault()
    if (!this.validar()) {
      this.setState({ tabAtiva: 'geral' })
      return toast.error('Corrija os campos obrigatórios.')
    }

    const { nome, descricao, categoriaSel, tipoUsoSel, secoes, assinantes } = this.state

    // FIX: sanitiza ids e campos antes de enviar
    const { secoes: secoesSan, assinantes: assinantesSan } = sanitizarPayload(secoes, assinantes)

    const payload = {
      nome:       nome.trim(),
      descricao:  descricao.trim(),
      categoria:  categoriaSel.value,
      tipoUso:    tipoUsoSel.value,
      secoes:     secoesSan,
      assinantes: assinantesSan,
    }

    this.setState({ loading: true })

    const req = this.isEdit
      ? api.put(`/modelo/${this.id}`, payload)
      : api.post('/modelo', payload)

    req
      .then(() => {
        toast.success(this.isEdit ? 'Modelo atualizado!' : 'Modelo criado!')
        this.props.router.navigate('/modelos')
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao salvar modelo.')
        this.setState({ loading: false })
      })
  }

  render() {
    const {
      nome, descricao, categoriaSel, tipoUsoSel,
      secoes, assinantes, loading, loadingData, tabAtiva, erros,
    } = this.state

    if (loadingData) return <LoadingSpinner />

    return (
      <div>
        <PageHeader
          title={this.isEdit ? 'Editar Modelo' : 'Novo Modelo'}
          sub={this.isEdit ? 'Atualize a estrutura do documento.' : 'Monte a estrutura do documento de RH.'}
          action={
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/modelos')}>
              <BiArrowBack className="me-1" /> Voltar
            </Button>
          }
        />

        <Form onSubmit={this.salvar}>
          <Tabs activeKey={tabAtiva} onSelect={k => this.setState({ tabAtiva: k })}
            className="mb-3" style={{ borderBottom: '1px solid var(--border)' }}>

            {/* ── ABA GERAL ── */}
            <Tab eventKey="geral" title="Geral">
              <Card className="card-rh">
                <Card.Body className="card-rh-body">
                  <Row className="g-4">
                    <Col md={8}>
                      <FormField label="Nome do modelo *">
                        <Form.Control className={`form-control-rh${erros.nome ? ' is-invalid' : ''}`}
                          placeholder="Ex: Termo de Confidencialidade"
                          value={nome} onChange={e => this.setState({ nome: e.target.value })} />
                        {erros.nome && <span className="form-error">{erros.nome}</span>}
                      </FormField>
                    </Col>

                    <Col md={4}>
                      <FormField label="Versão">
                        <Form.Control className="form-control-rh" value="v1 (automático)" disabled />
                      </FormField>
                    </Col>

                    <Col md={12}>
                      <FormField label="Descrição" hint="Explique quando e como usar este modelo.">
                        <Form.Control as="textarea" rows={2} className="form-control-rh"
                          placeholder="Descreva a finalidade deste modelo..."
                          value={descricao} onChange={e => this.setState({ descricao: e.target.value })}
                          style={{ resize: 'vertical' }} />
                      </FormField>
                    </Col>

                    <Col md={6}>
                      <FormField label="Categoria *">
                        <Select options={CATEGORIA_OPTIONS} value={categoriaSel}
                          onChange={v => this.setState({ categoriaSel: v })}
                          placeholder="Selecione..." styles={selectStyles} />
                        {erros.categoria && <span className="form-error">{erros.categoria}</span>}
                      </FormField>
                    </Col>

                    <Col md={6}>
                      <FormField label="Tipo de uso *"
                        hint="Individual: para 1 funcionário. Lote: para um setor inteiro.">
                        <Select options={TIPO_USO_OPTIONS} value={tipoUsoSel}
                          onChange={v => this.setState({ tipoUsoSel: v })}
                          placeholder="Selecione..." styles={selectStyles} />
                        {erros.tipoUso && <span className="form-error">{erros.tipoUso}</span>}
                      </FormField>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* ── ABA CONTEÚDO ── */}
            <Tab eventKey="conteudo" title="Conteúdo">
              <AbaConteudo
                secoes={secoes}
                onChange={secoes => this.setState({ secoes })}
              />
            </Tab>

            {/* ── ABA ASSINATURAS ── */}
            <Tab eventKey="assinaturas" title="Assinaturas">
              <AbaAssinaturas
                assinantes={assinantes}
                onChange={assinantes => this.setState({ assinantes })}
              />
            </Tab>

            {/* ── ABA PREVIEW ── */}
            <Tab eventKey="preview" title="Preview">
              <AbaPreview secoes={secoes} assinantes={assinantes} nomeModelo={nome} />
            </Tab>
          </Tabs>

          <div className="d-flex justify-content-end gap-3 mt-3">
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.props.router.navigate('/modelos')}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary-rh" disabled={loading}>
              {loading
                ? <><Spinner size="sm" className="me-2" />Salvando...</>
                : <><BiSave className="me-1" />{this.isEdit ? 'Salvar alterações' : 'Salvar rascunho'}</>
              }
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

export default withRouter(ModeloEdit)
