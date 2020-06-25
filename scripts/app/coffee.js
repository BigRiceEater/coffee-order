define([
  'jquery',
  'mustache',
  'text!templates/coffee-order.html',
  'bootstrap',
], function ($, mustache, template) {
  $coffeeList = $('#coffee-list');
  $coffeeList.delegate('.remove-coffee', 'click', handleRemoveCoffee);

  function handleAddCoffee(coffee) {
    $coffeeList.append(mustache.render(template, coffee));
  }

  function handleRemoveCoffee() {
    $(this)
      .closest('.coffee-order')
      .slideUp('fast', function () {
        $(this).remove();
      });
  }

  return { handleAddCoffee };
});
