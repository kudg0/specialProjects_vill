//установка и удаление ивент листнеров
let configOfEventListeners = (function() {
  let arrOfEventsObj = [];

  return function(destroy, eventObj) {
    if (!destroy) {
      eventObj.target.addEventListener(eventObj.type, eventObj.func);

      arrOfEventsObj.push(eventObj);
    } else if (destroy == 'current' && arrOfEventsObj.length != 0) {
      arrOfEventsObj.forEach((eventObjCopy) => {
        let index = arrOfEventsObj.indexOf(eventObjCopy);

        if (
          eventObj.type == eventObjCopy.type &&
          eventObj.target == eventObjCopy.target &&
          eventObj.func == eventObjCopy.func
        ) {
          eventObjCopy.target.removeEventListener(
            eventObjCopy.type,
            eventObjCopy.func,
          );

          arrOfEventsObj.splice(index, 1);
        }
      });
    } else {
      arrOfEventsObj.forEach((eventObjCopy) => {
        eventObjCopy.target.removeEventListener(
          eventObjCopy.type,
          eventObjCopy.func,
        );
      });

      arrOfEventsObj = [];
    }
  };
})();
//**OVER**
