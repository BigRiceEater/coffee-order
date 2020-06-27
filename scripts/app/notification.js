define(['jquery', 'mustache', 'text!templates/coffee-toast.html'], function (
  $,
  mustache,
  view
) {
  const $toastContainer = $('#toast-container');
  $toastContainer.delegate('.close-toast', 'click', removeToast);
  const options = {
    autohide: false,
    animation: false,
  };
  const delay = 5000;

  function showToast(data) {
    let html = mustache.render(view, data);
    $toastContainer.append(html);
    let $toast = $toastContainer.find('.toast').last();
    $toast.toast(options);
    $toast.toast('show');
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
