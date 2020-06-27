define([
  'jquery',
  'mustache',
  'text!templates/coffee-order.html',
  'text!templates/coffee-toast.html',
  'app/constants',
  'bootstrap',
], function ($, mustache, template, toastView, constants) {
  let $coffeeList = $('#coffee-list');
  let $toastContainer = $('#toast-container');
  let maxProgressJump = 50;
  let timers = [];

  $coffeeList.delegate('.remove-coffee', 'click', handleRemoveCoffee);

  function handleAddCoffee(coffee) {
    coffee.iconColor = getCoffeeIconColor(coffee.coffeeName);
    $coffeeList.append(mustache.render(template, coffee));

    let $order = $coffeeList.find('.coffee-order').last();

    let timer = setInterval(function () {
      incrementCoffeeProgress($order);
    }, Math.floor(Math.random() * 5000 + 1000));

    timers.push({ for: coffee.id, timer });

    $toastContainer.append(toastView);
    $('.toast').toast('show');
  }

  function incrementCoffeeProgress($order) {
    let $progressBar = $order.find('.progress-bar');
    let currentValue = parseInt($progressBar.attr('aria-valuenow'));
    let increase = Math.floor(Math.random() * maxProgressJump);
    let newValue = currentValue + increase;
    let stopTimer = false;
    if (newValue >= 100) {
      newValue = 100;
      stopTimer = true;
    }
    $progressBar.css({ width: `+=${newValue}%` });
    $progressBar.attr('aria-valuenow', newValue);
    if (stopTimer) {
      // let animation finish, $.animate(cb) still won't work
      setTimeout(function () {
        $order.find('.remove-coffee').trigger('click');
      }, 500);
    }
  }

  function removeTimer(id) {
    let record = timers.find((t) => t.for === id);
    clearInterval(record.timer);
    timers = timers.filter((t) => t.for !== id);
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
    let $order = $(this).closest('.coffee-order');
    removeTimer($order.attr('data-orderId'));
    $order.slideUp('fast', function () {
      $(this).remove();
    });
  }

  return { handleAddCoffee };
});
