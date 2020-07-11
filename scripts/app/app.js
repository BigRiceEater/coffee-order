define([
  'jquery',
  'app/coffee',
  'app/chooseCoffee',
  'app/coffeeNotification',
], function ($, coffee, coffeeModal, coffeeNotification) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.onCoffeeChosen(coffee.handleAddCoffee);

    let coffeeEvents = coffeeNotification.events;
    coffee.on('new', function (coffee) {
      coffeeNotification.notify(coffeeEvents.newOrder, coffee);
    });
    coffee.on('completed', function (coffee) {
      coffeeNotification.notify(coffeeEvents.orderCompleted, coffee);
    });
  }
  return { start };
});
