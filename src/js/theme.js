(function() {
  var toggle = document.getElementById('theme-toggle');
  var sunIcon = document.getElementById('theme-icon-sun');
  var moonIcon = document.getElementById('theme-icon-moon');
  var root = document.documentElement;

  function isDark() {
    return root.classList.contains('dark');
  }

  function updateIcons() {
    if (isDark()) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
      toggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  function setTheme(dark) {
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    updateIcons();
  }

  toggle.addEventListener('click', function() {
    var dark = !isDark();
    setTheme(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  /* Follow OS changes when the user has no stored preference */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });

  /* Initial icon state */
  updateIcons();

  /* Enable smooth theme transition after first paint */
  requestAnimationFrame(function() {
    root.classList.add('theme-ready');
  });
})();
