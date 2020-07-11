define([
  'jquery',
  'app/coffee',
  'app/chooseCoffee',
  'app/coffeeNotification',
  'app/constants',
], function ($, coffee, coffeeModal, coffeeNotification, constants) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.onCoffeeChosen(coffee.handleAddCoffee);

    let coffeeEvents = constants.events.coffee;
    let handleEvents = [coffeeEvents.new, coffeeEvents.completed];
    handleEvents.forEach(function (e) {
      coffee.on(e, function (coffee) {
        coffeeNotification.notify(e, coffee);
      });
    });
  }
  return { start };
});
