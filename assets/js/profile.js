(function () {
  const signal = document.querySelector('.signal-rule');
  if (!signal) return;

  const seenKey = 'mohammed-profile-reward-signal-seen';
  try {
    if (!window.localStorage.getItem(seenKey)) {
      signal.classList.add('signal-play');
      window.localStorage.setItem(seenKey, '1');
    }
  } catch (error) {
    signal.classList.add('signal-play');
  }
})();
