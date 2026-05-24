/* =========================================================
   המרכז הארצי לזכויות מס – script.js
   ========================================================= */

"use strict";

// ---- Webhook URLs & Secrets ----
const WEBHOOK_INDEPENDENT        = "https://prosaas.pro/api/webhook/leads/10";
const WEBHOOK_INDEPENDENT_SECRET = "wh_Wp0yoPDpsDUrZWoP7ASta0MNE-56OveSy8rsx3jN0BI";
const WEBHOOK_HIGH               = "https://prosaas.pro/api/webhook/leads/11";
const WEBHOOK_HIGH_SECRET        = "wh_ATHHsbMsQ-6zLWe1HYn5TWJ7bDGnA4CO1qOSAQxBUHU";
const WEBHOOK_LOW                = "https://prosaas.pro/api/webhook/leads/12";
const WEBHOOK_LOW_SECRET         = "wh_zRhXaSIdGiR-G2DX5rDWlWrXQ1nx7GbRYUspBsMSC4s";

// ---- Steps ----
const HAS_PARTNER = (a) => a.family_status === "נשוי/אה" || a.family_status === "ידוע/ה בציבור";

const STEPS = [
  {
    id: "family_status",
    emoji: "👨‍👩‍👧‍👦",
    question: "מה המצב המשפחתי שלך?",
    type: "radio",
    options: ["רווק/ה", "נשוי/אה", "ידוע/ה בציבור", "גרוש/ה", "אלמן/ה"],
    optionEmojis: ["😊", "💍", "🤝", "👤", "💙"],
  },
  {
    id: "age_range",
    emoji: "🎂",
    question: (a) =>
      HAS_PARTNER(a)
        ? "מה טווח הגילאים שלך ושל בן/בת הזוג?"
        : "מה טווח הגיל שלך?",
    type: "radio",
    options: ["18–25", "26–35", "36–45", "46–55", "56–67", "67+"],
    optionEmojis: ["🌱", "✨", "🌟", "💫", "🍃", "🎖️"],
  },
  {
    id: "employment_status",
    emoji: "💼",
    question: "מה המצב התעסוקתי שלך כיום?",
    type: "radio",
    options: ["שכיר/ה", "עצמאי/ת", "מובטל/ת"],
    optionEmojis: ["👔", "🏢", "🔍"],
  },
  {
    id: "spouse_employment",
    emoji: "👫",
    question: "מה המצב התעסוקתי של בן/בת הזוג כיום?",
    type: "radio",
    options: ["שכיר/ה", "עצמאי/ת", "מובטל/ת"],
    optionEmojis: ["👔", "🏢", "🔍"],
    condition: (a) => HAS_PARTNER(a),
  },
  {
    id: "life_events",
    emoji: "📅",
    sectionTitle: "מסך 1 – אירועי חיים",
    question: (a) =>
      HAS_PARTNER(a)
        ? "האם ב־6 השנים האחרונות קרה לך או לבן/בת הזוג אחד או יותר מהדברים הבאים?"
        : "האם ב־6 השנים האחרונות קרה לך אחד או יותר מהדברים הבאים?",
    subtext: "ניתן לסמן כמה אפשרויות – כל אחת עשויה להגדיל את ההחזר שלך",
    type: "checkbox",
    options: [
      "החלפת עבודה",
      "עבודה ב־2 מקומות במקביל",
      "לא עשיתי תיאום מס",
      "חופשת לידה",
      'אבטלה / חל"ת',
      "מילואים",
      "משיכת פנסיה / קרן השתלמות עם מס",
      "תקופה ללא עבודה",
    ],
    optionEmojis: ["🔄", "⚡", "📝", "👶", "📅", "🎖️", "🏦", "🏠"],
    optionDescriptions: [
      "מעבר בין מעסיקים עלול ליצור ניכוי מס עודף",
      "עבודה אצל שני מעסיקים בו-זמנית מחייבת תיאום מס",
      "ללא תיאום מס כל מעסיק מנכה מס באופן עצמאי – לרוב גורם לתשלום יתר",
      "בתקופת חופשת לידה ניכויי המס עשויים להיות גבוהים ממה שנדרש",
      "בתקופת אבטלה ניתן לעתים לקבל החזר על מס שנוכה בשנה",
      "גמל מילואים פטור ממס ויש לו השפעה על חישוב ההחזר",
      "משיכה מוקדמת כרוכה בניכוי מס במקור – ניתן לבדוק השבה",
      "תקופה ללא הכנסה מפחיתה את חבות המס השנתית",
    ],
  },
  {
    id: "personal_circumstances",
    emoji: "👤",
    sectionTitle: "מסך 2 – משפחה וזכויות",
    question: (a) =>
      HAS_PARTNER(a)
        ? "האם אחד או יותר מהדברים הבאים רלוונטיים אליך או לבן/בת הזוג?"
        : "האם אחד או יותר מהדברים הבאים רלוונטיים אליך?",
    subtext: "ניתן לסמן כמה אפשרויות – כל אחת עשויה להגדיל את ההחזר שלך",
    type: "checkbox",
    options: [
      "ילדים מתחת לגיל 18",
      "ילד עם לקות למידה / קצבה / ועדת זכאות",
      "תשלום מזונות",
      "סיום תואר / לימודי מקצוע",
      "חייל משוחרר",
      "שינוי מצב משפחתי (גירושין / נישואין)",
    ],
    optionEmojis: ["👶", "💙", "👨‍👩‍👧", "🎓", "🎖️", "📋"],
    optionDescriptions: [
      "נקודות זיכוי מס על כל ילד מתחת לגיל 18",
      "נקודות זיכוי מיוחדות בגין מוגבלות, קצבת ביטוח לאומי או ועדת זכאות",
      "הוצאות מזונות מוכרות כניכוי לצרכי מס",
      "נקודת זיכוי נוספת עבור תואר אקדמי או לימודי מקצוע שהושלמו",
      "נקודות זיכוי מיוחדות לשנים שלאחר השחרור מהצבא",
      "שינוי מצב אישי משפיע על חישוב נקודות הזיכוי שלך",
    ],
  },
  {
    id: "financial_circumstances",
    emoji: "💰",
    sectionTitle: "מסך 3 – כספים, ביטוחים והשקעות",
    question: (a) =>
      HAS_PARTNER(a)
        ? "האם אחד או יותר מהדברים הבאים רלוונטיים אליך או לבן/בת הזוג?"
        : "האם אחד או יותר מהדברים הבאים רלוונטיים אליך?",
    subtext: "ניתן לסמן כמה אפשרויות – כל אחת עשויה להגדיל את ההחזר שלך",
    options: [
      "השקעות בשוק ההון / מניות",
      "ביטוח חיים / משכנתא / בריאות פרטי",
      "תרומות עם קבלות",
      "מגורים ביישוב מזכה",
      "עבודה ממשלתית / עירייה / גוף ציבורי",
      "מכירת דירה / מגרש ותשלום מס שבח",
    ],
    optionEmojis: ["📈", "🛡️", "🎁", "🏘️", "🏛️", "🏠"],
    optionDescriptions: [
      "ניתן לקזז הפסדים בשוק ההון ולהפחית את חבות המס על רווחי הון",
      "זיכוי מס על פרמיות ביטוח חיים, ריבית משכנתא וביטוח בריאות פרטי",
      "זיכוי מס של 35% על תרומות לגופים מוכרים (בצירוף קבלה)",
      "נקודות זיכוי נוספות לתושבי יישובים בפריפריה ואזורים מועדפים",
      "מאפייני שכר ייחודיים לעובדי מדינה, עירייה וגופים ציבוריים",
      "ייתכן זיכוי כנגד מסים ששולמו על מכירת נכסי מקרקעין",
    ],
    type: "checkbox",
  },
  {
    id: "tax_deducted",
    emoji: "🧾",
    question: (a) =>
      HAS_PARTNER(a)
        ? "האם נוכה לך או לבן/בת הזוג מס בתלושי השכר ב־6 השנים האחרונות?"
        : "האם נוכה לך מס בתלושי השכר ב־6 השנים האחרונות?",
    type: "radio",
    options: ["כן", "לא", "לא יודע"],
    optionEmojis: ["✅", "❌", "🤔"],
  },
  {
    id: "tax_refund_recent",
    emoji: "🔍",
    question: "האם ביצעת בדיקת/החזר מס ב־12 החודשים האחרונים?",
    type: "radio",
    options: ["כן", "לא", "לא יודע"],
    optionEmojis: ["✅", "❌", "🤔"],
  },
  {
    id: "salary_over_8000",
    emoji: "💵",
    question: "האם השכר שלך מעל 8,000 ₪ בחודש?",
    type: "radio",
    options: ["כן", "לא"],
    optionEmojis: ["✅", "❌"],
  },
  {
    id: "spouse_salary_over_8000",
    emoji: "💵",
    question: "האם השכר של בן/בת הזוג מעל 8,000 ₪?",
    type: "radio",
    options: ["כן", "לא"],
    optionEmojis: ["✅", "❌"],
    condition: (a) => HAS_PARTNER(a),
  },
];

// ---- Feedback Messages ----
const FEEDBACK_MESSAGES = [
  "מצוין! כל פרט מקרב אותנו לתוצאה 💪",
  "נראה שיש כאן פוטנציאל אמיתי! ✨",
  "כל הכבוד! המידע הזה ממש עוזר לנו 🎯",
  "מעולה! התמונה מתחילה להתבהר 📊",
  "נראה ממש טוב! אנחנו על הדרך הנכונה 🚀",
  "כל פרט מחשף עוד פוטנציאל להחזר 💡",
  "כל פרט מחזק את הבדיקה שלך 💫",
  "ממשיכים – כל מידע עוזר לנו 📋",
  "זה בדיוק מה שהיינו צריכים לדעת ⚡",
  "ממשיכים לבדיקה המלאה 🏆",
  "כמעט שם! 🎉",
];

const SENSITIVE_FEEDBACK = {
  "אלמן/ה":   ["אנחנו כאן בשבילך, ממשיכים בבדיקה 💙", "תודה על שיתוף הפרטים, נעשה הכל לסייע לך 💙"],
  "גרוש/ה":   ["מידע חשוב לבדיקת הזכאות שלך ✅", "ממשיכים לשאלה הבאה 📋"],
  "מובטל/ת":  ["כל מידע מקדם אותנו לתוצאה טובה 💪", "ממשיכים, כל פרט חשוב לבדיקה 📊"],
  'אבטלה / חל"ת': ["כל פרט עוזר לנו בבדיקה המקיפה 📋", "ממשיכים, המידע מתקבל ✅"],
};

function getFeedback(value) {
  if (value && SENSITIVE_FEEDBACK[value]) {
    const msgs = SENSITIVE_FEEDBACK[value];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  return FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
}

function getRandomFeedback() {
  return FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
}

// ---- Answer Labels (Hebrew) for Webhook ----
const ANSWER_LABELS = {
  family_status:            "מצב משפחתי",
  age_range:                "טווח גיל",
  employment_status:        "מצב תעסוקתי",
  spouse_employment:        "מצב תעסוקתי של בן/בת הזוג",
  life_events:              "אירועים ב־6 השנים האחרונות",
  personal_circumstances:   "נסיבות אישיות",
  financial_circumstances:  "נסיבות כלכליות",
  tax_deducted:             "ניכוי מס בתלוש",
  tax_refund_recent:        "בדיקת/החזר מס ב-12 חודשים אחרונים",
  salary_over_8000:         "שכר מעל 8,000 ₪",
  spouse_salary_over_8000:  "שכר בן/בת הזוג מעל 8,000 ₪",
};

function buildHebrewSummary() {
  const summary = {};
  for (const [key, label] of Object.entries(ANSWER_LABELS)) {
    if (answers[key] !== undefined) {
      const val = answers[key];
      summary[label] = Array.isArray(val) ? val.join(", ") : val;
    }
  }
  return summary;
}

// ---- State ----
const answers = {};
let currentStepIndex = 0;
let stepHistory = [];
let isSubmitting = false;

// ---- A11Y labels ----
const A11Y_SIZE_LABELS = ["רגיל", "גדול", "גדול מאוד"];

// ---- DOM refs ----
const quizStep         = document.getElementById("quiz-step");
const formStep         = document.getElementById("form-step");
const thankyouStep     = document.getElementById("thankyou-step");
const selfEmployedStop = document.getElementById("self-employed-stop");
const questionArea     = document.getElementById("question-area");
const progressFill     = document.getElementById("progress-fill");
const progressLabel    = document.getElementById("progress-label");
const progressWrapper  = document.getElementById("progress-bar-wrapper");
const btnBack          = document.getElementById("btn-back");
const leadForm         = document.getElementById("lead-form");
const btnSubmit        = document.getElementById("btn-submit");
const btnSubmitText    = document.getElementById("btn-submit-text");
const btnSubmitLoading = document.getElementById("btn-submit-loading");

// ---- Helpers ----
function getVisibleSteps() {
  return STEPS.filter((s) => !s.condition || s.condition(answers));
}

function getVisiblePosition(stepIdx) {
  let count = 0;
  for (let i = 0; i <= stepIdx; i++) {
    if (!STEPS[i].condition || STEPS[i].condition(answers)) count++;
  }
  return count;
}

function getNextStepIndex(fromIdx) {
  for (let i = fromIdx + 1; i < STEPS.length; i++) {
    if (!STEPS[i].condition || STEPS[i].condition(answers)) return i;
  }
  return -1;
}

function getRandomFeedback() {
  return FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
}

function getQuestionText(step) {
  const text = typeof step.question === "function" ? step.question(answers) : step.question;
  return step.emoji ? `${step.emoji} ${text}` : text;
}

// ---- Score Calculation ----
function calcScore() {
  let score = 0;
  if (answers.salary_over_8000 === "כן" || answers.spouse_salary_over_8000 === "כן") score += 3;
  if (answers.tax_deducted === "כן") score += 2;

  const life = answers.life_events || [];
  if (life.includes("החלפת עבודה")) score += 1;
  if (life.includes("עבודה ב־2 מקומות במקביל")) score += 1;
  if (life.includes("לא עשיתי תיאום מס")) score += 1;
  if (life.includes("חופשת לידה")) score += 1;
  if (life.includes("משיכת פנסיה / קרן השתלמות עם מס")) score += 1;

  const personal = answers.personal_circumstances || [];
  if (personal.includes("ילדים מתחת לגיל 18")) score += 1;
  if (personal.includes("ילד עם לקות למידה / קצבה / ועדת זכאות")) score += 1;
  if (personal.includes("חייל משוחרר")) score += 1;
  if (personal.includes("סיום תואר / לימודי מקצוע")) score += 1;

  const financial = answers.financial_circumstances || [];
  if (financial.includes("ביטוח חיים / משכנתא / בריאות פרטי")) score += 1;
  if (financial.includes("תרומות עם קבלות")) score += 1;
  if (financial.includes("השקעות בשוק ההון / מניות")) score += 1;
  if (financial.includes("מכירת דירה / מגרש ותשלום מס שבח")) score += 1;
  if (financial.includes("מגורים ביישוב מזכה")) score += 1;

  return score;
}

// ---- Determine Webhook (INDEPENDENT / HIGH / LOW) ----
// INDEPENDENT → self-employed client (and partner if applicable, both must be self-employed)
// HIGH        → at least one person earns over 8,000 ₪
// LOW         → all relevant persons earn under 8,000 ₪
function getWebhookConfig() {
  const clientSelfEmployed = answers.employment_status === "עצמאי/ת";
  const spouseSelfEmployed = answers.spouse_employment === "עצמאי/ת";

  if (!HAS_PARTNER(answers)) {
    if (clientSelfEmployed) {
      return { webhookUrl: WEBHOOK_INDEPENDENT, secret: WEBHOOK_INDEPENDENT_SECRET };
    }
  } else {
    if (clientSelfEmployed && spouseSelfEmployed) {
      return { webhookUrl: WEBHOOK_INDEPENDENT, secret: WEBHOOK_INDEPENDENT_SECRET };
    }
  }

  if (answers.salary_over_8000 === "כן" || answers.spouse_salary_over_8000 === "כן") {
    return { webhookUrl: WEBHOOK_HIGH, secret: WEBHOOK_HIGH_SECRET };
  }
  return { webhookUrl: WEBHOOK_LOW, secret: WEBHOOK_LOW_SECRET };
}

// ---- Update Progress Bar ----
function updateProgress(stepIdx) {
  const total = getVisibleSteps().length;
  const current = getVisiblePosition(stepIdx);
  const percent = Math.round(((current - 1) / total) * 100);
  progressFill.style.width = percent + "%";
  progressLabel.textContent = `שאלה ${current} מתוך ${total}`;
  progressWrapper.setAttribute("aria-valuenow", current);
  progressWrapper.setAttribute("aria-valuemax", total);
}

// ---- Show Feedback Toast ----
function showFeedback(msg) {
  const old = questionArea.querySelector(".feedback-toast");
  if (old) old.remove();

  const el = document.createElement("div");
  el.className = "feedback-toast";
  el.setAttribute("aria-live", "polite");
  el.textContent = msg;
  questionArea.appendChild(el);
  // CSS handles fade-in / fade-out via animation
}

// ---- Render Question ----
function renderQuestion(idx) {
  const step = STEPS[idx];
  questionArea.innerHTML = "";
  updateProgress(idx);
  btnBack.style.display = stepHistory.length > 0 ? "inline-flex" : "none";

  const block = document.createElement("div");
  block.className = "question-block";

  if (step.type === "radio") {
    block.innerHTML = `
      <p class="question-text" id="q-text-${idx}">${getQuestionText(step)}</p>
      <div class="answer-options" role="group" aria-labelledby="q-text-${idx}">
        ${step.options
          .map(
            (opt, i) => `
          <button class="answer-option-btn" data-value="${opt}" aria-label="${opt}">
            ${step.optionEmojis ? `<span class="option-emoji" aria-hidden="true">${step.optionEmojis[i]}</span>` : ""}${opt}
          </button>
        `
          )
          .join("")}
      </div>
    `;
    questionArea.appendChild(block);
    block.querySelectorAll(".answer-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleRadioAnswer(idx, btn.dataset.value));
    });
  } else {
    // checkbox
    const saved = answers[step.id] || [];
    block.innerHTML = `
      ${step.sectionTitle ? `<div class="section-screen-title">${step.sectionTitle}</div>` : ""}
      <p class="question-text" id="q-text-${idx}">${getQuestionText(step)}</p>
      ${step.subtext ? `<p class="question-subtext">${step.subtext}</p>` : ""}
      <div class="checkbox-options" role="group" aria-labelledby="q-text-${idx}">
        ${step.options
          .map(
            (opt, i) => `
          <label class="checkbox-option${saved.includes(opt) ? " selected" : ""}${step.optionDescriptions ? " has-desc" : ""}">
            <input type="checkbox" value="${opt}"${saved.includes(opt) ? " checked" : ""} />
            <span class="checkbox-label">${step.optionEmojis ? `<span class="option-emoji" aria-hidden="true">${step.optionEmojis[i]}</span>` : ""}${step.optionDescriptions ? `<span class="option-text"><span class="option-title">${opt}</span><span class="option-desc">${step.optionDescriptions[i]}</span></span>` : opt}</span>
          </label>
        `
          )
          .join("")}
      </div>
      <button class="btn btn-primary btn-continue" id="btn-continue">המשך ←</button>
    `;
    questionArea.appendChild(block);

    const checkboxes = block.querySelectorAll('input[type="checkbox"]');
    const noneOpt = step.noneOption;

    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        if (noneOpt && cb.value === noneOpt && cb.checked) {
          checkboxes.forEach((o) => {
            if (o !== cb) {
              o.checked = false;
              o.closest(".checkbox-option").classList.remove("selected");
            }
          });
        } else if (noneOpt && cb.value !== noneOpt && cb.checked) {
          checkboxes.forEach((o) => {
            if (o.value === noneOpt) {
              o.checked = false;
              o.closest(".checkbox-option").classList.remove("selected");
            }
          });
        }
        cb.closest(".checkbox-option").classList.toggle("selected", cb.checked);
      });
    });

    block.querySelector("#btn-continue").addEventListener("click", () => handleCheckboxAnswer(idx));
  }
}

// ---- Handle Radio Answer ----
function handleRadioAnswer(stepIdx, value) {
  const step = STEPS[stepIdx];

  // Mark selected & disable
  questionArea.querySelectorAll(".answer-option-btn").forEach((b) => {
    b.disabled = true;
    if (b.dataset.value === value) b.classList.add("selected");
  });

  answers[step.id] = value;
  showFeedback(getFeedback(value));

  setTimeout(() => {
    stepHistory.push(stepIdx);
    const next = getNextStepIndex(stepIdx);
    if (next === -1) {
      showFormStep();
    } else {
      currentStepIndex = next;
      renderQuestion(next);
    }
  }, 700);
}

// ---- Handle Checkbox Answer ----
function handleCheckboxAnswer(stepIdx) {
  const step = STEPS[stepIdx];
  const checked = Array.from(questionArea.querySelectorAll('input[type="checkbox"]:checked')).map(
    (cb) => cb.value
  );

  if (checked.length === 0) {
    let hint = questionArea.querySelector(".checkbox-hint");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "checkbox-hint";
      hint.textContent = "נא לבחור לפחות תשובה אחת";
      const continueBtn = questionArea.querySelector("#btn-continue");
      continueBtn.insertAdjacentElement("beforebegin", hint);
    }
    return;
  }

  answers[step.id] = checked;
  const continueBtn = questionArea.querySelector("#btn-continue");
  if (continueBtn) continueBtn.disabled = true;

  showFeedback(getRandomFeedback());

  setTimeout(() => {
    stepHistory.push(stepIdx);
    const next = getNextStepIndex(stepIdx);
    if (next === -1) {
      showFormStep();
    } else {
      currentStepIndex = next;
      renderQuestion(next);
    }
  }, 700);
}

// ---- Show Self-Employed Stop ----
function showSelfEmployedStop() {
  quizStep.style.display = "none";
  selfEmployedStop.style.display = "block";
  selfEmployedStop.removeAttribute("aria-hidden");

  const heading = selfEmployedStop.querySelector("h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }

  const section = document.getElementById("questionnaire");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Show Form Step ----
function showFormStep() {
  progressFill.style.width = "100%";
  progressLabel.textContent = "כמעט סיימנו!";

  quizStep.style.display = "none";
  formStep.style.display = "block";
  formStep.removeAttribute("aria-hidden");

  const section = document.getElementById("questionnaire");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });

  const heading = formStep.querySelector(".quiz-title");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    setTimeout(() => heading.focus(), 400);
  }
}

// ---- Back Button ----
btnBack.addEventListener("click", () => {
  if (stepHistory.length > 0) {
    const prevIdx = stepHistory.pop();
    delete answers[STEPS[currentStepIndex].id];
    currentStepIndex = prevIdx;
    renderQuestion(prevIdx);
  }
});

// ---- Form Validation ----
function validateForm() {
  let valid = true;
  const nameInput       = document.getElementById("field-name");
  const phoneInput      = document.getElementById("field-phone");
  const consentCheckbox = document.getElementById("consent-checkbox");

  document.getElementById("name-error").textContent    = "";
  document.getElementById("phone-error").textContent   = "";
  document.getElementById("consent-error").textContent = "";
  [nameInput, phoneInput, consentCheckbox].forEach((el) => el.classList.remove("error"));

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

  if (!consentCheckbox.checked) {
    document.getElementById("consent-error").textContent = "יש לאשר את ההצהרה לפני השליחה";
    consentCheckbox.classList.add("error");
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
  const { webhookUrl, secret } = getWebhookConfig();

  const payload = {
    name,
    phone,
    answers,
    answers_hebrew: buildHebrewSummary(),
    score,
    consent: true,
    timestamp: new Date().toISOString(),
  };

  const sendUrl = new URL(webhookUrl);
  sendUrl.searchParams.set("secret", secret);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Secret": secret },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (_) {
    try {
      await fetch(sendUrl.toString(), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (err) {
      console.error("Webhook error:", err);
    }
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

  const section = document.getElementById("questionnaire");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- FAQ Accordion ----
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answerId = btn.getAttribute("aria-controls");
      const answerEl = document.getElementById(answerId);

      document.querySelectorAll(".faq-question").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const id = b.getAttribute("aria-controls");
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });

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

let a11yState = { textLevel: 0, contrast: false, links: false, noAnim: false };

function saveA11yState() {
  try { localStorage.setItem("ntrc_a11y_state", JSON.stringify(a11yState)); } catch (_) {}
}

function loadA11yState() {
  try {
    const saved = localStorage.getItem("ntrc_a11y_state");
    if (saved) {
      a11yState = { ...a11yState, ...JSON.parse(saved) };
      applyA11yState();
    }
  } catch (_) {}
}

function applyA11yState() {
  const html = document.documentElement;
  html.classList.remove("a11y-text-lg", "a11y-text-xl");
  if (a11yState.textLevel === 1) html.classList.add("a11y-text-lg");
  if (a11yState.textLevel === 2) html.classList.add("a11y-text-xl");

  document.body.classList.toggle("a11y-contrast", a11yState.contrast);
  document.body.classList.toggle("a11y-links", a11yState.links);
  document.body.classList.toggle("a11y-no-anim", a11yState.noAnim);

  toggleBtnActive("a11y-contrast", a11yState.contrast);
  toggleBtnActive("a11y-links", a11yState.links);
  toggleBtnActive("a11y-animations", a11yState.noAnim);

  const indicator = document.getElementById("a11y-size-display");
  if (indicator) indicator.textContent = A11Y_SIZE_LABELS[a11yState.textLevel] || A11Y_SIZE_LABELS[0];

  const decreaseBtn = document.getElementById("a11y-decrease-text");
  const increaseBtn = document.getElementById("a11y-increase-text");
  if (decreaseBtn) decreaseBtn.disabled = a11yState.textLevel === 0;
  if (increaseBtn) increaseBtn.disabled = a11yState.textLevel === 2;
}

function toggleBtnActive(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("active", active);
  if (el.getAttribute("role") === "switch") el.setAttribute("aria-checked", active ? "true" : "false");
}

const FOCUSABLE_SELECTOR = "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
let panelFocusable = [];

a11yToggle.addEventListener("click", () => {
  const isOpen = a11yPanel.classList.toggle("open");
  a11yToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  a11yToggle.setAttribute("aria-label", isOpen ? "סגור תפריט נגישות" : "פתח תפריט נגישות");
  a11yPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    panelFocusable = Array.from(a11yPanel.querySelectorAll(FOCUSABLE_SELECTOR));
    const closeBtn = document.getElementById("a11y-close");
    if (closeBtn) closeBtn.focus();
    else { const first = a11yPanel.querySelector("button"); if (first) first.focus(); }
  }
});

document.getElementById("a11y-close").addEventListener("click", () => {
  a11yPanel.classList.remove("open");
  a11yToggle.setAttribute("aria-expanded", "false");
  a11yToggle.setAttribute("aria-label", "פתח תפריט נגישות");
  a11yPanel.setAttribute("aria-hidden", "true");
  a11yToggle.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && a11yPanel.classList.contains("open")) {
    a11yPanel.classList.remove("open");
    a11yToggle.setAttribute("aria-expanded", "false");
    a11yToggle.setAttribute("aria-label", "פתח תפריט נגישות");
    a11yPanel.setAttribute("aria-hidden", "true");
    a11yToggle.focus();
  }
});

a11yPanel.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !panelFocusable.length) return;
  const first = panelFocusable[0];
  const last  = panelFocusable[panelFocusable.length - 1];
  if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
  else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
});

document.addEventListener("click", (e) => {
  if (!a11yPanel.contains(e.target) && e.target !== a11yToggle && a11yPanel.classList.contains("open")) {
    a11yPanel.classList.remove("open");
    a11yToggle.setAttribute("aria-expanded", "false");
    a11yToggle.setAttribute("aria-label", "פתח תפריט נגישות");
    a11yPanel.setAttribute("aria-hidden", "true");
  }
});

document.getElementById("a11y-increase-text").addEventListener("click", () => {
  a11yState.textLevel = Math.min(a11yState.textLevel + 1, 2); applyA11yState(); saveA11yState();
});
document.getElementById("a11y-decrease-text").addEventListener("click", () => {
  a11yState.textLevel = Math.max(a11yState.textLevel - 1, 0); applyA11yState(); saveA11yState();
});
document.getElementById("a11y-contrast").addEventListener("click", () => {
  a11yState.contrast = !a11yState.contrast; applyA11yState(); saveA11yState();
});
document.getElementById("a11y-links").addEventListener("click", () => {
  a11yState.links = !a11yState.links; applyA11yState(); saveA11yState();
});
document.getElementById("a11y-animations").addEventListener("click", () => {
  a11yState.noAnim = !a11yState.noAnim; applyA11yState(); saveA11yState();
});
document.getElementById("a11y-reset").addEventListener("click", () => {
  a11yState = { textLevel: 0, contrast: false, links: false, noAnim: false };
  document.documentElement.classList.remove("a11y-text-lg", "a11y-text-xl");
  applyA11yState(); saveA11yState();
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
