document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('competition-page-grid');
  if (!grid || !GYM_DATA.competitions) return;

  const searchInput = document.getElementById('competition-page-search');
  const stateSelect = document.getElementById('competition-page-state');
  const typeSelect = document.getElementById('competition-page-type');
  const clearButton = document.getElementById('clear-competition-filter');
  const resultCount = document.getElementById('competition-page-results');
  const pageCount = document.getElementById('competition-page-count');
  const stateCount = document.getElementById('competition-state-count');
  const states = ['All', ...new Set(GYM_DATA.competitions.map(competition => competition.state))];
  const filters = { search: '', state: 'All', type: 'All' };

  stateSelect.innerHTML = states.map(state => `<option value="${state}">${state === 'All' ? 'All States' : state}</option>`).join('');
  if (pageCount) pageCount.textContent = GYM_DATA.competitions.length;
  if (stateCount) stateCount.textContent = states.length - 1;

  function render() {
    const events = GYM_DATA.competitions.filter(competition => {
      const searchableText = `${competition.name} ${competition.city} ${competition.state} ${competition.categories}`.toLowerCase();
      return (!filters.search || searchableText.includes(filters.search))
        && (filters.state === 'All' || competition.state === filters.state)
        && (filters.type === 'All' || competition.type === filters.type);
    });

    resultCount.textContent = `Showing ${events.length} listed event${events.length === 1 ? '' : 's'}`;
    if (!events.length) {
      grid.innerHTML = '<div class="competition-empty"><h3>No events match those filters.</h3><p>Try another state, type or search term.</p></div>';
      return;
    }

    grid.innerHTML = events.map(competition => `
      <article class="competition-page-card">
        <div class="competition-page-card-top"><span>${competition.badge}</span><strong>${competition.type}</strong></div>
        <div class="competition-page-card-body">
          <span class="competition-page-location">${competition.state} · ${competition.city}</span>
          <h3>${competition.name}</h3>
          <div class="competition-page-meta"><span>📅 ${competition.date}</span><span>📍 ${competition.venue}</span></div>
          <p class="competition-page-federation">${competition.federation}</p>
          <p class="competition-page-categories"><b>Divisions:</b> ${competition.categories}</p>
          <a class="btn btn-primary btn-sm" href="${competition.registrationUrl}">Register Interest ↗</a>
        </div>
      </article>`).join('');
  }

  searchInput.addEventListener('input', () => {
    filters.search = searchInput.value.trim().toLowerCase();
    render();
  });
  stateSelect.addEventListener('change', () => {
    filters.state = stateSelect.value;
    render();
  });
  typeSelect.addEventListener('change', () => {
    filters.type = typeSelect.value;
    render();
  });
  clearButton.addEventListener('click', () => {
    filters.search = '';
    filters.state = 'All';
    filters.type = 'All';
    searchInput.value = '';
    stateSelect.value = 'All';
    typeSelect.value = 'All';
    render();
  });

  render();
});
