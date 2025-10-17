import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ⚙️ Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAX2IR9GqzQA4kpw1oofR8j0pmEtqvv76E",
  authDomain: "inventario-ti-ef613.firebaseapp.com",
  projectId: "inventario-ti-ef613",
  storageBucket: "inventario-ti-ef613.appspot.com",
  messagingSenderId: "615081561359",
  appId: "1:615081561359:web:75cf090cee3f0c7baec27a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const maquinasCollection = collection(db, "maquinas");
const tabela = document.getElementById("tabela");

// 🔄 Carregar tabela
async function carregarTabela() {
  tabela.innerHTML = "";
  const querySnapshot = await getDocs(maquinasCollection);
  let id = 1;
  querySnapshot.forEach((docSnap) => {
    const m = docSnap.data();
    const data = m.ultimaAtualizacao
      ? new Date(m.ultimaAtualizacao.seconds * 1000).toLocaleDateString("pt-BR")
      : "—";
    const tipo = m.tipoAtualizacao ? ` (${m.tipoAtualizacao})` : "";

    tabela.innerHTML += `
      <tr>
        <td>${id++}</td>
        <td>${m.nome}</td>
        <td>${m.tipo}</td>
        <td>${m.setor}</td>
        <td>${m.status}</td>
        <td>${m.anydesk || "—"}</td>
        <td>${m.ultimaManutencao || "—"}</td>
        <td>${data}${tipo}</td>
        <td>
          <button class="btn-edit" onclick="editar('${docSnap.id}', '${m.nome}', '${m.tipo}', '${m.setor}', '${m.status}', '${m.anydesk || ""}', '${m.ultimaManutencao || ""}')">Editar</button>
          <button class="btn-del" onclick="excluir('${docSnap.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// ➕ Adicionar máquina
window.adicionarMaquina = async function() {
  const nome = document.getElementById("nome").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const setor = document.getElementById("setor").value.trim();
  const status = document.getElementById("status").value.trim();
  const anydesk = document.getElementById("anydesk").value.trim();
  const ultimaManutencao = document.getElementById("ultimaManutencao").value;

  if (!nome) return alert("Digite o nome do equipamento!");

  await addDoc(maquinasCollection, {
    nome, tipo, setor, status, anydesk, ultimaManutencao,
    ultimaAtualizacao: serverTimestamp(),
    tipoAtualizacao: "Criação"
  });

  document.querySelectorAll("input").forEach(i => i.value = "");
  carregarTabela();
};

// ✏️ Editar máquina
window.editar = async function(id, nome, tipo, setor, status, anydesk, ultimaManutencao) {
  const novoNome = prompt("Novo nome:", nome);
  const novoTipo = prompt("Novo tipo:", tipo);
  const novoSetor = prompt("Novo setor:", setor);
  const novoStatus = prompt("Novo status:", status);
  const novoAnydesk = prompt("Novo Anydesk:", anydesk);
  const novaManutencao = prompt("Nova data de manutenção (AAAA-MM-DD):", ultimaManutencao);

  if (!novoNome) return alert("Campos inválidos!");

  const ref = doc(db, "maquinas", id);
  await updateDoc(ref, {
    nome: novoNome.trim(),
    tipo: novoTipo.trim(),
    setor: novoSetor.trim(),
    status: novoStatus.trim(),
    anydesk: novoAnydesk.trim(),
    ultimaManutencao: novaManutencao.trim(),
    ultimaAtualizacao: serverTimestamp(),
    tipoAtualizacao: "Edição"
  });

  carregarTabela();
};

// ❌ Excluir máquina
window.excluir = async function(id) {
  if (confirm("Excluir este registro?")) {
    await deleteDoc(doc(db, "maquinas", id));
    carregarTabela();
  }
};

// Inicializar tabela
carregarTabela();
