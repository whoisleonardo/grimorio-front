import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fazerLogin(email, senha) {
  const resposta = await api.post("/auth/login", { email, senha });
  return resposta.data;
}

export async function buscarUsuarios() {
  const resposta = await api.get("/usuarios");
  return resposta.data;
}

export async function buscarUsuarioPorId(id) {
  const resposta = await api.get(`/usuarios/${id}`);
  return resposta.data;
}

export async function criarUsuario(dados) {
  const resposta = await api.post("/usuarios", dados);
  return resposta.data;
}

export async function atualizarUsuario(id, dados) {
  const resposta = await api.put(`/usuarios/${id}`, dados);
  return resposta.data;
}

export async function deletarUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}
