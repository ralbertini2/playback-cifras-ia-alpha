// Playback Cifras IA Alpha v18.2 — ajustes de UX da sidebar.
// Não altera a lógica do Drive/player/PDF; apenas classes e comportamento de recolher filtros.
(function(){
  function normalizeText(value){
    return String(value || '').trim().toLowerCase();
  }

  function updateConnectionClass(){
    var status = document.getElementById('loginStatus');
    var text = normalizeText(status && status.textContent);
    var connected = text && !text.includes('desconectado') && !text.includes('erro') && !text.includes('conecte');
    document.body.classList.toggle('google-connected', !!connected);
  }

  function setupFiltersToggle(){
    var panel = document.querySelector('.filters-panel');
    var btn = document.getElementById('filtersToggleBtn');
    if(!panel || !btn) return;

    btn.addEventListener('click', function(){
      var collapsed = panel.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  function keepActiveSongVisible(){
    var list = document.getElementById('songList');
    if(!list) return;
    var active = list.querySelector('.active, .is-active, [aria-current="true"]');
    if(active && typeof active.scrollIntoView === 'function'){
      active.scrollIntoView({ block:'nearest', inline:'nearest' });
    }
  }

  function observeStatus(){
    var status = document.getElementById('loginStatus');
    if(!status) return;
    updateConnectionClass();
    var observer = new MutationObserver(updateConnectionClass);
    observer.observe(status, { childList:true, characterData:true, subtree:true });
  }

  function observeSongList(){
    var list = document.getElementById('songList');
    if(!list) return;
    var observer = new MutationObserver(function(){
      window.requestAnimationFrame(keepActiveSongVisible);
    });
    observer.observe(list, { childList:true, subtree:true, attributes:true, attributeFilter:['class','aria-current'] });
  }

  document.addEventListener('DOMContentLoaded', function(){
    setupFiltersToggle();
    observeStatus();
    observeSongList();
    window.setTimeout(updateConnectionClass, 800);
    window.setTimeout(keepActiveSongVisible, 1000);
  });
})();
