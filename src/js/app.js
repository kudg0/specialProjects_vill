//= include '_base.js'

if (document.readyState === 'loading') {
  !window.location.href.includes('localhost')
    ? configOfEventListeners(false, {
        target: window,
        type: 'LOCATION/PAGE_READY',
        func: initJs,
      })
    : configOfEventListeners(false, {
        target: window,
        type: 'load',
        func: initJs,
      });
} else {
  initJs();
}

function initJs() {
  // Тут начинается твой js-код
}

configOfEventListeners(false, {
  target: window,
  type: 'LOCATION/PATHNAME_CHANGED',
  func: destroyJs,
});
function destroyJs() {
  // Удаляем все ивенты
  configOfEventListeners(true, true);
}
