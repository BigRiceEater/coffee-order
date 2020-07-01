define([
  'jquery',
  'app/coffee',
  'app/chooseCoffee',
  'app/notification',
], function ($, coffee, coffeeModal, notification) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.onCoffeeChosen(coffee.handleAddCoffee);
    coffee.onCoffeeAdded(function (coffee) {
      notification.showToast({
        title: 'Order',
        ago: 'just now',
        message: `${coffee.personName} ordered a ${coffee.coffeeName}`,
      });
    });
  }
  return { start };
});
