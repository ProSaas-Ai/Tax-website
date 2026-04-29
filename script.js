/* =========================================================
   המרכז הארצי לזכויות מס – script.js
   Questionnaire, Score, Webhooks, Form, Accessibility
   ========================================================= */

"use strict";

// ---- Webhook URLs ----
const WEBHOOK_HIGH = "PASTE_HIGH";
const WEBHOOK_LOW  = "PASTE_LOW";

// ---- Questions ----
const QUESTIONS = [
  {
    key: "salary_over_8000",
    text: "האם את/ה או בן/ת הזוג שלך עובד/ת כשכיר/ה והשכר החודשי הוא 8,000 ₪ ומעלה?",
  },
  {
    key: "private_insurance",
    text: "האם אתם משלמים על ביטוחים פרטיים (בריאות, חיים) מעל 150 ₪ בחודש?",
  },
  {
    key: "pension_tax",
    text: "האם משכתם כסף מפנסיה / קרן השתלמות ושולם עליו מס של 35%?",
  },
  {
    key: "changed_job",
    text: "האם שיניתם מקום עבודה בשש השנים האחרונות?",
  },
  {
    key: "children",
    text: "האם יש לכם ילדים מתחת לגיל 18?",
  },
  {
    key: "income_tax",
    text: "האם יורד לכם מס הכנסה מהשכר מדי חודש?",
  },
  {
    key: "changed_address",
    text: "האם שיניתם כתובת מגורים בשש השנים האחרונות?",
  },
  {
    key: "donations",
    text: "האם יש לכם קבלות על תרומות לעמותות מוכרות?",
  },
];

// ---- State ----
const answers = {
  salary_over_8000: null,
  private_insurance: null,
  pension_tax: null,
  changed_job: null,
  children: null,
  income_tax: null,
  changed_address: null,
  donations: null,
};

let currentQuestion = 0;
let isSubmitting = false;

// ---- DOM refs ----
const quizStep    = document.getElementById("quiz-step");
const formStep    = document.getElementById("form-step");
const thankyouStep = document.getElementById("thankyou-step");
const questionArea = document.getElementById("question-area");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const progressWrapper = document.getElementById("progress-bar-wrapper");
const btnBack      = document.getElementById("btn-back");
const leadForm     = document.getElementById("lead-form");
const btnSubmit    = document.getElementById("btn-submit");
const btnSubmitText    = document.getElementById("btn-submit-text");
const btnSubmitLoading = document.getElementById("btn-submit-loading");

// ---- Calculate Score ----
function calcScore() {
  let score = 0;
  if (answers.salary_over_8000) score += 3;
  if (answers.private_insurance) score += 1;
  if (answers.pension_tax)       score += 1;
  if (answers.changed_job)       score += 1;
  if (answers.children)          score += 1;
  if (answers.income_tax)        score += 2;
  if (answers.changed_address)   score += 1;
  if (answers.donations)         score += 1;
  return score;
}

// ---- Determine Webhook & lead status ----
// HIGH  → customer answered YES to Q1 (salary_over_8000) OR Q2 (private_insurance), or both
// LOW   → customer answered NO to BOTH Q1 and Q2 (regardless of all other answers)
function getWebhookConfig() {
  if (answers.salary_over_8000 || answers.private_insurance) {
    return { webhookUrl: WEBHOOK_HIGH, lead_status: "מנגל" };
  }
  return { webhookUrl: WEBHOOK_LOW, lead_status: "שבור" };
}

// ---- Render question ----
function renderQuestion(index) {
  const q = QUESTIONS[index];
  const block = document.createElement("div");
  block.className = "question-block";
  block.setAttribute("aria-live", "polite");

  block.innerHTML = `
    <p class="question-text" id="q-text-${index}">${q.text}</p>
    <div class="answer-btns" role="group" aria-labelledby="q-text-${index}">
      <button class="answer-btn yes-btn" data-answer="true" aria-label="כן – ${q.text}">כן</button>
      <button class="answer-btn no-btn" data-answer="false" aria-label="לא – ${q.text}">לא</button>
    </div>
  `;

  // Clear and inject
  questionArea.innerHTML = "";
  questionArea.appendChild(block);

  // Back button visibility
  btnBack.style.display = index > 0 ? "inline-flex" : "none";

  // Progress
  updateProgress(index);

  // Attach handlers
  block.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", handleAnswer);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAnswer.call(btn, e);
      }
    });
  });
}

// ---- Update progress bar ----
function updateProgress(index) {
  const percent = Math.round((index / QUESTIONS.length) * 100);
  progressFill.style.width = percent + "%";
  progressLabel.textContent = `שאלה ${index + 1} מתוך ${QUESTIONS.length}`;
  progressWrapper.setAttribute("aria-valuenow", index + 1);
}

// ---- Handle answer click ----
function handleAnswer(e) {
  const btn = e.currentTarget || this;
  const raw = btn.dataset.answer;
  const value = raw === "true";

  // Disable both buttons immediately and mark the chosen one
  const parent = btn.closest(".answer-btns");
  if (parent) {
    parent.querySelectorAll(".answer-btn").forEach((b) => {
      b.disabled = true;
    });
  }
  btn.classList.add("selected");

  // Store answer
  const key = QUESTIONS[currentQuestion].key;
  answers[key] = value;

  // Advance after a brief moment so the user sees their selection
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < QUESTIONS.length) {
      renderQuestion(currentQuestion);
    } else {
      showFormStep();
    }
  }, 280);
}

// ---- Show form step ----
function showFormStep() {
  // Progress: 100%
  progressFill.style.width = "100%";
  progressLabel.textContent = "כמעט סיימנו!";
  progressWrapper.setAttribute("aria-valuenow", QUESTIONS.length);

  // Transition
  quizStep.style.display = "none";
  formStep.style.display = "block";
  formStep.removeAttribute("aria-hidden");

  // Focus the form heading
  const heading = formStep.querySelector(".quiz-title");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }
}

// ---- Back button ----
btnBack.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    // Un-set the answer we're going back to
    const key = QUESTIONS[currentQuestion].key;
    answers[key] = null;
    renderQuestion(currentQuestion);
  }
});

// ---- Form Validation ----
function validateForm() {
  let valid = true;
  const nameInput  = document.getElementById("field-name");
  const phoneInput = document.getElementById("field-phone");

  // Reset errors
  document.getElementById("name-error").textContent   = "";
  document.getElementById("phone-error").textContent  = "";
  [nameInput, phoneInput].forEach((el) => el.classList.remove("error"));

  // Name
  const nameVal = nameInput.value.trim();
  if (!nameVal) {
    document.getElementById("name-error").textContent = "נא להזין שם מלא";
    nameInput.classList.add("error");
    valid = false;
  } else if (nameVal.length < 2) {
    document.getElementById("name-error").textContent = "שם חייב להכיל לפחות 2 תווים";
    nameInput.classList.add("error");
    valid = false;
  }

  // Phone – Israeli mobile / landline basic pattern
  const phoneVal = phoneInput.value.trim().replace(/[-\s]/g, "");
  if (!phoneVal) {
    document.getElementById("phone-error").textContent = "נא להזין מספר טלפון";
    phoneInput.classList.add("error");
    valid = false;
  } else if (!/^0[1-9]\d{7,8}$/.test(phoneVal)) {
    document.getElementById("phone-error").textContent = "מספר הטלפון אינו תקין";
    phoneInput.classList.add("error");
    valid = false;
  }

  return valid;
}

// ---- Form Submit ----
leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  if (!validateForm()) return;

  isSubmitting = true;
  btnSubmit.disabled = true;
  btnSubmitText.style.display    = "none";
  btnSubmitLoading.style.display = "inline";

  const name  = document.getElementById("field-name").value.trim();
  const phone = document.getElementById("field-phone").value.trim().replace(/[-\s]/g, "");
  const score = calcScore();
  const { webhookUrl, lead_status } = getWebhookConfig();

  const payload = {
    name,
    phone,
    answers,
    score,
    lead_status,
    consent: true,
    timestamp: new Date().toISOString(),
  };

  try {
    if (webhookUrl && webhookUrl !== "PASTE_HIGH" && webhookUrl !== "PASTE_LOW") {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Dev mode – log instead of sending
      console.log("[Webhook payload – dev mode]", payload);
    }
  } catch (err) {
    console.error("Webhook error:", err);
    // Show thank you regardless – don't block the user
  } finally {
    showThankyou();
  }
});

// ---- Show Thank You ----
function showThankyou() {
  formStep.style.display = "none";
  thankyouStep.style.display = "block";
  thankyouStep.removeAttribute("aria-hidden");

  const heading = thankyouStep.querySelector(".thankyou-title");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }

  // Scroll to top of quiz area
  const quizSection = document.getElementById("questionnaire");
  if (quizSection) {
    quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ---- FAQ Accordion ----
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answerId = btn.getAttribute("aria-controls");
      const answerEl = document.getElementById(answerId);

      // Collapse all
      document.querySelectorAll(".faq-question").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const id = b.getAttribute("aria-controls");
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });

      // Toggle current
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        if (answerEl) answerEl.hidden = false;
      }
    });
  });
}

// ---- Accessibility Widget ----
const a11yToggle = document.getElementById("a11y-toggle");
const a11yPanel  = document.getElementById("a11y-panel");

let a11yState = {
  textLevel: 0,    // 0 = normal, 1 = large, 2 = xl
  contrast: false,
  links: false,
  noAnim: false,
};

function saveA11yState() {
  try {
    localStorage.setItem("ntrc_a11y_state", JSON.stringify(a11yState));
  } catch (_) {}
}

function loadA11yState() {
  try {
    const saved = localStorage.getItem("ntrc_a11y_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      a11yState = { ...a11yState, ...parsed };
      applyA11yState();
    }
  } catch (_) {}
}

function applyA11yState() {
  const body = document.body;
  // Text
  body.classList.remove("a11y-text-lg", "a11y-text-xl");
  if (a11yState.textLevel === 1) body.classList.add("a11y-text-lg");
  if (a11yState.textLevel === 2) body.classList.add("a11y-text-xl");
  // Contrast
  body.classList.toggle("a11y-contrast", a11yState.contrast);
  // Links
  body.classList.toggle("a11y-links", a11yState.links);
  // Animations
  body.classList.toggle("a11y-no-anim", a11yState.noAnim);

  // Update button active states
  toggleBtnActive("a11y-increase-text", a11yState.textLevel > 0);
  toggleBtnActive("a11y-contrast", a11yState.contrast);
  toggleBtnActive("a11y-links", a11yState.links);
  toggleBtnActive("a11y-animations", a11yState.noAnim);
}

function toggleBtnActive(id, active) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("active", active);
}

// Toggle panel
a11yToggle.addEventListener("click", () => {
  const isOpen = a11yPanel.classList.toggle("open");
  a11yToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  a11yPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    const firstBtn = a11yPanel.querySelector(".a11y-option-btn");
    if (firstBtn) firstBtn.focus();
  }
});

// Close panel on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && a11yPanel.classList.contains("open")) {
    a11yPanel.classList.remove("open");
    a11yToggle.setAttribute("aria-expanded", "false");
    a11yPanel.setAttribute("aria-hidden", "true");
    a11yToggle.focus();
  }
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!a11yPanel.contains(e.target) && e.target !== a11yToggle) {
    if (a11yPanel.classList.contains("open")) {
      a11yPanel.classList.remove("open");
      a11yToggle.setAttribute("aria-expanded", "false");
      a11yPanel.setAttribute("aria-hidden", "true");
    }
  }
});

// Accessibility controls
document.getElementById("a11y-increase-text").addEventListener("click", () => {
  a11yState.textLevel = Math.min(a11yState.textLevel + 1, 2);
  applyA11yState();
  saveA11yState();
});

document.getElementById("a11y-decrease-text").addEventListener("click", () => {
  a11yState.textLevel = Math.max(a11yState.textLevel - 1, 0);
  applyA11yState();
  saveA11yState();
});

document.getElementById("a11y-contrast").addEventListener("click", () => {
  a11yState.contrast = !a11yState.contrast;
  applyA11yState();
  saveA11yState();
});

document.getElementById("a11y-links").addEventListener("click", () => {
  a11yState.links = !a11yState.links;
  applyA11yState();
  saveA11yState();
});

document.getElementById("a11y-animations").addEventListener("click", () => {
  a11yState.noAnim = !a11yState.noAnim;
  applyA11yState();
  saveA11yState();
});

document.getElementById("a11y-reset").addEventListener("click", () => {
  a11yState = { textLevel: 0, contrast: false, links: false, noAnim: false };
  applyA11yState();
  saveA11yState();
});

// ---- Footer year ----
const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Init ----
function init() {
  renderQuestion(0);
  initFAQ();
  loadA11yState();
}

// Run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
