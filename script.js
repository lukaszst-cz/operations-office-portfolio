const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.case-card');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const selected = button.dataset.filter;
    cards.forEach((card) => {
      const show = selected === 'all' || card.dataset.category.split(' ').includes(selected);
      card.classList.toggle('hidden', !show);
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

