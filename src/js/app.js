//= include '_base.js'

if (document.readyState === 'loading') {
  configOfEventListeners(false, {
    target: window,
    type: 'LOCATION/PAGE_READY',
    func: initJs,
  });
} else {
  initJs();
}

function initJs() {
  // Тут начинается твой js-код
}
