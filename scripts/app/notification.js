define(['jquery', 'mustache', 'text!templates/coffee-toast.html'], function (
  $,
  mustache,
  view
) {
  const $toastContainer = $('#toast-container');
  const options = {
    delay: 5000,
    animation: false,
  };

  function showToast(data) {
    let html = mustache.render(view, data);
    $toastContainer.append(html);
    let $toast = $toastContainer.find('.toast').last();
    $toast.toast(options);
    $toast.toast('show');
  }

  return { showToast };
});
