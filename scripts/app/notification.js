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

  function showToast(data, toastOptions = {}) {
    let html = mustache.render(view, data);
    $toastContainer.append(html);
    let $toast = $toastContainer.find('.toast').last();

    if (toastOptions.theme)
      $toast.find('.toast-header').addClass(toastOptions.theme);
    if (toastOptions.textColor) {
      $toast.find('.toast-header').addClass(toastOptions.textColor);
      $toast.find('.close-toast').addClass(toastOptions.textColor);
    }
    $toast.toast(options);
    // $toast.hide(); // overrides bs toast default behaviour
    $toast.toast('show');
    $toast.css('width', '0px');
    $toast.animate({ width: '15rem' }, 500);
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
