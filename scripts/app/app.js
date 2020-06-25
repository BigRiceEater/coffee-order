define(['jquery', 'app/coffee'], function ($, coffee) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    $('.add-coffee').click(coffee.handleAddCoffee);
  }
  return { start };
});
