import { useState, useEffect } from "react";
import {
  buscarIngredientes,
  criarIngrediente,
  atualizarIngrediente,
  deletarIngrediente,
} from "../servicos/api";

const FORM_VAZIO = { nome: "", descricao: "", raridade: "Comum", quantidade: 0 };
const RARIDADES = ["Comum", "Incomum", "Raro", "Lendario"];

export default function PaginaIngredientes({ aoVoltar }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [formulario, setFormulario] = useState(FORM_VAZIO);
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarIngredientes();
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(t);
  }, [mensagem]);

  async function carregarIngredientes() {
    try {
      const lista = await buscarIngredientes();
      setIngredientes(lista);
    } catch (erro) {
      setErro("Erro ao carregar ingredientes: " + erro.message);
    }
  }

  function validarFormulario() {
    if (!formulario.nome || formulario.nome.length < 3)
      return "Nome deve ter no mínimo 3 caracteres";
    if (!formulario.descricao || formulario.descricao.length < 10)
      return "Descrição deve ter no mínimo 10 caracteres";
    if (!formulario.raridade)
      return "Raridade é obrigatória";
    if (formulario.quantidade < 0)
      return "Quantidade não pode ser negativa";
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
        await atualizarIngrediente(idEditando, {
          ...formulario,
          quantidade: parseInt(formulario.quantidade),
        });
        setMensagem("Ingrediente atualizado com sucesso!");
      } else {
        await criarIngrediente({
          ...formulario,
          quantidade: parseInt(formulario.quantidade),
        });
        setMensagem("Ingrediente cadastrado com sucesso!");
      }
      setFormulario(FORM_VAZIO);
      setIdEditando(null);
      await carregarIngredientes();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || 'Erro na operação');
    } finally {
      setCarregando(false);
    }
  }

  function handleEditar(ingrediente) {
    setIdEditando(ingrediente.id);
    setFormulario({
      nome: ingrediente.nome,
      descricao: ingrediente.descricao,
      raridade: ingrediente.raridade,
      quantidade: ingrediente.quantidade,
    });
    setErro("");
    setMensagem("");
  }

  async function handleDeletar(id) {
    if (!confirm("Tem certeza que deseja excluir este ingrediente?")) return;
    setErro("");
    try {
      await deletarIngrediente(id);
      setMensagem("Ingrediente excluído com sucesso!");
      await carregarIngredientes();
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

  function getCores(raridade) {
    const cores = {
      "Comum": "#666",
      "Incomum": "#3b82f6",
      "Raro": "#a855f7",
      "Lendario": "#f59e0b",
    };
    return cores[raridade] || "#666";
  }

  return (
    <div style={estilos.pagina}>
      {/* Cabeçalho */}
      <div style={estilos.cabecalho}>
        <h1 style={estilos.titulo}>🧪 Ingredientes</h1>
        <button onClick={aoVoltar} style={estilos.botaoVoltar}>← Voltar</button>
      </div>

      <div style={estilos.conteudo}>
        {/* Formulário */}
        <div style={estilos.card}>
          <h2 style={estilos.tituloCard}>
            {idEditando ? "Editar Ingrediente" : "Novo Ingrediente"}
          </h2>

          <form onSubmit={handleSalvar} style={estilos.formulario}>
            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Nome *</label>
                <input
                  style={estilos.input}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Poeira de Estrela"
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.label}>Raridade *</label>
                <select
                  style={estilos.input}
                  value={formulario.raridade}
                  onChange={(e) => setFormulario({ ...formulario, raridade: e.target.value })}
                >
                  {RARIDADES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={estilos.linhaFormulario}>
              <div style={estilos.campo}>
                <label style={estilos.label}>Quantidade *</label>
                <input
                  type="number"
                  min="0"
                  style={estilos.input}
                  value={formulario.quantidade}
                  onChange={(e) => setFormulario({ ...formulario, quantidade: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Descrição *</label>
              <textarea
                style={{ ...estilos.input, minHeight: "100px" }}
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                placeholder="Descreva o ingrediente..."
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
          <h2 style={estilos.tituloCard}>Ingredientes Cadastrados ({ingredientes.length})</h2>

          {ingredientes.length === 0 ? (
            <p style={estilos.vazio}>Nenhum ingrediente cadastrado ainda.</p>
          ) : (
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Raridade</th>
                  <th style={estilos.th}>Quantidade</th>
                  <th style={estilos.th}>Descrição</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ingrediente) => (
                  <tr key={ingrediente.id} style={estilos.tr}>
                    <td style={estilos.td}>{ingrediente.id}</td>
                    <td style={estilos.td}><strong>{ingrediente.nome}</strong></td>
                    <td style={estilos.td}>
                      <span
                        style={{
                          ...estilos.tagRaridade,
                          borderColor: getCores(ingrediente.raridade),
                          color: getCores(ingrediente.raridade),
                        }}
                      >
                        {ingrediente.raridade}
                      </span>
                    </td>
                    <td style={estilos.td}>{ingrediente.quantidade}</td>
                    <td style={estilos.td}>{ingrediente.descricao.substring(0, 40)}...</td>
                    <td style={estilos.td}>
                      <button
                        onClick={() => handleEditar(ingrediente)}
                        style={estilos.botaoEditar}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(ingrediente.id)}
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
  tagRaridade: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid",
    display: "inline-block",
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
