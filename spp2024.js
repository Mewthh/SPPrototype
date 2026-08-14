// for spp2024
const themeToggle = document.querySelector('[data-theme-toggle]');

function setTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);

  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  localStorage.setItem('spp-theme', nextTheme);
}

const savedTheme = localStorage.getItem('spp-theme');
const prefersDark =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});
