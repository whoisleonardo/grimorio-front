import { useState, useEffect } from "react";
import {
  buscarEscolasDeMagia,
  criarEscolaDeMagia,
  atualizarEscolaDeMagia,
  deletarEscolaDeMagia,
} from "../servicos/api";

const FORM_VAZIO = { nome: "", descricao: "", elemento: "" };

export default function PaginaEscolasDeMagia({ aoVoltar }) {
  const [escolas, setEscolas] = useState([]);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarEscolas();
  }, []);

  async function carregarEscolas() {
    try {
      const lista = await buscarEscolasDeMagia();
      setEscolas(lista);
    } catch (erro) {
      setErro("Erro ao carregar escolas: " + erro.message);
    }
  }

  function validarFormulario() {
    if (!formulario.nome || formulario.nome.length < 3)
      return "Nome deve ter no mínimo 3 caracteres";
    if (!formulario.descricao || formulario.descricao.length < 10)
      return "Descrição deve ter no mínimo 10 caracteres";
    if (!formulario.elemento || formulario.elemento.length < 2)
      return "Elemento é obrigatório";
    return null;
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    const erroValidacao = validarFormulario();
    if (erroValidacao) return setErro(erroValidacao);

    setCarregando(true);
    try {
      if (idEditando) {
        await atualizarEscolaDeMagia(idEditando, formulario);
        setMensagem("Escola de magia atualizada com sucesso!");
      } else {
        await criarEscolaDeMagia(formulario);
        setMensagem("Escola de magia cadastrada com sucesso!");
      }
      setFormulario(FORM_VAZIO);
      setIdEditando(null);
      await carregarEscolas();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || 'Erro na operação');
    } finally {
      setCarregando(false);
    }
  }

  function handleEditar(escola) {
    setIdEditando(escola.id);
    setFormulario({
      nome: escola.nome,
      descricao: escola.descricao,
      elemento: escola.elemento,
    });
    setErro("");
    setMensagem("");
  }

  async function handleDeletar(id) {
    if (!confirm("Tem certeza que deseja excluir esta escola de magia?")) return;
    setErro("");
    try {
      await deletarEscolaDeMagia(id);
      setMensagem("Escola de magia excluída com sucesso!");
      await carregarEscolas();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || 'Erro na operação');
    }
  }

  function handleCancelar() {
    setFormulario(FORM_VAZIO);
    setIdEditando(null);
    setErro("");
    setMensagem("");
  }

  return (
    <div style={estilos.pagina}>
      {/* Cabeçalho */}
      <div style={estilos.cabecalho}>
        <h1 style={estilos.titulo}>📚 Escolas de Magia</h1>
        <button onClick={aoVoltar} style={estilos.botaoVoltar}>← Voltar</button>
      </div>

      <div style={estilos.conteudo}>
        {/* Formulário */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>
            {idEditando ? "Editar Escola de Magia" : "Nova Escola de Magia"}
          </h2>

          <form onSubmit={handleSalvar} style={estilos.formulario}>
            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nome *</label>
                <input
                  style={estilos.input}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Magia do Fogo"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Elemento *</label>
                <input
                  style={estilos.input}
                  value={formulario.elemento}
                  onChange={(e) => setFormulario({ ...formulario, elemento: e.target.value })}
                  placeholder="Ex: Fogo, Água, Ar, Terra"
                />
              </div>
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Descrição *</label>
              <textarea
                style={{ ...estilos.input, minHeight: "100px" }}
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                placeholder="Descreva a escola de magia..."
              />
            </div>

            {erro && <p style={estilos.erro}>{erro}</p>}
            {mensagem && <p style={estilos.sucesso}>{mensagem}</p>}

            <div style={estilos.botoesFormulario}>
              <button type="submit" style={estilos.botaoSalvar} disabled={carregando}>
                {carregando ? "Salvando..." : idEditando ? "Atualizar" : "Cadastrar"}
              </button>
              {idEditando && (
                <button type="button" onClick={handleCancelar} style={estilos.botaoCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>Escolas Cadastradas ({escolas.length})</h2>

          {escolas.length === 0 ? (
            <p style={estilos.vazio}>Nenhuma escola de magia cadastrada ainda.</p>
          ) : (
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Elemento</th>
                  <th style={estilos.th}>Descrição</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {escolas.map((escola) => (
                  <tr key={escola.id} style={estilos.tr}>
                    <td style={estilos.td}>{escola.id}</td>
                    <td style={estilos.td}><strong>{escola.nome}</strong></td>
                    <td style={estilos.td}>
                      <span style={estilos.tagElemento}>{escola.elemento}</span>
                    </td>
                    <td style={estilos.td}>{escola.descricao.substring(0, 40)}...</td>
                    <td style={estilos.td}>
                      <button
                        onClick={() => handleEditar(escola)}
                        style={estilos.botaoEditar}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(escola.id)}
                        style={estilos.botaoDeletar}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#0f0e17",
    color: "#fff",
  },
  cabecalho: {
    backgroundColor: "#1a1a2e",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #2e2e4e",
  },
  titulo: {
    color: "#a78bfa",
    fontSize: "22px",
    margin: 0,
  },
  botaoVoltar: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  conteudo: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2e2e4e",
  },
  tituloCard: {
    color: "#a78bfa",
    fontSize: "18px",
    marginTop: 0,
    marginBottom: "20px",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  linhaFormulario: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  input: {
    padding: "10px 12px",
    backgroundColor: "#0f0e17",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  erro: {
    backgroundColor: "#3d1f1f",
    border: "1px solid #8b4545",
    color: "#ffb3b3",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    margin: 0,
  },
  sucesso: {
    backgroundColor: "#1f3d2f",
    border: "1px solid #458b6a",
    color: "#b3ffcc",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    margin: 0,
  },
  botoesFormulario: {
    display: "flex",
    gap: "12px",
  },
  botaoSalvar: {
    padding: "10px 20px",
    backgroundColor: "#a78bfa",
    border: "none",
    borderRadius: "6px",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  botaoCancelar: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "14px",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#0f0e17",
    color: "#a78bfa",
    padding: "12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    borderBottom: "2px solid #2e2e4e",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #2e2e4e",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#ccc",
  },
  vazio: {
    textAlign: "center",
    color: "#666",
    padding: "32px",
    fontSize: "14px",
  },
  tagElemento: {
    backgroundColor: "#5b21b6",
    color: "#e9d5ff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  botaoEditar: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "1px solid #666",
    borderRadius: "4px",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "4px",
  },
  botaoDeletar: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "1px solid #8b4545",
    borderRadius: "4px",
    color: "#ffb3b3",
    cursor: "pointer",
    fontSize: "12px",
  },
};
