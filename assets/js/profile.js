(function () {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  const savedTheme = window.localStorage.getItem('profile-theme');
  if (savedTheme === 'light') document.body.classList.add('light');
  function updateButton() {
    const light = document.body.classList.contains('light');
    toggle.textContent = light ? '☼' : '☾';
    toggle.setAttribute('aria-pressed', String(light));
  }
  toggle.addEventListener('click', function () {
    document.body.classList.toggle('light');
    window.localStorage.setItem('profile-theme', document.body.classList.contains('light') ? 'light' : 'dark');
    updateButton();
  });
  updateButton();
})();
