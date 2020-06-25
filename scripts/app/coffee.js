define([
  'jquery',
  'mustache',
  'text!templates/coffee-order.html',
  'app/constants',
  'bootstrap',
], function ($, mustache, template, constants) {
  $coffeeList = $('#coffee-list');
  $coffeeList.delegate('.remove-coffee', 'click', handleRemoveCoffee);

  function handleAddCoffee(coffee) {
    coffee.iconColor = getCoffeeIconColor(coffee.coffeeName);
    $coffeeList.append(mustache.render(template, coffee));
  }

  function getCoffeeIconColor(coffeeName) {
    switch (coffeeName) {
      case constants.coffee.latte:
        return 'crimson';
      case constants.coffee.expresso:
        return 'gold';
      case constants.coffee.mocha:
        return 'saddleBrown';
      case constants.coffee.black:
        return 'black';
      default:
        return 'black';
    }
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
