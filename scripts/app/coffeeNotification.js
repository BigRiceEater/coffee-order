define(['jquery', 'app/notification'], function ($, notification) {
  let events = {
    newOrder: 'new-order',
    orderCompleted: 'order-completed',
  };

  function notify(eventType, coffee) {
    switch (eventType) {
      case events.newOrder:
        notifyNewOrder(coffee);
        return true;
      case events.orderCompleted:
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

  return { events, notify };
});
