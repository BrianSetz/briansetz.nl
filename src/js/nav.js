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

  // Scroll spy: highlight active nav link
  var navLinks = document.querySelectorAll('#nav-menu .nav-link');
  if (!navLinks.length) return;

  var sections = [];
  navLinks.forEach(function(link) {
    var id = link.getAttribute('href');
    if (id && id.charAt(0) === '#') {
      var el = document.getElementById(id.substring(1));
      if (el) sections.push({ el: el, link: link });
    }
  });

  var current = null;
  var spyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (current) current.classList.remove('active');
        sections.forEach(function(s) {
          if (s.el === entry.target) {
            s.link.classList.add('active');
            current = s.link;
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(function(s) { spyObserver.observe(s.el); });
})();
