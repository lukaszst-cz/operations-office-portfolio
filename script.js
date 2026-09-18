const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.case-card[data-category]');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const selected = button.dataset.filter;
    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ').filter(Boolean);\n      const show = selected === 'all' || categories.includes(selected);
      card.classList.toggle('hidden', !show);
    });
  });
});

const year = document.getElementById('year');\nif (year) year.textContent = new Date().getFullYear();

