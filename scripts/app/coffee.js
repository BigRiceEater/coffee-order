define(['jquery', 'mustache'], function ($, mustache) {
  $coffeeList = $('#coffee-list');
  $coffeeOrderTemplate = $('#coffee-order-template');

  function handleAddCoffee() {
    $coffeeList.append($coffeeOrderTemplate.html());
  }

  return { handleAddCoffee };
});
