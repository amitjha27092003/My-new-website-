// ================================================================
//   EDUSPHERE — FIREBASE REAL-TIME SYNC (Website Side)
//   Yeh file apni website ke <head> mein add karo
//
//   Kaise use karein:
//   <script type="module" src="firebase-website-sync.js"></script>
// ================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================================================================
//   APNA FIREBASE CONFIG YAHAN PASTE KARO (admin.html jaisa hi)
// ================================================================
const firebaseConfig = {
  apiKey:            "AIzaSyA3YNLYZVPz9h86PfpnzhuInLFPkuCk--A",
  authDomain:        "edusphere-80549.firebaseapp.com",
  projectId:         "edusphere-80549",
  storageBucket:     "edusphere-80549.firebasestorage.app",
  messagingSenderId: "434274785382",
  appId:             "1:434274785382:web:5b3ec4f65bcd9a55e835a7",
  measurementId:     "G-6KFJ3BCHG1"
};
// ================================================================

const app = initializeApp(firebaseConfig, "website");
const db  = getFirestore(app);

// ================================================================
//   REAL-TIME LISTENERS — Admin se changes turant milenge
// ================================================================

/**
 * 1. WEBSITE CONFIG LISTENER
 *    Hero title, subtitle, chips, teacher name etc.
 *    Admin jaise hi save kare → yahan turant apply hoga
 */
onSnapshot(doc(db, "siteSettings", "websiteConfig"), (snap) => {
  if (!snap.exists()) return;
  const cfg = snap.data();

  // Hero title
  if (cfg.heroTitle) {
    document.querySelectorAll('[data-admin="heroTitle"]').forEach(el => {
      el.textContent = cfg.heroTitle;
    });
  }

  // Hero subtitle
  if (cfg.heroSub) {
    document.querySelectorAll('[data-admin="heroSub"]').forEach(el => {
      el.textContent = cfg.heroSub;
    });
  }

  // Teacher name
  if (cfg.teacher) {
    document.querySelectorAll('[data-admin="teacherName"]').forEach(el => {
      el.textContent = cfg.teacher;
    });
  }

  // Welcome message
  if (cfg.welcome) {
    document.querySelectorAll('[data-admin="welcomeMsg"]').forEach(el => {
      el.textContent = cfg.welcome;
    });
  }

  // Site title (browser tab)
  if (cfg.siteTitle) document.title = cfg.siteTitle;

  // Quick chips (topic buttons)
  if (cfg.chips && cfg.chips.length > 0) {
    const chipsContainer = document.querySelector('[data-admin="chipsContainer"]');
    if (chipsContainer) {
      chipsContainer.innerHTML = cfg.chips
        .map(chip => `<button class="chip-btn" onclick="handleChip('${chip}')">${chip}</button>`)
        .join('');
    }
  }

  // Default language
  if (cfg.defLang) {
    const langSel = document.getElementById('languageSelect');
    if (langSel) langSel.value = cfg.defLang;
  }

  // Fire custom event — website apna koi bhi code yahan hook kar sakti hai
  window.dispatchEvent(new CustomEvent('adminConfigUpdate', { detail: cfg }));
  console.log('EduSphere: Admin config update received:', cfg);
});


/**
 * 2. PLANS LISTENER — Subscription plans change hon
 */
onSnapshot(doc(db, "siteSettings", "plans"), (snap) => {
  if (!snap.exists()) return;
  const { list } = snap.data();
  if (!list) return;

  // Pricing cards update
  list.forEach(plan => {
    const priceEl = document.querySelector(`[data-plan="${plan.name}"] [data-admin="planPrice"]`);
    if (priceEl) priceEl.textContent = plan.price === 0 ? 'Free' : '₹' + plan.price;

    const sessEl = document.querySelector(`[data-plan="${plan.name}"] [data-admin="planSessions"]`);
    if (sessEl) sessEl.textContent = plan.sessions + ' sessions';
  });

  window.dispatchEvent(new CustomEvent('adminPlansUpdate', { detail: list }));
  console.log('EduSphere: Plans update received:', list);
});


/**
 * 3. APP SETTINGS LISTENER — Maintenance mode, registrations etc.
 */
onSnapshot(doc(db, "siteSettings", "appSettings"), (snap) => {
  if (!snap.exists()) return;
  const s = snap.data();

  // Maintenance mode
  if (s.maintenance) {
    const overlay = document.getElementById('maintenanceOverlay');
    if (overlay) overlay.style.display = 'flex';
    else {
      // Create maintenance overlay
      const div = document.createElement('div');
      div.id = 'maintenanceOverlay';
      div.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(7,5,26,0.97);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-family:sans-serif;color:white;text-align:center;';
      div.innerHTML = '<div style="font-size:48px">🔧</div><h2 style="font-size:24px;font-weight:900">Website Maintenance Mode</h2><p style="color:#9ca3af;max-width:400px">Admin ne website temporarily band ki hai. Thodi der mein wapas aaiye.</p>';
      document.body.appendChild(div);
    }
  } else {
    const overlay = document.getElementById('maintenanceOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Registration toggle
  if (s.registrations === false) {
    document.querySelectorAll('[data-admin="registerBtn"]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Registration Closed';
    });
  } else {
    document.querySelectorAll('[data-admin="registerBtn"]').forEach(btn => {
      btn.disabled = false;
    });
  }

  window.dispatchEvent(new CustomEvent('adminSettingsUpdate', { detail: s }));
  console.log('EduSphere: Settings update received:', s);
});


/**
 * 4. NOTIFICATIONS LISTENER — Admin blast notifications
 */
onSnapshot(doc(db, "siteSettings", "notifLog"), (snap) => {
  if (!snap.exists()) return;
  const { list } = snap.data();
  if (!list || list.length === 0) return;

  // Latest notification
  const latest = list[0];
  const lastShown = localStorage.getItem('edu_lastNotif');

  if (lastShown !== String(latest.sentAt)) {
    localStorage.setItem('edu_lastNotif', String(latest.sentAt));
    // Show notification toast
    showWebsiteNotif(latest.title, latest.msg);
  }
});


/**
 * 5. TOPICS LISTENER — Chip topics change hon
 */
onSnapshot(doc(db, "siteSettings", "topics"), (snap) => {
  if (!snap.exists()) return;
  const { list } = snap.data();
  window.dispatchEvent(new CustomEvent('adminTopicsUpdate', { detail: list }));
});


// ================================================================
//   WEBSITE → ADMIN PANEL DATA SEND FUNCTIONS
//   Ye functions website se call karo data track karne ke liye
// ================================================================

window.eduSync = {

  /**
   * Session record karo (jab user koi topic start kare)
   */
  async recordSession({ learnerName, learnerId, topic, exam, lang, scenes }) {
    try {
      await addDoc(collection(db, "sessions"), {
        learnerName: learnerName || "Anonymous",
        learnerId:   learnerId   || null,
        topic:       topic       || "",
        exam:        exam        || "",
        lang:        lang        || "Hinglish",
        scenes:      scenes      || 0,
        timestamp:   Date.now(),
        createdAt:   serverTimestamp()
      });
      console.log("Session recorded in Firebase");
    } catch(e) {
      console.error("Session record error:", e);
    }
  },

  /**
   * Feedback record karo
   */
  async recordFeedback({ name, rating, nps, like, exam }) {
    try {
      await addDoc(collection(db, "feedback"), {
        name:        name        || "Anonymous",
        rating:      rating      || 0,
        nps:         nps         || 0,
        like:        like        || "",
        exam:        exam        || "",
        submittedAt: Date.now(),
        createdAt:   serverTimestamp()
      });
      console.log("Feedback recorded in Firebase");
    } catch(e) {
      console.error("Feedback record error:", e);
    }
  },

  /**
   * Learner register karo
   */
  async registerLearner({ name, email, exam, plan }) {
    try {
      const id = Date.now();
      const colors = ['#4338ca','#10b981','#f59e0b','#6366f1','#f43f5e'];
      const ac = colors[Math.floor(Math.random() * colors.length)];
      const ini = (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const learner = { id, name, email, exam: exam||'', plan: plan||'Free', sessions: 0, joinedAt: Date.now(), ac, ini };
      await setDoc(doc(collection(db, "learners"), String(id)), {
        ...learner,
        createdAt: serverTimestamp()
      });
      console.log("Learner registered in Firebase:", name);
      return learner;
    } catch(e) {
      console.error("Register error:", e);
      return null;
    }
  }
};


// ================================================================
//   NOTIFICATION TOAST UI
// ================================================================
function showWebsiteNotif(title, msg) {
  // Agar website mein pehle se koi toast hai toh use use karo
  const existing = document.getElementById('adminNotifToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'adminNotifToast';
  toast.style.cssText = [
    'position:fixed', 'top:20px', 'right:20px', 'z-index:99999',
    'background:linear-gradient(135deg,#0f0d2e,#1e1b4b)',
    'border:1px solid rgba(129,140,248,0.5)',
    'border-radius:16px', 'padding:16px 20px',
    'max-width:340px', 'box-shadow:0 20px 60px rgba(0,0,0,0.6)',
    'display:flex', 'flex-direction:column', 'gap:8px',
    'font-family:sans-serif', 'color:white',
    'transform:translateX(120%)', 'transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'
  ].join(';');

  toast.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 1s infinite"></div>
        <strong style="font-size:13px;color:#a5b4fc">EduSphere Notification</strong>
      </div>
      <button onclick="this.parentElement.parentElement.remove()"
        style="background:none;border:none;color:#6b7280;font-size:16px;cursor:pointer;line-height:1">&#x2715;</button>
    </div>
    <div style="font-size:14px;font-weight:700;color:white">${title}</div>
    <div style="font-size:12px;color:#9ca3af;line-height:1.6">${msg}</div>
  `;

  document.body.appendChild(toast);
  // Animate in
  setTimeout(() => toast.style.transform = 'translateX(0)', 50);
  // Auto remove after 8 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, 8000);
}

console.log('EduSphere Firebase Sync loaded. Admin changes will appear in real-time.');
