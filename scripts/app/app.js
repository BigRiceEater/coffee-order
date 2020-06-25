define(['jquery', 'app/coffee', 'app/chooseCoffee'], function (
  $,
  coffee,
  coffeeModal
) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.registerHandleAddCoffee(coffee.handleAddCoffee);
  }
  return { start };
});
