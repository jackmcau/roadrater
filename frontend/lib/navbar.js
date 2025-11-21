(() => {
  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'browse', label: 'Browse Map', href: 'map-browse.html' },
    { id: 'rate', label: 'Rate', href: 'rate.html' },
    { id: 'leaderboard', label: 'Leaderboard', href: 'leaderboard.html' }
  ];

  const LINK_BASE_CLASSES = 'text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition';

  const buildNavMarkup = (activeId) => {
    const navLinksHtml = NAV_ITEMS
      .map(({ id, label, href }) => {
        const isActive = id === activeId;
  const activeClasses = isActive ? ' bg-indigo-700 bg-opacity-80' : '';
        const ariaCurrent = isActive ? ' aria-current="page"' : '';
        return `<a href="${href}" data-nav-id="${id}" class="${LINK_BASE_CLASSES}${activeClasses}"${ariaCurrent}>${label}</a>`;
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
              <a href="login.html" data-role="auth-link" class="${LINK_BASE_CLASSES}">Login</a>
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

    if (!authLink || !greetingEl) return;

    const updateAuthUI = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (token && username) {
        greetingEl.textContent = `Hi ${username}`;
        greetingEl.classList.remove('hidden');
        authLink.textContent = 'Logout';
        authLink.dataset.mode = 'logout';
        authLink.setAttribute('href', '#');
      } else {
        greetingEl.textContent = '';
        greetingEl.classList.add('hidden');
        authLink.textContent = 'Login';
        authLink.dataset.mode = 'login';
        authLink.setAttribute('href', 'login.html');
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
  };

  document.addEventListener('DOMContentLoaded', () => {
    const navElement = insertNav();
    if (navElement) {
      setupAuthHandlers(navElement);
    }
  });
})();
