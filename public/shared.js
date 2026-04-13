/**
 * shared.js
 * Reusable utilities injected into every page:
 *  - Header auth state (logged-in vs logged-out buttons)
 *  - Logout
 *  - Dropdown hover behaviour
 *  - Footer HTML
 *
 * Usage: add <script src="shared.js"></script> at the end of <body>
 * then call initShared() or let DOMContentLoaded handle it automatically.
 */

// ─── Auth ──────────────────────────────────────────────────────────────────────
function updateHeaderAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole   = localStorage.getItem("userRole");
  const fullName   = localStorage.getItem("fullName") || "User";
  const headerButtons = document.querySelector("header > div:last-child");

  if (!headerButtons) return;

  if (isLoggedIn && userRole) {
    const dashboardLink = userRole === "admin"
      ? "admin-dashboard.html"
      : "creator-dashboard.html";

    headerButtons.innerHTML = `
      <span style="font-weight:bold;color:#8b0000;">Welcome, ${fullName}</span>
      <a href="${dashboardLink}" style="text-decoration:none;">
        <button class="login-btn" style="display:flex;align-items:center;gap:0.4rem;">
          <span style="font-size:1.1rem;">👤</span> My Account
        </button>
      </a>
      <button class="login-btn" onclick="samraLogout()">Log Out</button>
    `;
  } else {
    headerButtons.innerHTML = `
      <a href="creator-login.html"><button class="login-btn">Log in As Creator</button></a>
      <a href="admin-login.html"><button class="login-btn">Log in As Admin</button></a>
    `;
  }
}

function samraLogout() {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("fullName");
    window.location.href = "index.html";
  }
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
// CSS handles hover/focus-within; this adds keyboard support for older pages
// that still use the <li tabindex> pattern.
function initDropdown() {
  const storiesItem = document.querySelector(".has-dropdown, .nav-list li:nth-child(3)");
  if (!storiesItem) return;
  const dropdown = storiesItem.querySelector(".dropdown");
  if (!dropdown) return;

  // Keyboard: Enter/Space on the toggle button opens dropdown
  const toggle = storiesItem.querySelector(".dropdown-toggle");
  if (toggle) {
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const isOpen = dropdown.style.display === "block";
        dropdown.style.display = isOpen ? "none" : "block";
      }
      if (e.key === "Escape") dropdown.style.display = "none";
    });
  }
}

// ─── Footer HTML ──────────────────────────────────────────────────────────────
function injectFooter() {
  const existing = document.querySelector("footer");
  if (!existing) return;

  existing.style.cssText = "background-color:#4b2c2c;color:white;padding:2rem 1rem;";
  existing.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-around;gap:2rem;">
      <div style="flex:1 1 200px;">
        <h4 style="color:#facc15;">Samra</h4>
        <p>Digitally preserving Saudi Arabia's oral heritage through community storytelling and cultural events.</p>
      </div>
      <div style="flex:1 1 150px;">
        <h4 style="color:#facc15;">Libraries</h4>
        <ul style="list-style:none;padding:0;">
          <li><a href="riyadh-library.html"  style="color:white;text-decoration:none;">Riyadh</a></li>
          <li><a href="dhahran-library.html" style="color:white;text-decoration:none;">Ash Sharqiyah</a></li>
          <li><a href="popular-stories.html" style="color:white;text-decoration:none;">Popular Stories</a></li>
        </ul>
      </div>
      <div style="flex:1 1 150px;">
        <h4 style="color:#facc15;">Useful Links</h4>
        <ul style="list-style:none;padding:0;">
          <li><a href="map.html"           style="color:white;text-decoration:none;">View Map</a></li>
          <li><a href="creator-login.html" style="color:white;text-decoration:none;">Creator Login</a></li>
          <li><a href="admin-login.html"   style="color:white;text-decoration:none;">Admin Login</a></li>
        </ul>
      </div>
      <div style="flex:1 1 200px;">
        <h4 style="color:#facc15;">Contact</h4>
        <p>📍 Dhahran, Saudi Arabia</p>
        <p>✉ info@samra.org</p>
        <p>📞 +966 500 000 000</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:2rem;border-top:1px solid #aa7f5c;padding-top:1rem;">
      &copy; 2025 Samra. All rights reserved.
    </div>
  `;
}

// ─── Card builder ─────────────────────────────────────────────────────────────
/**
 * Build a story/event card element from a SAMRA_STORIES entry.
 * @param {Object} story
 * @param {boolean} showJoinBtn  – true for events on popular/homepage
 * @returns {HTMLElement}
 */
function buildStoryCard(story, showJoinBtn = false) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const link = document.createElement("a");
  link.href = story.url;
  link.className = "card-link";
  link.style.textDecoration = "none";
  link.style.color = "inherit";

  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-type", story.type);
  card.setAttribute("data-genre", story.genre.toLowerCase());

  const img = document.createElement("img");
  img.src = story.image;
  img.alt = story.title;
  img.loading = "lazy";

  const content = document.createElement("div");
  content.className = "card-content";

  const badge = document.createElement("strong");
  badge.textContent = story.genre;

  const title = document.createElement("h4");
  title.textContent = story.title;

  const meta = document.createElement("p");
  meta.innerHTML = story.excerpt;

  const author = document.createElement("span");
  author.innerHTML = `${story.author}<br><i>${story.authorTitle}</i>`;

  content.appendChild(badge);
  content.appendChild(title);
  content.appendChild(meta);
  content.appendChild(author);

  if (showJoinBtn && story.type === "event") {
    const btn = document.createElement("button");
    btn.className = "join-btn";
    btn.textContent = "Join";
    btn.style.marginTop = "0.75rem";

    if (!isLoggedIn) {
      btn.style.opacity = "0.4";
      btn.style.cursor = "not-allowed";
      btn.title = "You must log in to join.";
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLoggedIn) {
        alert("⚠️ You must log in to join an event.");
        return;
      }
      btn.classList.toggle("joined");
      btn.textContent = btn.classList.contains("joined") ? "Joined" : "Join";
    });

    content.appendChild(btn);
  }

  card.appendChild(img);
  card.appendChild(content);
  link.appendChild(card);
  return link;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderAuth();
  initDropdown();
  injectFooter();
});
