define([
  'jquery',
  'app/coffee',
  'app/chooseCoffee',
  'app/coffeeNotification',
  'app/constants',
  'app/coffeeStore',
], function ($, coffee, coffeeModal, coffeeNotification, constants, store) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.onCoffeeChosen(function (order) {
      store.add(order);
      coffee.handleAddCoffee(order);
    });

    let coffeeEvents = constants.events.coffee;
    let handleEvents = [
      coffeeEvents.new,
      coffeeEvents.completed,
      coffeeEvents.cancel,
    ];
    handleEvents.forEach(function (e) {
      coffee.on(e, function (id) {
        let coffee = null;
        if (e !== coffeeEvents.new) {
          coffee = store.pop(id);
        } else {
          coffee = store.find(id);
        }
        if (coffee) coffeeNotification.notify(e, coffee);
      });
    });
  }
  return { start };
});
