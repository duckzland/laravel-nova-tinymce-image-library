const mix = require('laravel-mix');

mix.setPublicPath('dist')
   .js('resources/js/tinyplugin.js', 'js')
   .react()
   .less('resources/less/tinyplugin.less', 'css');
