requirejs.config({
  paths: {
    app: 'app',
    jquery: 'https://code.jquery.com/jquery-3.5.1.min',
    jqueryui: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min',
    popper: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min',
    bootstrap:
      'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min',
    mustache:
      'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.0.1/mustache.min',
  },
  shim: {
    bootstrap: ['jquery'],
    // jqueryui: ['jquery'],
  },
  map: {
    '*': {
      'popper.js': 'popper',
    },
  },
});

requirejs(['app/app'], function (app) {
  app.start();
});
