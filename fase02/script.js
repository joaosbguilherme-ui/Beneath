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
  phaseId: "fase02",
  needUser: true,
  next: "",
  hints: []
};

let errors = 0;

console.clear();
console.log("%cWelcome.", "color:white;font-size:22px;");
console.log("%cNot everything is visible.", "color:gray;");

const stage = document.getElementById("stage");
const login = document.getElementById("login");
const message = document.getElementById("message");
const userInput = document.getElementById("user");

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