(function () {
  const sidebar = document.getElementById('sidebar');
  const loginStatus = document.getElementById('loginStatus');
  const drivePanel = document.getElementById('driveSettingsPanel');
  const compactStatus = document.getElementById('driveCompactStatus');
  const songList = document.getElementById('songList');
  const songCountLabel = document.getElementById('songCountLabel');

  if (!sidebar) return;

  function isConnectedText(text) {
    const value = (text || '').toLowerCase();
    return value.includes('conectado') || value.includes('google conectado') || value.includes('@');
  }

  function syncGoogleCompactState() {
    const connected = isConnectedText(loginStatus && loginStatus.textContent);
    sidebar.classList.toggle('sidebar-google-connected', connected);

    if (compactStatus) {
      compactStatus.textContent = connected ? 'Conectado' : 'Configurar';
    }

    if (drivePanel && connected && !drivePanel.dataset.userToggled) {
      drivePanel.open = false;
    }
  }

  if (drivePanel) {
    drivePanel.addEventListener('toggle', () => {
      drivePanel.dataset.userToggled = 'true';
    });
  }

  if (loginStatus) {
    new MutationObserver(syncGoogleCompactState).observe(loginStatus, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function syncSongCount() {
    if (!songList || !songCountLabel) return;
    const items = songList.querySelectorAll('button, .song, .song-item, [data-song-id], li');
    const count = items.length;
    songCountLabel.textContent = count ? `${count} música${count === 1 ? '' : 's'}` : 'Biblioteca';
  }

  if (songList) {
    new MutationObserver(syncSongCount).observe(songList, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-current']
    });
  }

  window.addEventListener('load', () => {
    syncGoogleCompactState();
    syncSongCount();
  });
})();
