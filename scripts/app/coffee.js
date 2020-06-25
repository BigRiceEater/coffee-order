define(['jquery', 'mustache'], function ($, mustache) {
  $coffeeList = $('#coffee-list');
  template = $('#coffee-order-template').html();

  function handleAddCoffee() {
    $coffeeList.append(
      mustache.render(template, { coffeeName: 'Latte', personName: 'John Doe' })
    );
  }

  return { handleAddCoffee };
});
