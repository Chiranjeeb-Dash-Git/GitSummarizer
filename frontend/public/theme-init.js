(function () {
  try {
    var saved = localStorage.getItem('gs-theme');
    var theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'basalt' : 'daylight');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'daylight';
  }
})();

