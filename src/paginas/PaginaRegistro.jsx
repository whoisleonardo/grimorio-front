import { useState } from "react";
import { criarUsuario } from "../servicos/api";

export default function PaginaRegistro({ aoRegistrar, irParaLogin }) {
  const [formulario, setFormulario] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro("");

    if (!formulario.nome || formulario.nome.length < 2) return setErro("Nome deve ter no mínimo 2 caracteres");
    if (!formulario.email || !/\S+@\S+\.\S+/.test(formulario.email)) return setErro("Email inválido");
    if (!formulario.senha || formulario.senha.length < 6) return setErro("Senha deve ter no mínimo 6 caracteres");
    if (formulario.senha !== formulario.confirmarSenha) return setErro("As senhas não coincidem");

    setCarregando(true);
    try {
      await criarUsuario({ nome: formulario.nome, email: formulario.email, senha: formulario.senha });
      aoRegistrar();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || "Erro ao criar conta");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.caixa}>
        <h1 style={estilos.titulo}>🔮 Grimório Digital</h1>
        <p style={estilos.subtitulo}>Crie sua conta</p>

        <form onSubmit={handleSubmit} style={estilos.formulario}>
          <label style={estilos.label}>Nome *</label>
          <input style={estilos.input} value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} placeholder="Seu nome completo" />

          <label style={estilos.label}>Email *</label>
          <input type="email" style={estilos.input} value={formulario.email} onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} placeholder="seu@email.com" />

          <label style={estilos.label}>Senha *</label>
          <input type="password" style={estilos.input} value={formulario.senha} onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })} placeholder="Mínimo 6 caracteres" />

          <label style={estilos.label}>Confirmar Senha *</label>
          <input type="password" style={estilos.input} value={formulario.confirmarSenha} onChange={(e) => setFormulario({ ...formulario, confirmarSenha: e.target.value })} placeholder="Repita a senha" />

          {erro && <p style={estilos.erro}>{erro}</p>}

          <button type="submit" style={estilos.botao} disabled={carregando}>
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p style={estilos.linkTexto}>
          Já tem conta?{" "}
          <span onClick={irParaLogin} style={estilos.link}>Fazer login</span>
        </p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f0e17" },
  caixa: { backgroundColor: "#1a1a2e", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid #2e2e4e" },
  titulo: { color: "#a78bfa", textAlign: "center", marginBottom: "8px", fontSize: "28px" },
  subtitulo: { color: "#888", textAlign: "center", marginBottom: "32px", fontSize: "14px" },
  formulario: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#ccc", fontSize: "14px", marginTop: "8px" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #2e2e4e", backgroundColor: "#0f0e17", color: "#fff", fontSize: "15px", outline: "none" },
  erro: { color: "#f87171", fontSize: "13px", marginTop: "4px" },
  botao: { marginTop: "16px", padding: "12px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  linkTexto: { color: "#888", textAlign: "center", marginTop: "20px", fontSize: "14px" },
  link: { color: "#a78bfa", cursor: "pointer", textDecoration: "underline" },
};
