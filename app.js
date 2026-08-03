const themeToggle = document.querySelector('[data-theme-toggle]');
const yearButtons = Array.from(document.querySelectorAll('.year-switcher button[data-year]'));
const spotlight = document.querySelector('.spotlight');
const yearTitle = document.querySelector('[data-year-title]');
const yearCopy = document.querySelector('[data-year-copy]');
const yearBadges = document.querySelector('[data-year-badges]');

const yearContent = {
  2024: {
    title: 'sample year 2024',
    copy: 'test sample text for year 2024 content.',
    badges: [
      ['sample item', 'test'],
      ['sample item', 'test'],
    ],
  },
  2025: {
    title: 'sample year 2025',
    copy: 'test sample text for year 2025 content.',
    badges: [
      ['sample item', 'test'],
      ['sample item', 'test'],
    ],
  },
  2026: {
    title: 'sample year 2026',
    copy: 'test sample text for year 2026 content.',
    badges: [
      ['sample item', 'test'],
      ['sample item', 'test'],
    ],
  },
};

function setTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.title = nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  localStorage.setItem('spp-theme', nextTheme);
}

function clearYearSelection() {
  yearButtons.forEach((button) => {
    button.classList.remove('active');
    button.removeAttribute('aria-pressed');
  });

  if (spotlight) {
    spotlight.removeAttribute('data-year');
    spotlight.dataset.empty = 'true';
  }

  if (yearTitle) {
    yearTitle.textContent = 'sample title';
  }

  if (yearCopy) {
    yearCopy.textContent = 'test sample text.';
  }

  if (yearBadges) {
    yearBadges.innerHTML = `
      <div class="spot-badge">
        <div>
          <strong>sample item</strong>
          <span>test</span>
        </div>
        <span>test</span>
      </div>
      <div class="spot-badge">
        <div>
          <strong>sample item</strong>
          <span>test</span>
        </div>
        <span>test</span>
      </div>
    `;
  }
}

function renderYear(year) {
  const content = yearContent[year];

  yearButtons.forEach((button) => {
    const isActive = button.dataset.year === year;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (!content || !spotlight || !yearTitle || !yearCopy || !yearBadges) {
    return;
  }

  spotlight.dataset.year = year;
  delete spotlight.dataset.empty;
  yearTitle.textContent = content.title;
  yearCopy.textContent = content.copy;
  yearBadges.innerHTML = content.badges
    .map(
      ([label, value]) => `
      <div class="spot-badge">
        <div>
          <strong>${label}</strong>
          <span>test</span>
        </div>
        <span>${value}</span>
      </div>
    `,
    )
    .join('');
}

const savedTheme = localStorage.getItem('spp-theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
clearYearSelection();

themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

yearButtons.forEach((button) => {
  button.addEventListener('click', () => renderYear(button.dataset.year));
});
