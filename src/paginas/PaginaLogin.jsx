import { useState } from "react";
import { fazerLogin } from "../servicos/api";

export default function PaginaLogin({ aoLogar, irParaRegistro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro("");

    if (!email) return setErro("Email é obrigatório");
    if (!/\S+@\S+\.\S+/.test(email)) return setErro("Email inválido");
    if (!senha) return setErro("Senha é obrigatória");
    if (senha.length < 6) return setErro("Senha deve ter no mínimo 6 caracteres");

    setCarregando(true);
    try {
      const resposta = await fazerLogin(email, senha);
      localStorage.setItem("token", resposta.token);
      localStorage.setItem("nomeUsuario", resposta.nome);
      localStorage.setItem("roleUsuario", resposta.role);
      aoLogar();
    } catch (erro) {
      setErro(erro.response?.data?.mensagem || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.caixa}>
        <h1 style={estilos.titulo}>🔮 Grimório Digital</h1>
        <p style={estilos.subtitulo}>Faça login para continuar</p>

        <form onSubmit={handleSubmit} style={estilos.formulario}>
          <label style={estilos.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={estilos.input}
          />

          <label style={estilos.label}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={estilos.input}
          />

          {erro && <p style={estilos.erro}>{erro}</p>}

          <button type="submit" style={estilos.botao} disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={estilos.linkTexto}>
          Não tem conta?{" "}
          <span onClick={irParaRegistro} style={estilos.link}>
            Criar conta
          </span>
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
