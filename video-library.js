document.addEventListener('DOMContentLoaded', async () => {
  const filterBar = document.querySelector('.video-filter-bar');
  const grid = document.querySelector('.video-grid');

  function initFilters() {
    const filters = document.querySelectorAll('.video-filter');
    const cards = document.querySelectorAll('.video-card[data-category]');
    if (!filters.length || !cards.length) return;

    filters.forEach(filter => {
      // Remove any existing listener clones to prevent double binding
      const newFilter = filter.cloneNode(true);
      filter.parentNode.replaceChild(newFilter, filter);
      
      newFilter.addEventListener('click', () => {
        const selected = newFilter.dataset.filter;
        document.querySelectorAll('.video-filter').forEach(item => item.classList.toggle('active', item === newFilter));
        document.querySelectorAll('.video-card[data-category]').forEach(card => {
          card.hidden = selected !== 'all' && card.dataset.category !== selected;
        });
      });
    });
  }

  // Initial filter setup for existing static HTML cards
  initFilters();

  // Fetch videos dynamically from backend (which auto-scans videos/<category>/ folders)
  try {
    const res = await fetch('/api/videos');
    if (res.ok) {
      const videos = await res.json();
      if (Array.isArray(videos) && videos.length > 0 && grid) {
        // Clear previous grid
        grid.innerHTML = '';

        const knownFilters = new Set();
        document.querySelectorAll('.video-filter').forEach(btn => knownFilters.add(btn.dataset.filter));

        videos.forEach(v => {
          const categorySlug = (v.category || 'others').toLowerCase().trim();
          const categoryLabel = v.category_label || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const poster = v.poster || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80';
          const docLink = v.doc_link || 'college-women-diet-plan.html';

          // Add filter button if new category folder was created by user
          if (filterBar && !knownFilters.has(categorySlug)) {
            knownFilters.add(categorySlug);
            const newBtn = document.createElement('button');
            newBtn.className = 'video-filter';
            newBtn.type = 'button';
            newBtn.dataset.filter = categorySlug;
            newBtn.textContent = categoryLabel;
            filterBar.appendChild(newBtn);
          }

          const card = document.createElement('article');
          card.className = 'video-card' + (categorySlug === 'women' ? ' featured-video-card' : '');
          card.dataset.category = categorySlug;

          card.innerHTML = `
            <div class="video-frame">
              <video controls preload="metadata" poster="${poster}">
                <source src="${v.video_url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
            <div class="video-card-body">
              <span class="video-tag">${categoryLabel}</span>
              <h3>${v.title || 'Workout Video'}</h3>
              <p>${v.description || 'Full workout and guidance session.'}</p>
              <a class="diet-document-link" href="${docLink}">Open diet plan document &rarr;</a>
            </div>
          `;
          grid.appendChild(card);
        });

        // Re-initialize filter buttons with newly added cards
        initFilters();
      }
    }
  } catch (err) {
    console.log('Using static video fallback (backend not running):', err);
  }
});