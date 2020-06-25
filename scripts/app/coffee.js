define(['jquery', 'mustache', 'bootstrap'], function ($, mustache) {
  $coffeeList = $('#coffee-list');
  template = $('#coffee-order-template').html();

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
