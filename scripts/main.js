requirejs.config({
  paths: {
    jquery: 'https://code.jquery.com/jquery-3.5.1.min',
    jqueryui: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min',
    jpopper:
      'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
    bootstrap:
      'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js',
  },
});

requirejs(['app/app'], function (app) {
  app.start();
});
