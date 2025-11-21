(() => {
  const LOGIN_PAGE = 'login.html';
  const LOGIN_PROMPT_STORAGE_KEY = 'loginPromptMessage';
  const LOGIN_REQUIRED_MESSAGE = 'You need to be logged in to rate roads!';

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'browse', label: 'Browse Map', href: 'map-browse.html' },
    { id: 'rate', label: 'Rate', href: 'rate.html', requiresAuth: true, loginMessage: LOGIN_REQUIRED_MESSAGE },
    { id: 'leaderboard', label: 'Leaderboard', href: 'leaderboard.html' }
  ];

  const LINK_BASE_CLASSES = 'text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition';

  const buildNavMarkup = (activeId) => {
    const navLinksHtml = NAV_ITEMS
      .map(({ id, label, href, requiresAuth, loginMessage }) => {
        const isActive = id === activeId;
        const activeClasses = isActive ? ' bg-indigo-700 bg-opacity-80' : '';
        const ariaCurrent = isActive ? ' aria-current="page"' : '';
        const requiresAuthAttr = requiresAuth
          ? ` data-requires-auth="true" data-auth-href="${href}" data-login-message="${loginMessage ?? ''}"`
          : '';

        return `<a href="${href}" data-nav-id="${id}" class="${LINK_BASE_CLASSES}${activeClasses}"${ariaCurrent}${requiresAuthAttr}>${label}</a>`;
      })
      .join('');

    return `
      <header class="bg-indigo-600 shadow-lg">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-3">
              <a href="index.html" class="flex-shrink-0 text-white text-2xl font-bold">RoadRater</a>
              <span data-role="greeting" class="hidden text-indigo-100 text-sm sm:text-base font-semibold tracking-tight"></span>
            </div>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              ${navLinksHtml}
              <a href="${LOGIN_PAGE}" data-role="auth-link" class="${LINK_BASE_CLASSES}">Login</a>
            </div>
          </div>
        </nav>
      </header>
    `;
  };

  const insertNav = () => {
    const placeholder = document.querySelector('[data-component="navbar"]');
    if (!placeholder) return null;

    const template = document.createElement('template');
    template.innerHTML = buildNavMarkup(document.body?.dataset?.activeNav || null).trim();
    const navElement = template.content.firstElementChild;

    placeholder.replaceWith(navElement);
    return navElement;
  };

  const setupAuthHandlers = (navElement) => {
    const authLink = navElement.querySelector('[data-role="auth-link"]');
    const greetingEl = navElement.querySelector('[data-role="greeting"]');
    const protectedLinks = Array.from(navElement.querySelectorAll('[data-requires-auth="true"]'));

    if (!authLink || !greetingEl) return;

    const attachProtectedHandlers = () => {
      protectedLinks.forEach((link) => {
        link.addEventListener('click', () => {
          const token = localStorage.getItem('token');
          if (token) return;
          const message = link.getAttribute('data-login-message');
          if (message) {
            localStorage.setItem(LOGIN_PROMPT_STORAGE_KEY, message);
          } else {
            localStorage.removeItem(LOGIN_PROMPT_STORAGE_KEY);
          }
        });
      });
    };

    const updateAuthUI = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (token && username) {
        greetingEl.textContent = `Hi ${username}`;
        greetingEl.classList.remove('hidden');
        authLink.textContent = 'Logout';
        authLink.dataset.mode = 'logout';
        authLink.setAttribute('href', '#');
        localStorage.removeItem(LOGIN_PROMPT_STORAGE_KEY);
        protectedLinks.forEach((link) => {
          const authHref = link.getAttribute('data-auth-href') || 'index.html';
          link.setAttribute('href', authHref);
          link.removeAttribute('aria-disabled');
          link.removeAttribute('data-needs-login');
          link.removeAttribute('title');
        });
      } else {
        greetingEl.textContent = '';
        greetingEl.classList.add('hidden');
        authLink.textContent = 'Login';
        authLink.dataset.mode = 'login';
        authLink.setAttribute('href', LOGIN_PAGE);
        protectedLinks.forEach((link) => {
          link.setAttribute('href', LOGIN_PAGE);
          link.setAttribute('aria-disabled', 'true');
          link.dataset.needsLogin = 'true';
          if (!link.getAttribute('title')) {
            link.setAttribute('title', 'Please log in to continue');
          }
        });
      }
    };

    authLink.addEventListener('click', (event) => {
      if (authLink.dataset.mode !== 'logout') return;
      event.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      updateAuthUI();
      window.location.href = 'login.html';
    });

    window.addEventListener('storage', (event) => {
      if (event.key === 'token' || event.key === 'username') {
        updateAuthUI();
      }
    });

    updateAuthUI();
    attachProtectedHandlers();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const navElement = insertNav();
    if (navElement) {
      setupAuthHandlers(navElement);
    }
  });
})();
