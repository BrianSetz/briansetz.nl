(function() {
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-mobile');
  if (!toggle || !menu) return;
  function closeMenu() {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    toggle.setAttribute('aria-expanded', 'false');
    menu.inert = true;
  }
  function openMenu() {
    menu.classList.remove('hidden');
    menu.classList.add('flex');
    toggle.setAttribute('aria-expanded', 'true');
    menu.inert = false;
  }
  toggle.addEventListener('click', function() {
    var isOpen = !menu.classList.contains('hidden');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });
  document.querySelectorAll('#nav-mobile a').forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
      closeMenu();
      toggle.focus();
    }
  });
})();
