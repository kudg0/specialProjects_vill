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

configOfEventListeners(false, {
  target: window,
  type: 'LOCATION/PATHNAME_CHANGED',
  func: destroyJs,
});
function destroyJs() {
  // Удаляем все ивенты
  configOfEventListeners(true, true);
}
