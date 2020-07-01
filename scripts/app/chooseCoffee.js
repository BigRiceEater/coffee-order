define(['jquery', 'moment', 'app/constants'], function ($, moment, constants) {
  let $modal = $('#chooseCoffeeModal');
  let $form = $modal.find('form');

  let $orderBy = $form.find('#inputOrderBy');
  let $selectCoffee = $form.find('#selectCoffeeDrink');
  let defaultCoffee = $form.find('option:first').val();

  let onCoffeeChosenCallback = function () {
    console.error('handleAddCoffee not registered yet');
  };

  $modal.find('.add-coffee').click(function () {
    let order = {
      id: `${Date.now()}`,
      personName: $orderBy.val() || 'Guest',
      coffeeName: $selectCoffee.val(),
      submittedAt: moment().format('h:mma'),
      image: getImageByCoffee($selectCoffee.val()),
    };
    $modal.modal('hide');
    onCoffeeChosenCallback(order);
  });

  $modal.on('hidden.bs.modal', function () {
    $orderBy.val('');
    $selectCoffee.val(defaultCoffee);
  });

  function onCoffeeChosen(callback) {
    onCoffeeChosenCallback = callback;
  }

  function getImageByCoffee(coffeeName) {
    switch (coffeeName) {
      case constants.coffee.latte:
        return 'img/latte.jpg';
      case constants.coffee.expresso:
        return 'img/expresso.jpg';
      case constants.coffee.black:
        return 'img/black.jpg';
      case constants.coffee.mocha:
        return 'img/mocha.jpg';
      default:
        return null;
    }
  }

  return {
    onCoffeeChosen,
  };
});
