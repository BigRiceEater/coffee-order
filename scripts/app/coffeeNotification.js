define(['app/notification', 'app/constants'], function (
  notification,
  constants
) {
  function notify(eventType, coffee) {
    let event = constants.events.coffee;
    switch (eventType) {
      case event.new:
        notifyNewOrder(coffee);
        return true;
      case event.completed:
        notifyOrderCompleted(coffee);
        return true;
      default:
        return false;
    }
  }

  function notifyNewOrder(coffee) {
    let data = {
      title: 'New Order',
      ago: 'just now',
      message: `${coffee.personName} ordered a ${coffee.coffeeName}.`,
    };
    let options = {
      theme: 'bg-primary',
      textColor: 'text-white',
    };
    notification.showToast(data, options);
  }

  function notifyOrderCompleted(coffee) {
    let data = {
      title: 'Completed',
      ago: 'just now',
      message: `${coffee.coffeeName} is done!`,
    };
    let options = {
      theme: 'bg-success',
      textColor: 'text-white',
    };
    notification.showToast(data, options);
  }

  return { notify };
});
