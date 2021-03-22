const mix = require('laravel-mix');

mix.setPublicPath('dist')
   .js('resources/js/tinyplugin.js', 'js')
   .less('resources/sass/tinyplugin.less', 'css');
