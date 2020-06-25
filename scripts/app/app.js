define(['jquery'], function ($) {
  function start() {
    console.log('app started');
    $(document).ready(function () {
      $coffeeOrderTemplate = $('#coffee-order-template');
      $coffeeList = $('#coffee-list');
      $coffeeList.append($coffeeOrderTemplate.html());
      $('.add-coffee').click(function () {
        $coffeeList.append($coffeeOrderTemplate.html());
      });
    });
  }
  return { start };
});
