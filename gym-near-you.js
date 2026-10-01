function setGymNearCount() {
  const count = document.getElementById('gym-near-count');
  if (count && typeof GYM_DATA !== 'undefined' && GYM_DATA.gymLocations) count.textContent = GYM_DATA.gymLocations.length;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setGymNearCount);
} else {
  setGymNearCount();
}