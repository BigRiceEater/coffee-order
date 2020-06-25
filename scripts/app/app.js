define(['jquery'], function ($) {
  var $coffeeOrderTemplate;
  var $coffeeList;

  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    $coffeeOrderTemplate = $('#coffee-order-template');
    $coffeeList = $('#coffee-list');
    $('.add-coffee').click(handleAddCoffee);
  }

  function handleAddCoffee() {
    $coffeeList.append($coffeeOrderTemplate.html());
  }
  return { start };
});
