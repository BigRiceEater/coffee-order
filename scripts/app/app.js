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
    coffeeModal.registerHandleAddCoffee(coffee.handleAddCoffee);
    coffee.coffeeAdded(function (coffee) {
      notification.showToast({
        title: 'Order',
        ago: 'just now',
        message: `${coffee.personName} ordered a ${coffee.coffeeName}`,
      });
    });
  }
  return { start };
});
