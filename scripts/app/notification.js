define([
  'jquery',
  'mustache',
  'text!templates/coffee-toast.html',
  'jqueryui',
], function ($, mustache, view) {
  const $toastContainer = $('#toast-container');
  $toastContainer.delegate('.close-toast', 'click', function () {
    removeToast($(this));
  });
  const options = {
    autohide: false,
    animation: false,
  };
  const delay = 5000;

  function showToast(data) {
    let html = mustache.render(view, data);
    $toastContainer.append(html);
    let $toast = $toastContainer.find('.toast').last();
    $toast.find('.toast-header').addClass('bg-primary text-white');
    $toast.find('.close-toast').addClass('text-white');
    $toast.toast(options);
    $toast.hide(); // overrides bs toast default behaviour
    $toast.toast('show');
    $toast.show('slide', { direction: 'right' }, 500);
    setTimeout(function () {
      removeToast($toast);
    }, delay);
  }

  function removeToast($toast = null) {
    let $target = $(this);
    if ($toast) {
      $target = $toast;
    }

    $target.closest('.toast').slideUp('slow', function () {
      $(this).remove();
    });
  }

  return { showToast };
});
