const views = ['home', 'song', 'studio', 'rewrite', 'library'];
const pageTitles = {
  home: 'Inicio del estudio',
  song: 'Nueva canción',
  studio: 'Estudio creativo',
  rewrite: 'Reescritura inteligente',
  library: 'Biblioteca del estudio',
};

const pageTitle = document.getElementById('pageTitle');
const navButtons = document.querySelectorAll('.nav-item');
const jumpButtons = document.querySelectorAll('[data-jump]');

function setView(view) {
  if (!views.includes(view)) return;
  document.querySelectorAll('.view').forEach((el) => {
    el.classList.toggle('active', el.id === `view-${view}`);
  });
  navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
  pageTitle.textContent = pageTitles[view] || 'APP MOZART WEB';
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

jumpButtons.forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.jump));
});
