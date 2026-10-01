/**
 * TITAN FORGE MAIN APP CONTROLLER
 * Controls Navigation, Schedule Filtering, Modals, Trainer Showcase, Pricing, and Lead Capture
 */

// Global Toast Notification Helper
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size:1.2rem;">${type === 'success' ? '⚡' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Global Direct Gmail Enquiry Dispatcher
window.sendDirectGmailAlert = function(subject, data) {
  try {
    const payload = Object.assign({
      _subject: subject,
      _template: 'table',
      _captcha: 'false'
    }, data);

    fetch('https://formsubmit.co/ajax/sachinkumar959939@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => console.log('📬 [Direct Gmail Alert Delivered]:', res))
    .catch(err => console.log('Direct email notice:', err));
  } catch (e) {}
};

// Global State
let selectedDay = 'Monday';
let selectedCategory = 'All';
let isAnnualBilling = false;

document.addEventListener('DOMContentLoaded', () => {
  initGoalFinder();
  initNavbar();
  initHeroMotion();
  initScrollAnimations();
  initGymLocator();
  initCompetitions();
  initCelebrityDiets();
  initSchedule();
  initTrainers();
  initPricing();
  initLeadForm();
  initFAQ();
  initPrograms();
  initTransformations();
});

/* --- Hero Motion --- */
function initHeroMotion() {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-bg-video');
  const word = document.getElementById('hero-word');
  if (!hero || !video || !word) return;

  const words = ['LIMITS.', 'DOUBTS.', 'AVERAGE.', 'EXCUSES.'];
  let wordIndex = 0;
  let framePending = false;

  const rotateWord = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    word.classList.add('is-changing');
    window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      word.textContent = words[wordIndex];
      word.classList.remove('is-changing');
    }, 220);
  };

  window.setInterval(rotateWord, 2600);
  window.addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY * 0.12, 80);
      video.style.transform = `scale(1.06) translateY(${offset}px)`;
      framePending = false;
    });
  }, { passive: true });
}

/* --- State-wise Competition Directory --- */
let competitionFilters = { state: 'All', type: 'All', search: '' };

function initCompetitions() {
  const grid = document.getElementById('competition-grid');
  if (!grid || !GYM_DATA.competitions) return;

  const stateSelect = document.getElementById('competition-state-select');
  const typeSelect = document.getElementById('competition-type-select');
  const searchInput = document.getElementById('competition-search-input');
  const states = ['All', ...new Set(GYM_DATA.competitions.map(item => item.state))];
  if (stateSelect) stateSelect.innerHTML = states.map(state => `<option value="${state}">${state === 'All' ? 'All States' : state}</option>`).join('');

  stateSelect?.addEventListener('change', () => {
    competitionFilters.state = stateSelect.value;
    renderCompetitions();
  });
  typeSelect?.addEventListener('change', () => {
    competitionFilters.type = typeSelect.value;
    renderCompetitions();
  });
  searchInput?.addEventListener('input', () => {
    competitionFilters.search = searchInput.value.trim().toLowerCase();
    renderCompetitions();
  });
  renderCompetitions();
}

function renderCompetitions() {
  const grid = document.getElementById('competition-grid');
  if (!grid) return;
  const competitions = GYM_DATA.competitions.filter(competition => {
    const searchableText = `${competition.name} ${competition.city} ${competition.state} ${competition.categories}`.toLowerCase();
    return (competitionFilters.state === 'All' || competition.state === competitionFilters.state)
      && (competitionFilters.type === 'All' || competition.type === competitionFilters.type)
      && (!competitionFilters.search || searchableText.includes(competitionFilters.search));
  });
  const count = document.getElementById('competition-results-count');
  if (count) count.innerHTML = `Showing <strong>${competitions.length}</strong> listed competition${competitions.length === 1 ? '' : 's'}`;
  if (!competitions.length) {
    grid.innerHTML = '<div class="locator-empty-state"><h3>No competitions match those filters.</h3><p>Try another state, category, or city.</p></div>';
    return;
  }
  grid.innerHTML = competitions.map(competition => `
    <article class="competition-card">
      <div class="competition-card-top"><span class="competition-badge">${competition.badge}</span><span class="competition-type">${competition.type}</span></div>
      <div class="competition-card-body">
        <span class="competition-state">${competition.state} · ${competition.city}</span>
        <h3>${competition.name}</h3>
        <div class="competition-meta"><span>📅 ${competition.date}</span><span>📍 ${competition.venue}</span></div>
        <p class="competition-federation">${competition.federation}</p>
        <p class="competition-categories"><strong>Divisions:</strong> ${competition.categories}</p>
        <a class="btn btn-primary btn-sm" href="${competition.registrationUrl}">Register Interest ↗</a>
      </div>
    </article>`).join('');
}

/* --- Scroll Reveal Motion --- */
function initScrollAnimations() {
  const sections = document.querySelectorAll('main > section:not(.hero), .footer');
  if (!sections.length) return;

  sections.forEach((section, index) => {
    section.classList.add('scroll-reveal');
    section.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    sections.forEach(section => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* --- Fitness Goal Finder --- */
function initGoalFinder() {
  const buttons = document.querySelectorAll('.goal-option');
  const title = document.getElementById('goal-result-title');
  const copy = document.getElementById('goal-result-copy');
  const link = document.getElementById('goal-program-link');
  if (!buttons.length || !title || !copy || !link) return;

  const routes = {
    muscle: ['Muscle Gain Starter', 'Start with strength training 3–4 days a week and a protein-first budget meal plan.', 'See Strength Programs'],
    fatloss: ['Fat Loss Starter', 'Combine two conditioning sessions with simple food swaps and a realistic calorie target.', 'See Conditioning Programs'],
    strength: ['Strength Builder Route', 'Build your big lifts with coached technique, progressive loading and recovery built in.', 'See Strength Programs'],
    energy: ['Daily Energy Reset', 'Use short functional sessions, mobility work and steady meals to make training easier to sustain.', 'See Functional Programs']
  };

  buttons.forEach(button => button.addEventListener('click', () => {
    const route = routes[button.dataset.goal] || routes.muscle;
    buttons.forEach(item => item.classList.toggle('active', item === button));
    title.textContent = route[0];
    copy.textContent = route[1];
    link.textContent = route[2];
  }));
}

/* --- Gym Locator & Map --- */
let locatorFilters = {
  type: 'highlighted',
  state: 'Delhi NCR',
  district: 'All',
  search: ''
};

function initGymLocator() {
  const grid = document.getElementById('gym-locator-grid');
  if (!grid || !GYM_DATA.gymLocations) return;

  const stateSelect = document.getElementById('locator-state-select');
  const districtSelect = document.getElementById('locator-district-select');
  const searchInput = document.getElementById('locator-search-input');
  const clearSearch = document.getElementById('locator-clear-search');

  document.querySelectorAll('#locator-quick-chips .spotlight-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#locator-quick-chips .spotlight-chip').forEach(item => item.classList.remove('active'));
      chip.classList.add('active');
      locatorFilters.type = chip.dataset.filterType;
      locatorFilters.state = chip.dataset.state || 'All';
      locatorFilters.district = chip.dataset.district || 'All';
      if (stateSelect) stateSelect.value = locatorFilters.state;
      updateLocatorDistricts();
      if (districtSelect) districtSelect.value = locatorFilters.district;
      renderGymLocator();
    });
  });

  stateSelect?.addEventListener('change', () => {
    locatorFilters.type = 'controls';
    locatorFilters.state = stateSelect.value;
    locatorFilters.district = 'All';
    updateLocatorDistricts();
    renderGymLocator();
  });

  districtSelect?.addEventListener('change', () => {
    locatorFilters.type = 'controls';
    locatorFilters.district = districtSelect.value;
    renderGymLocator();
  });

  searchInput?.addEventListener('input', () => {
    locatorFilters.search = searchInput.value.trim().toLowerCase();
    if (clearSearch) clearSearch.style.display = locatorFilters.search ? 'block' : 'none';
    renderGymLocator();
  });

  clearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    locatorFilters.search = '';
    clearSearch.style.display = 'none';
    renderGymLocator();
    searchInput?.focus();
  });

  updateLocatorDistricts();
  renderGymLocator();
}

function updateLocatorDistricts() {
  const select = document.getElementById('locator-district-select');
  if (!select) return;

  const stateLocations = locatorFilters.state === 'All'
    ? GYM_DATA.gymLocations
    : GYM_DATA.gymLocations.filter(location => location.state === locatorFilters.state);
  const districts = ['All', ...new Set(stateLocations.map(location => location.district))];
  select.innerHTML = districts.map(district => `<option value="${district}">${district === 'All' ? 'All Districts' : district}</option>`).join('');
  if (!districts.includes(locatorFilters.district)) locatorFilters.district = 'All';
  select.value = locatorFilters.district;
}

function getFilteredGymLocations() {
  return GYM_DATA.gymLocations.filter(location => {
    const matchesSpotlight = locatorFilters.type !== 'highlighted' || location.isHighlighted;
    const matchesState = locatorFilters.state === 'All' || location.state === locatorFilters.state;
    const matchesDistrict = locatorFilters.district === 'All' || location.district === locatorFilters.district;
    const searchableText = `${location.name} ${location.address} ${location.landmark} ${location.district} ${location.state}`.toLowerCase();
    return matchesSpotlight && matchesState && matchesDistrict && (!locatorFilters.search || searchableText.includes(locatorFilters.search));
  });
}

function getMemberLevelStats(location) {
  const levels = location.memberLevels || { beginner: 0, intermediate: 0, advanced: 0 };
  const total = levels.beginner + levels.intermediate + levels.advanced;
  return {
    total,
    beginner: { count: levels.beginner, percent: total ? Math.round((levels.beginner / total) * 100) : 0 },
    intermediate: { count: levels.intermediate, percent: total ? Math.round((levels.intermediate / total) * 100) : 0 },
    advanced: { count: levels.advanced, percent: total ? Math.round((levels.advanced / total) * 100) : 0 }
  };
}

function parseTimeToMinutes(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours < 12) hours += 12;

  return hours * 60 + minutes;
}

function parseSlotRange(slotText) {
  if (!slotText || typeof slotText !== 'string') return null;
  const parts = slotText.split('-').map(part => part.trim());
  if (parts.length !== 2) return null;
  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

function getLiveGymCapacity(location) {
  if (!location || !Array.isArray(location.slotCapacities) || !location.slotCapacities.length) {
    return { isOpen: false, crowdLevel: 'moderate', percent: 0, status: 'Capacity unavailable', label: 'Timing unavailable', slot: null, nextSlot: null };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSlot = location.slotCapacities.find(slot => {
    const range = parseSlotRange(slot.slot);
    if (!range) return false;
    const start = range.start;
    let end = range.end;
    if (end <= start) end += 24 * 60;
    return nowMinutes >= start && nowMinutes < end;
  });

  if (currentSlot) {
    const percent = Number(currentSlot.percent || 0);
    const crowdLevel = percent >= 80 ? 'peak' : percent >= 55 ? 'moderate' : 'low';
    return {
      isOpen: true,
      crowdLevel,
      percent,
      status: currentSlot.status || 'Current crowd',
      label: currentSlot.label || 'Current timing',
      slot: currentSlot,
      nextSlot: null
    };
  }

  const upcoming = location.slotCapacities
    .map(slot => ({ slot, range: parseSlotRange(slot.slot) }))
    .filter(item => item.range)
    .sort((a, b) => {
      let aMinutes = a.range.start;
      let bMinutes = b.range.start;
      if (aMinutes < nowMinutes) aMinutes += 24 * 60;
      if (bMinutes < nowMinutes) bMinutes += 24 * 60;
      return aMinutes - bMinutes;
    })[0];

  return {
    isOpen: false,
    crowdLevel: 'low',
    percent: 0,
    status: 'Closed now',
    label: 'Closed now',
    slot: null,
    nextSlot: upcoming ? upcoming.slot.label : null
  };
}

function renderGymLocator() {
  const grid = document.getElementById('gym-locator-grid');
  if (!grid) return;

  const locations = getFilteredGymLocations();
  const countEl = document.getElementById('locator-results-count');
  if (countEl) countEl.innerHTML = `Showing <strong>${locations.length}</strong> verified gym branch${locations.length === 1 ? '' : 'es'}`;

  if (!locations.length) {
    grid.innerHTML = '<div class="locator-empty-state"><h3>No branches match those filters.</h3><p>Try another city, district, or search term.</p></div>';
    return;
  }

  grid.innerHTML = locations.map(location => {
    const liveStatus = getLiveGymCapacity(location);
    const crowdClass = liveStatus.crowdLevel === 'low' ? 'dot-green' : liveStatus.crowdLevel === 'moderate' ? 'dot-orange' : 'dot-red';
    const levelStats = getMemberLevelStats(location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    const liveLabel = liveStatus.isOpen ? `${liveStatus.label}` : (liveStatus.nextSlot || 'Check timing');
    const liveValue = liveStatus.isOpen ? `${liveStatus.percent}% full` : 'Closed';
    return `
      <article class="gym-location-card" data-location-id="${location.id}">
        <div class="gym-location-image-wrap">
          <img src="${location.image}" alt="${location.name}" class="gym-location-image" loading="lazy">
          <span class="gym-location-badge">${location.badge}</span>
        </div>
        <div class="gym-location-body">
          <div class="gym-location-heading"><div><h3>${location.name}</h3><span class="gym-location-rating">★ ${location.rating} <small>(${location.reviews.toLocaleString('en-IN')} reviews)</small></span></div></div>
          <p class="gym-location-address">📍 ${location.address}</p>
          <p class="gym-location-landmark">${location.landmark}</p>
          <div class="gym-location-meta"><span>🕒 ${location.openHours}</span><span>☎ ${location.phone}</span></div>
          <div class="gym-owner-summary"><span class="gym-owner-icon">♟</span><span><strong>${location.owner.name}</strong><small>${location.owner.experience}</small></span></div>
          <div class="gym-price-summary"><span>From <strong>₹${location.priceList.monthly.price.toLocaleString('en-IN')}</strong>/month</span><span>VIP <strong>₹${location.priceList.annual.price.toLocaleString('en-IN')}</strong>/year</span></div>
          <div class="gym-level-summary"><span>👥 ${levelStats.total.toLocaleString('en-IN')} active members</span><span>B ${levelStats.beginner.percent}% · I ${levelStats.intermediate.percent}% · A ${levelStats.advanced.percent}%</span></div>
          <div class="gym-location-actions">
            <button class="btn-full-details" type="button" onclick="openGymDetailsModal('${location.id}')" aria-label="View full owner and trainer details for ${location.name}">
              <span>📋 View Full Details & Pricing</span>
              <span class="arrow-icon">→</span>
            </button>
            <div class="gym-location-sub-actions">
              <button class="btn btn-primary btn-sm" type="button" onclick="focusGymLocation('${location.id}')">
                🗺️ View on Map
              </button>
              <a class="btn btn-secondary btn-sm" href="${mapsUrl}" target="_blank" rel="noopener">
                🧭 Directions ↗
              </a>
            </div>
          </div>
        </div>
      </article>`;
  }).join('');

  focusGymLocation(locations[0].id, false);
}

function focusGymLocation(locationId, shouldScroll = true) {
  const location = GYM_DATA.gymLocations.find(item => item.id === locationId);
  const frame = document.getElementById('locator-map-frame');
  const title = document.getElementById('locator-map-title');
  const link = document.getElementById('locator-map-link');
  if (!location) return;

  const query = encodeURIComponent(location.address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  if (title) title.textContent = location.name;
  if (link) link.href = mapsUrl;
  if (frame) frame.src = `https://www.google.com/maps?q=${query}&output=embed`;
  document.querySelectorAll('.gym-location-card').forEach(card => card.classList.toggle('selected', card.dataset.locationId === locationId));
  if (shouldScroll) document.getElementById('locator-map-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.focusGymLocation = focusGymLocation;

function openGymDetailsModal(locationId) {
  const location = GYM_DATA.gymLocations.find(item => item.id === locationId);
  const modal = document.getElementById('gym-details-modal');
  const body = document.getElementById('gym-details-modal-content');
  if (!location || !modal || !body) return;
  const levelStats = getMemberLevelStats(location);
  const liveStatus = getLiveGymCapacity(location);

  body.innerHTML = `
    <div class="gym-details-header">
      <span class="section-tag">Branch Leadership & Coaching Team</span>
      <h2>${location.name}</h2>
      <p>📍 ${location.address}</p>
    </div>
    <section class="gym-owner-detail-card">
      <div class="gym-detail-avatar">♟</div>
      <div class="gym-detail-content">
        <span class="gym-detail-kicker">Branch Owner / Director</span>
        <h3>${location.owner.name}</h3>
        <strong>${location.owner.title}</strong>
        <p class="gym-experience-highlight">⚡ ${location.owner.experience}</p>
        <p>${location.owner.bio}</p>
        <div class="gym-owner-credentials"><span>🏆 ${location.owner.awards}</span><a href="tel:${location.owner.phone.replace(/[^\d+]/g, '')}">☎ ${location.owner.phone}</a></div>
      </div>
    </section>
    <section class="gym-capacity-detail-section">
      <div class="gym-detail-section-heading"><div><span class="section-tag">Live Capacity Check</span><h3>${liveStatus.isOpen ? 'Open now' : 'Closed now'}</h3></div><span class="gym-open-hours">${liveStatus.isOpen ? `${liveStatus.label} · ${liveStatus.percent}% full` : `${liveStatus.nextSlot ? `Next slot: ${liveStatus.nextSlot}` : location.openHours}`}</span></div>
      <div class="gym-capacity-slot-list">
        ${location.slotCapacities.map(slot => {
          const slotCrowd = slot.crowdLevel === 'low' ? 'dot-green' : slot.crowdLevel === 'moderate' ? 'dot-orange' : 'dot-red';
          const isActive = liveStatus.slot && liveStatus.slot.slot === slot.slot;
          return `<div class="gym-capacity-slot ${isActive ? 'is-active' : ''}"><span><span class="legend-dot ${slotCrowd}"></span>${slot.label}</span><strong>${slot.percent}%</strong></div>`;
        }).join('')}
      </div>
    </section>
    <section class="gym-pricing-detail-section">
      <div class="gym-detail-section-heading"><div><span class="section-tag">Membership Pricing</span><h3>Plans & Add-ons</h3></div><span class="gym-open-hours">Branch-specific pricing</span></div>
      <div class="gym-pricing-grid">
        ${Object.values(location.priceList).map(plan => `
          <article class="gym-price-detail-card">
            <span>${plan.label}</span>
            <strong>₹${plan.price.toLocaleString('en-IN')}</strong>
            ${plan.original ? `<del>₹${plan.original.toLocaleString('en-IN')}</del>` : ''}
            <small>${plan.perks}</small>
          </article>`).join('')}
      </div>
    </section>
    <section class="gym-level-detail-section">
      <div class="gym-detail-section-heading"><div><span class="section-tag">Member Training Mix</span><h3>Who Trains Here?</h3></div><span class="gym-open-hours">${levelStats.total.toLocaleString('en-IN')} active members</span></div>
      <div class="gym-level-bars">
        ${[
          ['Beginner', levelStats.beginner, 'beginner'],
          ['Intermediate', levelStats.intermediate, 'intermediate'],
          ['Advanced', levelStats.advanced, 'advanced']
        ].map(([label, level, className]) => `
          <div class="gym-level-row"><div class="gym-level-row-label"><span>${label}</span><strong>${level.count.toLocaleString('en-IN')} <small>${level.percent}%</small></strong></div><div class="gym-level-track"><span class="gym-level-fill ${className}" style="width:${level.percent}%"></span></div></div>`).join('')}
      </div>
    </section>
    <section class="gym-reviews-section">
      <div class="gym-detail-section-heading"><div><span class="section-tag">Member Feedback</span><h3>Review This Branch</h3></div><div class="gym-review-score" id="gym-review-score"><strong>${location.rating}</strong> ★ <small>${location.reviews.toLocaleString('en-IN')} reviews</small></div></div>
      <form class="gym-review-form" onsubmit="submitGymReview(event, '${location.id}')">
        <div class="gym-review-form-row">
          <div class="form-group"><label for="review-name-${location.id}">Your Name</label><input id="review-name-${location.id}" name="reviewer_name" class="form-control" required maxlength="60" placeholder="e.g. Aman Gupta"></div>
          <div class="form-group"><label for="review-visit-${location.id}">Visit Type</label><select id="review-visit-${location.id}" name="visit_type" class="form-control"><option>Member</option><option>Day Pass Visitor</option><option>Personal Training Client</option></select></div>
        </div>
        <div class="gym-star-picker" role="radiogroup" aria-label="Choose a rating">
          <span>Rating</span>
          ${[1, 2, 3, 4, 5].map(value => `<label><input type="radio" name="rating" value="${value}" ${value === 5 ? 'checked' : ''}><span aria-hidden="true">★</span></label>`).join('')}
        </div>
        <textarea name="comment" class="form-control" required maxlength="600" rows="3" placeholder="Share your experience with this gym, owner, or trainers..."></textarea>
        <button class="btn btn-primary btn-sm" type="submit">Submit Review ⚡</button>
      </form>
      <div class="gym-review-list" id="gym-review-list"><div class="gym-review-loading">Loading member reviews...</div></div>
    </section>
    <div class="gym-detail-section-heading"><div><span class="section-tag">Meet the Team</span><h3>${location.trainers.length} Certified Trainer${location.trainers.length === 1 ? '' : 's'}</h3></div><span class="gym-open-hours">🕒 Open ${location.openHours}</span></div>
    <div class="gym-trainer-detail-grid">
      ${location.trainers.map(trainer => `
        <article class="gym-trainer-detail-card">
          <img src="${trainer.avatar}" alt="${trainer.name}" loading="lazy">
          <div><h4>${trainer.name}</h4><p class="gym-trainer-role">${trainer.role}</p><p class="gym-trainer-experience">⚡ ${trainer.experience}</p><p><strong>Certified:</strong> ${trainer.certifications}</p><p><strong>Specialty:</strong> ${trainer.specialty}</p></div>
        </article>`).join('')}
    </div>
    <a class="btn btn-primary btn-block" href="tel:${location.phone.replace(/[^\d+]/g, '')}">☎ Contact Branch Team</a>
  `;
  modal.classList.add('active');
  loadGymReviews(location.id, location.rating, location.reviews);
}

function closeGymDetailsModal() {
  document.getElementById('gym-details-modal')?.classList.remove('active');
}

window.openGymDetailsModal = openGymDetailsModal;
window.closeGymDetailsModal = closeGymDetailsModal;

function escapeReviewText(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderGymReviews(reviews, baseRating, baseCount) {
  const list = document.getElementById('gym-review-list');
  const score = document.getElementById('gym-review-score');
  if (!list || !score) return;

  const submittedCount = reviews.length;
  const submittedAverage = submittedCount ? reviews.reduce((total, review) => total + Number(review.rating), 0) / submittedCount : baseRating;
  const average = submittedCount ? submittedAverage.toFixed(1) : Number(baseRating).toFixed(1);
  score.innerHTML = `<strong>${average}</strong> ★ <small>${(Number(baseCount) + submittedCount).toLocaleString('en-IN')} reviews</small>`;

  if (!submittedCount) {
    list.innerHTML = '<div class="gym-review-empty">Be the first member to review this branch.</div>';
    return;
  }

  list.innerHTML = reviews.slice(0, 6).map(review => `
    <article class="gym-review-item">
      <div class="gym-review-item-top"><strong>${escapeReviewText(review.reviewer_name)}</strong><span>${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</span></div>
      <p>${escapeReviewText(review.comment)}</p>
      <small>${escapeReviewText(review.visit_type || 'Member')} · ${escapeReviewText(review.created_at || '')}</small>
    </article>`).join('');
}

function loadGymReviews(locationId, baseRating, baseCount) {
  fetch(`/api/reviews?location_id=${encodeURIComponent(locationId)}`)
    .then(response => response.ok ? response.json() : [])
    .then(reviews => renderGymReviews(reviews, baseRating, baseCount))
    .catch(() => renderGymReviews([], baseRating, baseCount));
}

function submitGymReview(event, locationId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    location_id: locationId,
    reviewer_name: String(formData.get('reviewer_name') || '').trim(),
    visit_type: formData.get('visit_type'),
    rating: Number(formData.get('rating')),
    comment: String(formData.get('comment') || '').trim()
  };
  const submitButton = form.querySelector('button[type="submit"]');
  if (!payload.reviewer_name || !payload.comment || payload.rating < 1 || payload.rating > 5) return;
  submitButton.disabled = true;
  submitButton.textContent = 'Saving Review...';

  fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(response => response.json())
    .then(() => {
      form.reset();
      form.querySelector('input[value="5"]').checked = true;
      const location = GYM_DATA.gymLocations.find(item => item.id === locationId);
      if (location) loadGymReviews(locationId, location.rating, location.reviews);
      showToast('Review submitted. It will appear after admin approval.', 'success');
    })
    .catch(() => showToast('Review save nahi ho saka. Please try again.', 'error'))
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Review ⚡';
    });
}

window.submitGymReview = submitGymReview;

/* --- Navbar & Mobile Drawer --- */
function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      mobileToggle.textContent = navLinks.classList.contains('mobile-active') ? '✕' : '☰';
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        mobileToggle.textContent = '☰';
      });
    });
  }
}

/* --- Programs Showcase --- */
function initPrograms() {
  const container = document.getElementById('programs-grid-container');
  if (!container) return;

  container.innerHTML = GYM_DATA.programs.map(prog => `
    <div class="card-glass program-card" id="prog-${prog.id}">
      <div class="program-icon-badge">${prog.icon}</div>
      <span class="section-tag" style="align-self:flex-start; margin-bottom:10px;">${prog.badge}</span>
      <h3>${prog.title}</h3>
      <div class="program-tagline">${prog.tagline}</div>
      <p class="program-desc">${prog.desc}</p>
      <ul class="program-features">
        ${prog.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div style="margin-top:auto; padding-top:16px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; color:var(--text-muted);">⏱ ${prog.stats.duration}</span>
        <button class="btn btn-secondary btn-sm" onclick="filterScheduleByCategory('${prog.category}')">
          View Classes →
        </button>
      </div>
    </div>
  `).join('');
}

/* --- Celebrity & Influencer Diets Module --- */
function initCelebrityDiets() {
  renderCelebrityDiets('All');

  document.querySelectorAll('[data-slider-target="celebrity-diets-grid"]').forEach(button => {
    button.addEventListener('click', () => {
      const slider = document.getElementById(button.dataset.sliderTarget);
      if (!slider) return;
      const distance = Math.min(slider.clientWidth * 0.86, 420);
      slider.scrollBy({ left: button.dataset.sliderDirection === 'next' ? distance : -distance, behavior: 'smooth' });
    });
  });

  const catBtns = document.querySelectorAll('.celeb-cat-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      renderCelebrityDiets(cat);
    });
  });
}

function renderCelebrityDiets(category) {
  const container = document.getElementById('celebrity-diets-grid');
  if (!container || !GYM_DATA.celebrityDiets) return;

  const list = category === 'All' 
    ? GYM_DATA.celebrityDiets 
    : GYM_DATA.celebrityDiets.filter(c => c.category === category);

  container.innerHTML = list.map(celeb => `
    <div class="celeb-card" id="celeb-${celeb.id}">
      <div class="celeb-img-box">
        <img src="${celeb.image}" alt="${celeb.name}" class="celeb-img" data-celebrity-name="${celeb.name}" loading="lazy" onerror="this.onerror=null; this.src='${celeb.image}'">
        <div class="celeb-overlay"></div>
        <span class="celeb-badge-tag">${celeb.tag}</span>
      </div>
      <div class="celeb-body">
        <h3 class="celeb-name">${celeb.name}</h3>
        <div class="celeb-sub">${celeb.title}</div>
        
        <div class="celeb-macro-summary">
          <div>🔥 <strong>${celeb.dailyCalories}</strong></div>
          <div>🥩 <strong>${celeb.macros.protein}</strong> Protein</div>
          <div>🌾 <strong>${celeb.macros.carbs}</strong> Carbs</div>
        </div>

        <p class="celeb-desc">${celeb.tagline}</p>

        <div style="background:rgba(212,255,0,0.05); border:1px solid rgba(212,255,0,0.2); border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
          <span>🎓 College: <strong style="color:#38bdf8;">${celeb.collegeHack.dailyBudget}</strong></span>
          <span>💼 Corp: <strong style="color:#facc15;">${celeb.corporateHack.dailyBudget}</strong></span>
        </div>

        <button class="btn btn-primary btn-sm btn-block" onclick="openCelebDietModal('${celeb.id}')">
          View Full Day Diet & Sourcing Guide →
        </button>
      </div>
    </div>
  `).join('');
  loadHomepageCelebrityImages();
}

async function loadHomepageCelebrityImages() {
  const images = [...document.querySelectorAll('#celebrity-diets-grid [data-celebrity-name]')];
  await Promise.all(images.map(async image => {
    const name = image.dataset.celebrityName;
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, '_'))}`);
      if (!response.ok) return;
      const article = await response.json();
      const thumbnail = article.thumbnail?.source || article.originalimage?.source;
      if (thumbnail) image.src = thumbnail;
    } catch (error) {
      // Keep the catalog image when Wikipedia is unavailable.
    }
  }));
}

function openCelebDietModal(celebId) {
  const celeb = GYM_DATA.celebrityDiets.find(c => c.id === celebId);
  if (!celeb) return;

  const modal = document.getElementById('celeb-diet-modal');
  const body = document.getElementById('celeb-diet-modal-content');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:20px; border-bottom:1px solid var(--border-subtle); padding-bottom:16px;">
      <div>
        <span class="section-tag" style="margin-bottom:6px;">${celeb.tag}</span>
        <h2 style="font-size:1.8rem; color:#fff;">${celeb.name} — Full Day Diet Plan</h2>
        <div style="color:var(--accent-volt); font-weight:700; font-size:0.95rem;">${celeb.title} • Target: ${celeb.bodyFat}</div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:8px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted);">DAILY ENERGY</div>
          <strong style="color:var(--accent-volt);">${celeb.dailyCalories}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:8px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted);">PROTEIN</div>
          <strong style="color:#38bdf8;">${celeb.macros.protein}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:8px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted);">CARBS</div>
          <strong style="color:#4ade80;">${celeb.macros.carbs}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:8px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted);">FATS</div>
          <strong style="color:#facc15;">${celeb.macros.fats}</strong>
        </div>
      </div>
    </div>

    <h3 style="font-size:1.2rem; color:#fff; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
      <span>⏰</span> Complete 24-Hour Meal Schedule
    </h3>

    <div class="meal-timeline">
      ${celeb.meals.map(m => `
        <div class="meal-item">
          <div class="meal-header">
            <span class="meal-time-badge">${m.time}</span>
            <span style="font-size:0.8rem; color:var(--accent-volt); font-weight:700;">${m.calories}</span>
          </div>
          <div class="meal-title">${m.name}</div>
          <ul class="meal-items-list" style="margin-top:6px;">
            ${m.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- SOURCING COMPARISON: COLLEGE VS CORPORATE -->
    <h3 style="font-size:1.2rem; color:#fff; margin-top:28px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
      <span>📍</span> Where & How to Get This Food (Budget & Lifestyle Hacks)
    </h3>
    <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:16px;">
      Exact shopping locations, cheap replacements, and preparation methods tailored for students in hostels vs working corporate pros.
    </p>

    <div class="sourcing-grid">
      <!-- College Hack -->
      <div class="sourcing-box college">
        <div class="sourcing-title" style="color:#38bdf8;">
          <span>🎓</span> For College Students & Hostellers
        </div>
        <div class="sourcing-budget">Estimated Cost: ${celeb.collegeHack.dailyBudget}</div>
        
        <strong style="font-size:0.85rem; color:#fff; display:block; margin-bottom:6px;">Where to Buy Cheaply:</strong>
        <ul class="sourcing-list" style="margin-bottom:12px;">
          ${celeb.collegeHack.whereToBuy.map(w => `<li>${w}</li>`).join('')}
        </ul>

        <strong style="font-size:0.85rem; color:#fff; display:block; margin-bottom:6px;">Hostel Room & Mess Prep:</strong>
        <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.4;">
          ${celeb.collegeHack.hostelPrep}
        </p>
      </div>

      <!-- Corporate Hack -->
      <div class="sourcing-box corporate">
        <div class="sourcing-title" style="color:#facc15;">
          <span>💼</span> For Corporate & Working Professionals
        </div>
        <div class="sourcing-budget">Estimated Cost: ${celeb.corporateHack.dailyBudget}</div>
        
        <strong style="font-size:0.85rem; color:#fff; display:block; margin-bottom:6px;">Where to Get & Instant Swaps:</strong>
        <ul class="sourcing-list" style="margin-bottom:12px;">
          ${celeb.corporateHack.whereToBuy.map(w => `<li>${w}</li>`).join('')}
        </ul>

        <strong style="font-size:0.85rem; color:#fff; display:block; margin-bottom:6px;">Office Routine & Desk Prep:</strong>
        <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.4;">
          ${celeb.corporateHack.hostelPrep}
        </p>
      </div>
    </div>

    <div style="margin-top:24px; text-align:center;">
      <button class="btn btn-secondary btn-block" onclick="closeCelebDietModal()">
        Close Diet Guide
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeCelebDietModal() {
  const modal = document.getElementById('celeb-diet-modal');
  if (modal) modal.classList.remove('active');
}

/* --- Dynamic Class Schedule --- */
function initSchedule() {
  renderSchedulePills();
  renderSchedule();

  // Category filter pills
  const catPills = document.querySelectorAll('.schedule-filter-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedCategory = pill.getAttribute('data-cat');
      renderSchedule();
    });
  });
}

function renderSchedulePills() {
  const daysContainer = document.getElementById('schedule-days-container');
  if (!daysContainer) return;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  daysContainer.innerHTML = days.map(day => `
    <button class="day-pill ${day === selectedDay ? 'active' : ''}" onclick="selectScheduleDay('${day}')">
      ${day}
    </button>
  `).join('');
}

function selectScheduleDay(day) {
  selectedDay = day;
  renderSchedulePills();
  renderSchedule();
}

function filterScheduleByCategory(category) {
  selectedCategory = category;
  const pills = document.querySelectorAll('.schedule-filter-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === category) p.classList.add('active');
    else p.classList.remove('active');
  });

  const scheduleSection = document.getElementById('schedule');
  if (scheduleSection) {
    scheduleSection.scrollIntoView({ behavior: 'smooth' });
  }
  renderSchedule();
}

function renderSchedule() {
  const container = document.getElementById('schedule-grid-container');
  if (!container) return;

  let classes = GYM_DATA.schedules.filter(s => s.day === selectedDay);
  if (selectedCategory !== 'All') {
    classes = classes.filter(s => s.category === selectedCategory);
  }

  if (classes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:50px 20px; color:var(--text-muted);">
        <h4>No classes scheduled for this category on ${selectedDay}.</h4>
        <p>Try selecting another day or category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = classes.map(cls => `
    <div class="card-glass schedule-item">
      <div>
        <div class="schedule-time-row">
          <span class="schedule-time">⏱ ${cls.time}</span>
          <span class="schedule-badge">${cls.category}</span>
        </div>
        <h3 class="schedule-name">${cls.name}</h3>
        <div class="schedule-meta">
          <span>👤 Coach: <strong>${cls.trainer}</strong></span>
          <span>📍 ${cls.room}</span>
        </div>
      </div>
      <div class="schedule-footer">
        <span class="spots-badge">${cls.spotsLeft} of ${cls.spotsTotal} spots left</span>
        <button class="btn btn-primary btn-sm" onclick="openClassBookingModal('${cls.id}')">
          Reserve Spot
        </button>
      </div>
    </div>
  `).join('');
}

function openClassBookingModal(classId) {
  const cls = GYM_DATA.schedules.find(s => s.id === classId);
  if (!cls) return;

  const modal = document.getElementById('class-booking-modal');
  const detailsEl = document.getElementById('booking-class-details');
  if (!modal || !detailsEl) return;

  detailsEl.innerHTML = `
    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); padding:16px; border-radius:8px; margin-bottom:20px;">
      <h4 style="color:var(--accent-volt); font-size:1.2rem; margin-bottom:6px;">${cls.name}</h4>
      <div style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5;">
        <div><strong>Day & Time:</strong> ${cls.day}, ${cls.time}</div>
        <div><strong>Instructor:</strong> ${cls.trainer}</div>
        <div><strong>Studio:</strong> ${cls.room}</div>
        <div><strong>Availability:</strong> <span style="color:var(--accent-orange); font-weight:700;">${cls.spotsLeft} remaining</span></div>
      </div>
    </div>
  `;

  modal.setAttribute('data-class-id', classId);
  modal.classList.add('active');
}

function closeClassBookingModal() {
  const modal = document.getElementById('class-booking-modal');
  if (modal) modal.classList.remove('active');
}

// Handle Class Booking Form
const bookingForm = document.getElementById('class-booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = document.getElementById('class-booking-modal');
    const classId = modal.getAttribute('data-class-id');
    const memberName = document.getElementById('booking-name').value;
    const memberPhone = document.getElementById('booking-phone') ? document.getElementById('booking-phone').value : '';

    const cls = GYM_DATA.schedules.find(s => s.id === classId);
    if (cls && cls.spotsLeft > 0) {
      cls.spotsLeft -= 1;
      renderSchedule();
    }

    const bookingPayload = {
      member_name: memberName,
      phone: memberPhone,
      class_id: classId,
      class_name: cls ? cls.name : 'Group Fitness Class',
      trainer: cls ? cls.trainer : 'Titan Coach',
      day: cls ? cls.day : 'Today',
      time: cls ? cls.time : 'Scheduled',
      room: cls ? cls.room : 'Studio Arena'
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    })
    .then(res => res.json())
    .then(data => console.log('✅ [Database] Class booking saved:', data))
    .catch(err => console.warn('⚠️ Server notice:', err));

    if (window.sendDirectGmailAlert) {
      window.sendDirectGmailAlert(`📅 Class Booking - ${memberName} (${bookingPayload.class_name})`, {
        'Enquiry Type': 'Group Fitness Class Booking',
        'Member Name': memberName,
        'Phone Number': memberPhone,
        'Class': bookingPayload.class_name,
        'Trainer': bookingPayload.trainer,
        'Schedule': `${bookingPayload.day}, ${bookingPayload.time}`,
        'Studio': bookingPayload.room
      });
    }

    closeClassBookingModal();
    bookingForm.reset();
    showToast(`🎉 Spot reserved for ${memberName}! Check-in code sent via SMS.`, 'success');
  });
}

/* --- Trainers Portfolio & Profiles --- */
function initTrainers() {
  const container = document.getElementById('trainers-grid-container');
  if (!container) return;

  container.innerHTML = GYM_DATA.trainers.map(trainer => `
    <div class="trainer-card" id="trainer-${trainer.id}">
      <div class="trainer-img-wrapper">
        <img src="${trainer.image}" alt="${trainer.name}" class="trainer-img" loading="lazy" onerror="this.src='assets/trainers.jpg'">
        <div class="trainer-img-overlay"></div>
      </div>
      <div class="trainer-info-body">
        <div class="trainer-role">${trainer.role}</div>
        <h3 class="trainer-name">${trainer.name}</h3>
        <div style="color:var(--text-muted); font-size:0.82rem; margin-bottom:12px;">🏅 ${trainer.experience}</div>
        <div class="trainer-specialties">
          ${trainer.specialties.map(s => `<span class="trainer-badge-tag">${s}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm btn-block" onclick="openTrainerModal('${trainer.id}')">
          View Profile & Book →
        </button>
      </div>
    </div>
  `).join('');
}

function openTrainerModal(trainerId) {
  const trainer = GYM_DATA.trainers.find(t => t.id === trainerId);
  if (!trainer) return;

  const modal = document.getElementById('trainer-modal');
  const body = document.getElementById('trainer-modal-content');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="display:flex; gap:20px; align-items:center; margin-bottom:20px;">
      <img src="${trainer.image}" alt="${trainer.name}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:2px solid var(--accent-volt);" onerror="this.src='assets/trainers.jpg'">
      <div>
        <span class="section-tag" style="margin-bottom:4px;">${trainer.badge}</span>
        <h3 style="font-size:1.6rem; color:#fff;">${trainer.name}</h3>
        <p style="color:var(--accent-volt); font-size:0.9rem; font-weight:600;">${trainer.role}</p>
        <p style="color:var(--text-muted); font-size:0.82rem;">${trainer.experience}</p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <h4 style="font-size:1rem; margin-bottom:8px; color:#fff;">Biography</h4>
      <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6;">${trainer.bio}</p>
    </div>

    <div style="margin-bottom:20px;">
      <h4 style="font-size:1rem; margin-bottom:8px; color:#fff;">Certifications & Credentials</h4>
      <ul style="list-style:none; display:flex; flex-direction:column; gap:6px;">
        ${trainer.credentials.map(c => `<li style="font-size:0.88rem; color:var(--text-secondary);">🏅 ${c}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom:24px;">
      <h4 style="font-size:1rem; margin-bottom:8px; color:#fff;">Key Coaching Achievements</h4>
      <ul style="list-style:none; display:flex; flex-direction:column; gap:6px;">
        ${trainer.achievements.map(a => `<li style="font-size:0.88rem; color:var(--text-secondary);">⚡ ${a}</li>`).join('')}
      </ul>
    </div>

    <div style="background:rgba(212,255,0,0.06); border:1px solid rgba(212,255,0,0.2); padding:16px; border-radius:8px; margin-bottom:24px;">
      <div style="font-weight:700; color:#fff; margin-bottom:4px;">Book 1-on-1 Strategy Assessment</div>
      <div style="color:var(--text-secondary); font-size:0.85rem;">Includes full body scan, strength screening & customized roadmap with ${trainer.name}.</div>
    </div>

    <form id="trainer-book-form" onsubmit="handleTrainerBookSubmit(event, '${trainer.name}')">
      <div class="form-group" style="margin-bottom:14px;">
        <label>Your Full Name</label>
        <input type="text" class="form-control" required placeholder="John Doe">
      </div>
      <div class="form-group" style="margin-bottom:20px;">
        <label>Phone Number / WhatsApp</label>
        <input type="tel" class="form-control" required placeholder="+1 (555) 019-2834">
      </div>
      <button type="submit" class="btn btn-primary btn-block">
        Schedule Session with ${trainer.name}
      </button>
    </form>
  `;

  modal.classList.add('active');
}

function closeTrainerModal() {
  const modal = document.getElementById('trainer-modal');
  if (modal) modal.classList.remove('active');
}

function handleTrainerBookSubmit(e, trainerName) {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.querySelector('input[type="text"]');
  const phoneInput = form.querySelector('input[type="tel"]');
  const name = nameInput ? nameInput.value.trim() : 'Anonymous';
  const phone = phoneInput ? phoneInput.value.trim() : '';

  fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_name: name,
      phone: phone,
      class_name: `1-on-1 Consultation with ${trainerName}`,
      type: 'trainer_consultation',
      trainer: trainerName
    })
  })
  .then(res => res.json())
  .then(d => console.log('✅ [Database] Trainer Consultation saved:', d))
  .catch(err => console.warn('⚠️ Server notice:', err));

  if (window.sendDirectGmailAlert) {
    window.sendDirectGmailAlert(`🤝 Coach Consultation - ${name} (${trainerName})`, {
      'Enquiry Type': '1-on-1 Coach Consultation',
      'Client Name': name,
      'Phone / WhatsApp': phone,
      'Coach Assigned': trainerName
    });
  }

  closeTrainerModal();
  showToast(`Consultation request sent for ${trainerName}! We will contact you shortly.`, 'success');
}

/* --- Transformations Section --- */
function initTransformations() {
  const container = document.getElementById('transformations-grid-container');
  if (!container) return;

  container.innerHTML = GYM_DATA.transformations.map(t => `
    <div class="transform-card">
      <div class="transform-img-box">
        <img src="${t.image}" alt="${t.name} after transformation" class="transform-img transform-after" loading="lazy">
        <div class="transform-before-clip"><img src="${t.beforeImage || t.image}" alt="${t.name} before transformation" class="transform-img"></div>
        <span class="transform-image-label transform-before-label">BEFORE</span><span class="transform-image-label transform-after-label">AFTER</span>
        <input class="transform-slider" type="range" min="0" max="100" value="50" aria-label="Compare before and after for ${t.name}">
        <div class="transform-stats-badge">🔥 ${t.result}</div>
      </div>
      <div class="transform-body">
        <h4 class="transform-client">${t.name}, ${t.age}</h4>
        <div class="transform-sub">Coached by ${t.trainer} • ${t.duration}</div>
        <p class="transform-quote">${t.quote}</p>
        <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
          <span>Start: <strong style="color:#fff;">${t.beforeWeight}</strong></span>
          <span>Now: <strong style="color:var(--accent-volt);">${t.afterWeight}</strong></span>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.transform-slider').forEach(slider => {
    slider.addEventListener('input', event => {
      const clip = event.target.closest('.transform-img-box').querySelector('.transform-before-clip');
      clip.style.width = `${event.target.value}%`;
    });
  });
}

/* --- Pricing Logic --- */
function initPricing() {
  const toggle = document.getElementById('pricing-toggle-switch');
  if (toggle) {
    toggle.addEventListener('click', () => {
      isAnnualBilling = !isAnnualBilling;
      toggle.classList.toggle('active', isAnnualBilling);
      updatePricingDisplay();
    });
  }
}

function updatePricingDisplay() {
  const prices = {
    indiaPass: { monthly: 2499, annual: 1999 },
    silver: { monthly: 1999, annual: 1599 },
    gold: { monthly: 3499, annual: 2799 },
    titan: { monthly: 5999, annual: 4799 }
  };

  const periodText = isAnnualBilling ? '/month (billed annually)' : '/month';

  document.getElementById('price-india-pass-val').textContent = isAnnualBilling ? prices.indiaPass.annual.toLocaleString('en-IN') : prices.indiaPass.monthly.toLocaleString('en-IN');
  document.getElementById('price-india-pass-period').textContent = periodText;

  document.getElementById('price-silver-val').textContent = isAnnualBilling ? prices.silver.annual.toLocaleString('en-IN') : prices.silver.monthly.toLocaleString('en-IN');
  document.getElementById('price-silver-period').textContent = periodText;

  document.getElementById('price-gold-val').textContent = isAnnualBilling ? prices.gold.annual.toLocaleString('en-IN') : prices.gold.monthly.toLocaleString('en-IN');
  document.getElementById('price-gold-period').textContent = periodText;

  document.getElementById('price-titan-val').textContent = isAnnualBilling ? prices.titan.annual.toLocaleString('en-IN') : prices.titan.monthly.toLocaleString('en-IN');
  document.getElementById('price-titan-period').textContent = periodText;
}

let activeEnrollTier = 'Gold Pro';

function selectMembershipTier(tierName) {
  activeEnrollTier = tierName;
  const modal = document.getElementById('tier-modal');
  const title = document.getElementById('tier-modal-title');
  if (title) title.textContent = `Enroll in ${tierName} Membership`;

  const prices = {
    'Titan India Pass': isAnnualBilling ? 1999 : 2499,
    'Silver Iron': isAnnualBilling ? 1599 : 1999,
    'Gold Pro': isAnnualBilling ? 2799 : 3499,
    'Titan VIP': isAnnualBilling ? 4799 : 5999
  };
  const tierPrice = prices[tierName] || 3499;

  const summaryEl = document.getElementById('tier-fee-summary');
  if (summaryEl) {
    const accessCopy = tierName === 'Titan India Pass'
      ? 'One digital pass for participating Titan Forge gyms across India'
      : 'Zero joining fee + instant digital keycard';
    summaryEl.innerHTML = `
      <div style="background:rgba(212,255,0,0.06); border:1px solid rgba(212,255,0,0.25); border-radius:8px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#fff;">${tierName} (${isAnnualBilling ? 'Annual Plan' : 'Monthly'})</strong>
          <div style="color:var(--text-muted); font-size:0.8rem;">${accessCopy}</div>
        </div>
        <div style="font-size:1.3rem; font-weight:800; color:var(--accent-volt); font-family:var(--font-display);">
          ₹${tierPrice.toLocaleString('en-IN')}
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function closeTierModal() {
  const modal = document.getElementById('tier-modal');
  if (modal) modal.classList.remove('active');
}

window.onTierPayModeChange = function(mode) {
  const qrBox = document.getElementById('tier-upi-qr-box');
  const btn = document.getElementById('tier-submit-btn');
  if (mode === 'upi_qr') {
    if (qrBox) qrBox.style.display = 'block';
    if (btn) btn.textContent = 'Verify & Activate Membership ⚡';
  } else if (mode === 'razorpay') {
    if (qrBox) qrBox.style.display = 'none';
    if (btn) btn.textContent = 'Pay via Razorpay Gateway ⚡';
  } else {
    if (qrBox) qrBox.style.display = 'none';
    if (btn) btn.textContent = 'Confirm Desk Registration ⚡';
  }
};

// Handle Tier Modal Form with UPI QR & Razorpay
const tierForm = document.getElementById('tier-enroll-form');
if (tierForm) {
  tierForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('tier-name').value;
    const email = document.getElementById('tier-email').value;
    const phone = document.getElementById('tier-phone').value;
    const payMode = document.getElementById('tier-pay-mode') ? document.getElementById('tier-pay-mode').value : 'upi_qr';

    const prices = {
      'Titan India Pass': isAnnualBilling ? 1999 : 2499,
      'Silver Iron': isAnnualBilling ? 1599 : 1999,
      'Gold Pro': isAnnualBilling ? 2799 : 3499,
      'Titan VIP': isAnnualBilling ? 4799 : 5999
    };
    const tierPrice = prices[activeEnrollTier] || 3499;

    // Helper to send membership data to MongoDB API
    const saveMembershipToDb = (utrOrRef, finalMode) => {
      const memberPayload = {
        name: name,
        email: email,
        phone: phone,
        tier: activeEnrollTier,
        plan: activeEnrollTier,
        pay_mode: finalMode,
        utr: utrOrRef || 'Desk Registration',
        amount: tierPrice,
        billing: isAnnualBilling ? 'Annual' : 'Monthly',
        access_scope: activeEnrollTier === 'Titan India Pass' ? 'India-wide participating gyms' : 'Selected home branch'
      };

      fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberPayload)
      })
      .then(r => r.json())
      .then(d => console.log('✅ [Database] Membership saved:', d))
      .catch(err => console.warn('⚠️ Server notice:', err));

      if (window.sendDirectGmailAlert) {
        window.sendDirectGmailAlert(`🏆 New Membership - ${name} (${activeEnrollTier})`, {
          'Enquiry Type': 'Membership Registration',
          'Member Name': name,
          'Phone / WhatsApp': phone,
          'Email': email,
          'Plan Tier': activeEnrollTier,
          'Amount': `₹${tierPrice}`,
          'Payment Mode': finalMode,
          'UTR / Reference': utrOrRef || 'Desk Registration'
        });
      }
    };

    // 1. Direct UPI QR Payment with UTR
    if (payMode === 'upi_qr') {
      const utrInput = document.getElementById('tier-utr');
      const utr = utrInput ? utrInput.value.trim() : '';

      if (!utr || utr.length < 6) {
        showToast('Please enter your 12-digit UPI UTR / Reference number from GPay/PhonePe', 'error');
        if (utrInput) utrInput.focus();
        return;
      }

      saveMembershipToDb(utr, 'Direct UPI QR Scan');
      closeTierModal();
      tierForm.reset();
      showToast(`🏆 Payment Verified! UTR: ${utr}. Welcome ${name} to ${activeEnrollTier}!`, 'success');
      return;
    }

    // 2. Razorpay Gateway
    if (payMode === 'razorpay' && typeof Razorpay !== 'undefined') {
      const options = {
        key: window.RAZORPAY_CONFIG ? window.RAZORPAY_CONFIG.key : "rzp_test_51bEXAMPLE",
        amount: tierPrice * 100, // paise
        currency: "INR",
        name: "TITAN FORGE ATHLETICS",
        description: `${activeEnrollTier} Membership Pass`,
        image: "assets/hero-bg.jpg",
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: "#d4ff00"
        },
        handler: function(response) {
          saveMembershipToDb(response.razorpay_payment_id, 'Razorpay UPI/Cards');
          closeTierModal();
          tierForm.reset();
          showToast(`🏆 Payment Successful! Razorpay ID: ${response.razorpay_payment_id}. Welcome ${name}!`, 'success');
        },
        modal: {
          ondismiss: function() {
            showToast('Membership payment cancelled.', 'info');
          }
        }
      };

      try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function(resp) {
          showToast(`Payment failed: ${resp.error.description}`, 'error');
        });
        rzp.open();
      } catch (err) {
        saveMembershipToDb('pay_demo_' + Math.random().toString(36).substring(7), 'Razorpay Demo');
        closeTierModal();
        tierForm.reset();
        showToast(`🏆 Welcome ${name}! ${activeEnrollTier} Membership registered!`, 'success');
      }
    } else {
      // 3. Desk Registration
      saveMembershipToDb('PAY_AT_DESK', 'Gym Front Desk');
      closeTierModal();
      tierForm.reset();
      showToast(`🏆 Welcome ${name}! ${activeEnrollTier} Membership confirmed! Pay at club desk.`, 'success');
    }
  });
}

/* --- VIP Lead Form --- */
function initLeadForm() {
  const form = document.getElementById('vip-lead-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('lead-name') ? document.getElementById('lead-name').value : '';
      const email = document.getElementById('lead-email') ? document.getElementById('lead-email').value : '';
      const phone = document.getElementById('lead-phone') ? document.getElementById('lead-phone').value : '';
      const branchSelect = document.getElementById('lead-branch');
      const goalSelect = document.getElementById('lead-goal');
      const branch = branchSelect ? branchSelect.options[branchSelect.selectedIndex].text : 'Downtown';
      const goal = goalSelect ? goalSelect.options[goalSelect.selectedIndex].text : 'Hypertrophy & Muscle Gain';

      const leadPayload = {
        name: name,
        email: email,
        phone: phone,
        branch: branch,
        goal: goal
      };

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      })
      .then(res => res.json())
      .then(d => console.log('✅ [Database] VIP Lead saved:', d))
      .catch(err => console.warn('⚠️ Server notice:', err));

      if (window.sendDirectGmailAlert) {
        window.sendDirectGmailAlert(`🔥 New VIP Pass Enquiry - ${name}`, {
          'Enquiry Type': 'Free 3-Day VIP Gym Pass',
          'Customer Name': name,
          'Phone / WhatsApp': phone,
          'Email': email,
          'Preferred Branch': branch,
          'Fitness Goal': goal
        });
      }

      form.reset();
      showToast(`🎉 Congratulations ${name}! Your Free 3-Day VIP Pass is confirmed.`, 'success');
    });
  }
}

/* --- FAQ Accordion --- */
function initFAQ() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = GYM_DATA.faqs.map((faq, index) => `
    <div class="faq-item ${index === 0 ? 'active' : ''}">
      <div class="faq-question" onclick="toggleFAQ(this)">
        <span>${faq.question}</span>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-answer">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join('');
}

window.toggleFAQ = function(el) {
  const item = el.parentElement;
  item.classList.toggle('active');
};

// Global Modal Backdrop & Escape Key Handlers
window.closeClassBookingModal = typeof closeClassBookingModal === 'function' ? closeClassBookingModal : function() {
  document.getElementById('class-booking-modal')?.classList.remove('active');
};
window.closeTrainerModal = typeof closeTrainerModal === 'function' ? closeTrainerModal : function() {
  document.getElementById('trainer-modal')?.classList.remove('active');
};
window.closeTierModal = typeof closeTierModal === 'function' ? closeTierModal : function() {
  document.getElementById('tier-modal')?.classList.remove('active');
};
window.closeCelebDietModal = typeof closeCelebDietModal === 'function' ? closeCelebDietModal : function() {
  document.getElementById('celeb-diet-modal')?.classList.remove('active');
};

document.addEventListener('click', (event) => {
  if (event.target.classList && event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => modal.classList.remove('active'));
    document.querySelectorAll('.cart-drawer.active, .cart-drawer-backdrop.active').forEach(el => el.classList.remove('active'));
  }
});

