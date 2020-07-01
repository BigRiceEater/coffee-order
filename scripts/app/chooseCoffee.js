define(['jquery', 'moment'], function ($, moment) {
  let $modal = $('#chooseCoffeeModal');
  let $form = $modal.find('form');

  let $orderBy = $form.find('#inputOrderBy');
  let $selectCoffee = $form.find('#selectCoffeeDrink');
  let defaultCoffee = $form.find('option:first').val();

  let handleAddCoffee = function () {
    console.error('handleAddCoffee not registered yet');
  };

  $modal.find('.add-coffee').click(function () {
    let order = {
      id: `${Date.now()}`,
      personName: $orderBy.val() || 'Guest',
      coffeeName: $selectCoffee.val(),
      submittedAt: moment().format('h:mma'),
      image: 'img/latte.jpg',
    };
    $modal.modal('hide');
    handleAddCoffee(order);
  });

  $modal.on('hidden.bs.modal', function () {
    $orderBy.val('');
    $selectCoffee.val(defaultCoffee);
  });

  function registerHandleAddCoffee(callback) {
    handleAddCoffee = callback;
  }

  return {
    registerHandleAddCoffee,
  };
});
