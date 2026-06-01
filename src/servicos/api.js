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

// ========== ESCOLAS DE MAGIA ==========

export async function buscarEscolasDeMagia() {
  const resposta = await api.get("/escolasdemagias");
  return resposta.data;
}

export async function buscarEscolaDeMagiaPorId(id) {
  const resposta = await api.get(`/escolasdemagias/${id}`);
  return resposta.data;
}

export async function criarEscolaDeMagia(dados) {
  const resposta = await api.post("/escolasdemagias", dados);
  return resposta.data;
}

export async function atualizarEscolaDeMagia(id, dados) {
  const resposta = await api.put(`/escolasdemagias/${id}`, dados);
  return resposta.data;
}

export async function deletarEscolaDeMagia(id) {
  await api.delete(`/escolasdemagias/${id}`);
}

// ========== INGREDIENTES ==========

export async function buscarIngredientes() {
  const resposta = await api.get("/ingredientes");
  return resposta.data;
}

export async function buscarIngredientePorId(id) {
  const resposta = await api.get(`/ingredientes/${id}`);
  return resposta.data;
}

export async function criarIngrediente(dados) {
  const resposta = await api.post("/ingredientes", dados);
  return resposta.data;
}

export async function atualizarIngrediente(id, dados) {
  const resposta = await api.put(`/ingredientes/${id}`, dados);
  return resposta.data;
}

export async function deletarIngrediente(id) {
  await api.delete(`/ingredientes/${id}`);
}
