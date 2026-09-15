// Toggle dark/light theme on en landing page
(function() {
  var tBtn = document.getElementById('themeBtn');
  var darkQuery = matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return darkQuery.matches;
  }
  function update(dark) {
    if (tBtn) tBtn.textContent = dark ? '☀️' : '🌙';
  }
  if (tBtn) {
    tBtn.addEventListener('click', function() {
      var next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e) {}
      update(next === 'dark');
    });
  }
  try {
    var saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}
  update(isDark());
})();
