import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVgcfnHBjO33xGmml8jkVvydngrYXinPE",
  authDomain: "beneath-05847.firebaseapp.com",
  projectId: "beneath-05847",
  storageBucket: "beneath-05847.firebasestorage.app",
  messagingSenderId: "982086765242",
  appId: "1:982086765242:web:033001cc2a6788616a1083",
  measurementId: "G-Q99N3BQ66X"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const functions = getFunctions(app);
const getPhaseConfig = httpsCallable(functions, "getPhaseConfig");
const validateAnswer = httpsCallable(functions, "validateAnswer");

const phase = {
  phaseId: "fase01",
  needUser: false,
  next: "",
  hints: []
};

let errors = 0;

console.clear();
console.log("%cWelcome.", "color:white;font-size:22px;");
console.log("%cNot everything is visible.", "color:gray;");

/* ── Referências DOM ───────────────────────────────────────────── */
const stage      = document.getElementById("stage");
const login      = document.getElementById("login");
const message    = document.getElementById("message");
const img        = document.getElementById("image");
const behindText = document.getElementById("behind-text");
const userInput  = document.getElementById("user");

async function loadPhaseConfig() {
  try {
    const result = await getPhaseConfig({ phaseId: phase.phaseId });
    Object.assign(phase, result.data);

    if (userInput) {
      userInput.classList.toggle("hidden", !phase.needUser);
    }
  } catch (error) {
    console.error(error);
  }
}

loadPhaseConfig();

/* ── Arrastar imagem ───────────────────────────────────────────── */
let isDragging       = false;
let wasDragged       = false;           // distingue clique de arrasto
let startClientX     = 0;
let startClientY     = 0;
let startImageLeft   = 0;
let startImageTop    = 0;
let currentLeft      = 0;
let currentTop       = 0;
const DRAG_THRESHOLD = 5;               // px mínimos para considerar arrasto

img.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;           // só botão esquerdo
  isDragging    = true;
  wasDragged    = false;
  startClientX  = e.clientX;
  startClientY  = e.clientY;
  startImageLeft = currentLeft;
  startImageTop  = currentTop;
  img.classList.add("grabbing");
  e.preventDefault();                   // impede seleção de texto acidental
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startClientX;
  const dy = e.clientY - startClientY;

  // Marca como arrasto real somente após o threshold
  if (!wasDragged) {
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      wasDragged = true;
    }
  }

  currentLeft = startImageLeft + dx;
  currentTop  = startImageTop + dy;
  img.style.left = currentLeft + "px";
  img.style.top  = currentTop  + "px";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  img.classList.remove("grabbing");
});

// Cancela arrasto se o cursor sair da janela
document.addEventListener("mouseleave", () => {
  if (isDragging) {
    isDragging = false;
    img.classList.remove("grabbing");
  }
});

/* ── Duplo clique: tornar imagem transparente / opaca ─────────── */
// O texto já é visível por baixo — basta controlar a opacidade da imagem.
let revealed = false;

img.addEventListener("dblclick", () => {
  // Ignora se o segundo clique fez parte de um arrasto real
  if (wasDragged) return;

  revealed = !revealed;
  img.style.opacity       = revealed ? "0" : "1";
  img.style.pointerEvents = revealed ? "none" : "auto";
});

/* ── Autenticação ─────────────────────────────────────────────── */
document.getElementById("access").addEventListener("click", () => {
  stage.classList.add("hidden");
  login.classList.remove("hidden");
});

document.getElementById("enter").addEventListener("click", async () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("password").value.trim();

  try {
    const result = await validateAnswer({
      phaseId: phase.phaseId,
      username: u,
      password: p
    });

    if (result.data.ok) {
      window.location.href = result.data.next || phase.next;
      return;
    }

    Object.assign(phase, result.data);
    const hints = phase.hints || [];
    message.textContent = hints[Math.min(errors, hints.length - 1)] || "";
  } catch (error) {
    console.error(error);
  }

  errors++;
});
