//Функция отправки событий в GA
function gaPushEvent(action, category, label, nonInteraction) {
  let event = nonInteraction ? 'eventWithNonInteraction' : 'event';

  window['dataLayer']
    ? window.dataLayer.push({
        event: event,
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
      })
    : console.log(action, category, label, nonInteraction);
}
