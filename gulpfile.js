 // Include gulp and plugins
 var
     gulp = require('gulp'),
     chokidar = require('chokidar'),
     del = require('del'),
     pkg = require('./package.json'),
     $ = require('gulp-load-plugins')({
         lazy: true
     }),
     vf = require('vinyl-file'),
     vss = require('vinyl-source-stream'),
     vb = require('vinyl-buffer'),
     webpack = require('webpack'),
     webpackstream = require('webpack-stream'),
     browserSync = require('browser-sync').create(),
     htmlInjector = require('bs-html-injector'),
     reload = browserSync.reload;

 // file locations
 var
     devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),

     source = './sources/',
     dest = devBuild ? 'builds/development/' : 'builds/production/',

     nodeModules = './node_modules/';
 bootstrapSources = nodeModules + 'bootstrap-sass/assets/stylesheets/**/*.scss';

 html = {
         partials: [source + '_partials/**/*'],
         in: [source + '*.html'],
         watch: [source + '*.html', '_partials/**/*'],
         out: dest,
         context: {
             devBuild: devBuild,
             author: pkg.author,
             version: pkg.version
         }
     },

     images = { in: source + 'images/**/*',
         out: dest + 'images/'
     },

     css = { in: [source + 'css/**/*'],
         watch: [source + 'css/**/*'],
         out: dest + 'css/',
         pluginCSS: { in: [source + 'css/**/*', './node_modules/bootstrap-sass/assets/stylesheets/bootstrap-custom.scss'],
             liveIn: ['./node_modules/bootstrap-sass/assets/stylesheets/bootstrap-custom.scss', source + 'css/font-awesome.min.css',
                 source + 'css/jquery.ui.theme.min.css', source + 'css/jquery.mCustomScrollbar.min.css',
                 source + 'css/material-icons.css', source + 'css/jquery-ui-1.8.20.custom.css', source + 'css/*images/**/*'
             ],
             watch: ['css/**/*.css'],
             out: dest + 'css/'
         },
         sassOpts: {
             outputStyle: devBuild ? 'nested' : 'compressed',
             imagePath: '../img',
             precision: 3,
             errLogToConsole: true
         }
     },

     fonts = { in: source + 'fonts/*.*',
         out: dest + 'fonts/'
     },

     js = { in: source + 'js/**/*',
         out: dest + 'js/'
             // filename: 'main.js'
     },

     jsLibs = { in: source + 'lib/**/*',
         out: dest + 'lib/'
             // filename: 'main.js'
     },

     filesFilters = {
     },

    bootstrapFilter = $.filter(['**/bootstrap-custom.scss'], {restore: true}),
    cssFilter = $.filter(['**/*.css'], {restore: true}),
    sassFilter = $.filter(['**/*.scss'], {restore: true}),
    htmlFilter = $.filter(['**/*.html', '**/*.md'], {restore: true}),
    imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
    imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true}),
    jsFilter = $.filter(['**/*.js'], {restore: true}),
    jsFilter2 = $.filter(['**/*.js', '!**/*custom.js'], {restore: true}),
    jsFilter3 = $.filter(['**/*.js', '!lib/sweetalert2/src/**/*'], {restore: true}),
    jsonFilter = $.filter(['**/*.json'], {restore: true}),

     syncOpts = {
         server: {
             baseDir: dest,
             index: 'index.html'
         },
         open: false,
         injectChanges: true,
         reloadDelay: 0,
         notify: true
     };

 // show build type
 console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');

 // Get bootstrap from node installation
 gulp.task('getbootstrap', function() {
     return gulp.src(css.pluginCSS.bootstrapCss)
         // .pipe($.plumber())
         .pipe($.sass(css.sassOpts))
         .pipe($.rename('bootstrap.css'))
         .pipe(gulp.dest(css.pluginCSS.out))
         .pipe(browserSync.stream({
             match: '**/*.css'
         }));
 });

 // Clean tasks
 gulp.task('clean', function() {
     del([
         dest + '*'
     ]);
 });

 gulp.task('clean-images', function() {
     del([
         dest + 'images/**/*'
     ]);
 });

 gulp.task('clean-html', function() {
     del([
         dest + '**/*.html'
     ]);
 });

 gulp.task('clean-css', function() {
     del([
         dest + 'css/**/*'
     ]);
 });

 gulp.task('clean-js', function() {
     del([
         dest + 'js/**/*'
     ]);
 });

 gulp.task('clean-jslib', function() {
     del([
         dest + 'lib/**/*'
     ]);
 });

 // build HTML files
 gulp.task('html', function() {
     var page = gulp.src(html.in)
         // .pipe($.newer(html.out))
         .pipe($.preprocess({
             context: html.context
         }))
         /*.pipe($.replace(/.\jpg|\.png|\.tiff/g, '.webp'))*/
     ;
     if (!devBuild) {
         page = page
             .pipe($.size({
                 title: 'HTML in'
             }))
             .pipe($.htmlclean())
             .pipe($.size({
                 title: 'HTML out'
             }));
     }
     return page
         .pipe(gulp.dest(html.out));
 });

 // manage images
 gulp.task('images', function() {
     return gulp.src(images.in)
         .pipe($.size({
             title: 'images in '
         }))
         .pipe($.newer(images.out))
         .pipe($.imagemin())
         /*.pipe(imageFilter2)
         .pipe($.webp())
         .pipe(imageFilter2.restore)*/
         .pipe($.size({
             title: 'images out '
         }))
         .pipe(gulp.dest(images.out));
 });

 // copy fonts
 gulp.task('fonts', function() {
     return gulp.src(fonts.in)
         .pipe($.newer(dest + 'fonts/'))
         .pipe(gulp.dest(dest + 'fonts/'));
 });


 // copy plugin css
 gulp.task('css', ['fonts'], function() {
    var cssFilter = $.filter(['**/*.css'], {restore: true}),
        sassFilter = $.filter(['**/*.scss'], {restore: true}),
        imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
        imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true});

     gulp.src(css.in)
         .pipe($.size({
             title: 'CSS in '
         }))
         // .pipe($.newer(css.pluginCSS.out))
         .pipe(cssFilter)
         .pipe($.rename(function (path) {
            // path.dirname += "/ciao";
            // path.basename += "-goodbye";
            path.extname = ".scss";
          }))
         .pipe($.sourcemaps.init())
         .pipe($.plumber())
         .pipe($.sass(css.sassOpts))
         /*.pipe($.size({
             title: 'CSS in '
         }))
         .pipe($.sourcemaps.write('./maps'))
         .pipe($.size({
             title: 'CSS out '
         }))*/
         .pipe(cssFilter.restore)
         .pipe(sassFilter)
         .pipe($.sourcemaps.init())
         .pipe($.plumber())
         .pipe($.sass(css.sassOpts))
         .pipe($.size({
             title: 'SCSS in '
         }))
         .pipe($.sourcemaps.write('./maps'))
         .pipe($.size({
             title: 'SCSS out '
         }))
         .pipe(sassFilter.restore)
         .pipe(imageFilter)
         .pipe($.imagemin())
         .pipe(imageFilter.restore)
         .pipe(imageFilter2)
         .pipe($.webp())
         .pipe(imageFilter2.restore)
         .pipe($.size({
             title: 'CSS out '
         }))
         .pipe(gulp.dest(dest + 'css/'))
         .pipe(browserSync.stream({
             match: '**/*.css'
         }));
     // .pipe(reload({stream: true}));
 });

 // compile Sass
 gulp.task('sass', ['fonts'], function() {
     return gulp.src(css.in)
         .pipe($.sourcemaps.init())
         .pipe($.plumber())
         .pipe($.sass(css.sassOpts))
         .pipe($.size({
             title: 'SCSS in '
         }))
         .pipe($.sourcemaps.write('./maps'))
         .pipe($.size({
             title: 'SCSS out '
         }))
         .pipe(gulp.dest(css.out))
         .pipe(browserSync.stream({
             match: '**/*.css'
         }));
 });

 // js tasks
 gulp.task('js', function() {

    var jsFilter = $.filter(['**/*.js'], {restore: true});

     if (devBuild) {
         gulp.src(js.in)

         // .pipe($.concat(js.filename))
         .pipe($.size({
                 title: 'JS in '
             }))
             .pipe($.newer(js.out))
             .pipe(jsFilter)
             .pipe($.uglify())
             .pipe(jsFilter.restore)
             .pipe($.size({
                 title: 'JS out '
             }))
             .pipe(gulp.dest(dest + 'js/'));
     } else {
         del([
             dest + 'js/*'
         ]);
         return gulp.src(js.in)
             .pipe($.newer(js.out))
             // .pipe($.jshint())
             // .pipe($.jshint.reporter('default'))
             // .pipe($.jshint.reporter('fail'))
             .pipe(gulp.dest(js.out));
     }
 });


 // copy js libraries
 gulp.task('jslib', function() {
     var htmlFilter = $.filter(['**/*.html', '**/*.md'], {
             restore: true
         }),
         cssFilter = $.filter(['**/*.css'], {
             restore: true
         }),
         imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {
             restore: true
         }),
         imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {
             restore: true
         }),
         jsonFilter = $.filter(['**/*.json'], {
             restore: true
         }),
         jsFilter = $.filter(['**/*.js', '!lib/sweetalert2/src/**/*'], {
             restore: true
         });

     if (devBuild) {
         return gulp.src(jsLibs.in)
             .pipe($.size({
                 title: 'jsLibs in '
             }))
             .pipe($.newer(jsLibs.out))
             .pipe(jsFilter)
             // .pipe($.babel())
             // .pipe($.regenerator())
             .pipe($.uglify())
             .on('error', function(err) {
                 $.util.log($.util.colors.red('[Error]'), err.toString());
             })
             // .pipe(webpack())
             .pipe(jsFilter.restore)
             .pipe(jsonFilter)
             .pipe($.jsonMinify())
             .pipe(jsonFilter.restore)
             .pipe(cssFilter)
             .pipe($.cleanCss({
                 rebase: false
             }))
             .pipe(cssFilter.restore)
             .pipe(htmlFilter)
             .pipe($.htmlclean())
             .pipe(htmlFilter.restore)
             .pipe(imageFilter)
             .pipe($.imagemin())
             .pipe(imageFilter.restore)
             /*.pipe(imageFilter2)
             .pipe($.webp())
             .pipe(imageFilter2.restore)*/

         // .pipe($.jshint())
         // .pipe($.jshint.reporter('default'))
         // .pipe($.jshint.reporter('fail'))
         .pipe($.size({
                 title: 'jsLibs out '
             }))
             .pipe(gulp.dest(jsLibs.out));
     } else {
         del([
             dest + 'lib/*'
         ]);
         return gulp.src(jsLibs.in)
             .pipe($.deporder())
             // .pipe($.concat(jsLibs.filename))
             .pipe($.size({
                 title: 'JS libraries in '
             }))
             // .pipe($.stripDebug())
             // .pipe($.uglify())
             .pipe($.size({
                 title: 'JS libraries out '
             }))
             .pipe(gulp.dest(jsLibs.out));
     }
 });

 gulp.task('connect', function() {
     $.connect.server({
         root: dest,
         livereload: true
     });
 });

 gulp.task("browser-sync", function () {
    browserSync.use(htmlInjector, {
        files: "app/*.html"
    });
    browserSync.init({
        server: "test/fixtures"
    });
});

 // browser sync
 gulp.task('serve', [], function() {
     // browserSync.init(syncOpts);

     // browserSync.use(htmlInjector,{
     //   files: [dest + '*.html']
     // });

     browserSync.init({
         server: {
             baseDir: dest,
             index: 'index.html'
         },
         files: [dest + "css/*.css"],
         // files: [dest + 'css/light-bootstrap-dashboard.css', dest + 'js/custom.js'],
         plugins: [{
            module: 'bs-html-injector',
            options: [{
                files: [dest + "*.html"]
            }]
         }],
         open: false,
         // port: 3000,
         injectChanges: true,
         notify: true

     });

     // return browserSync.watch(dest + '**/*', function (evt, file) {
     //   if (evt === 'change' && file.indexOf('.css') === -1) browserSync.reload();
     //   if (evt === 'change' && file.indexOf('.css') !== -1) vf.read(file).pipe(vss(file)).pipe(vb()).pipe(browserSync.stream());
     // });
     // browserSync.watch(html.out + '*.html').on('change', reload);


     $.watch([dest + '**/*.css'], $.batch(function(events, done) {
         gulp.start(browserSync.stream(), done);
     }));

     // browserSync.watch(dest + 'js/custom.js').on('change', reload);

     /*  // html changes
       gulp.watch(html.watch, ['html', reload]);
       // gulp.watch(html.watch).on('change', reload);

       // image changes
       gulp.watch(images.in, ['images']);

       // font changes
       gulp.watch(fonts.in, ['fonts']);

       // sass changes
       gulp.watch([css.watch], ['sass']);

       // pluginCSS changes
       gulp.watch([css.pluginCSS.watch], ['css']);

       // javascript changes
       // gulp.watch(js.in, ['js', reload]);
       gulp.watch(js.in).on('change', reload);

       // javascript libraries changes
       // gulp.watch(jsLibs.in, ['jslib', reload]);
       gulp.watch(jsLibs.in).on('change', reload);*/

 });


 // chokidar.watch(html.watch).on('all', function(){
 //   return ['html', reload];
 // });

 gulp.task('watch', function() {

     // html changes
     gulp.watch([html.watch], ['html']);

     // image changes
     gulp.watch(images.in, ['images']);

     // font changes
     gulp.watch(fonts.in, ['fonts']);

     // sass changes
     gulp.watch([css.watch], ['css']);

     // pluginCSS changes
     // gulp.watch([css.pluginCSS.watch], ['css']);

     // javascript changes
     gulp.watch(js.in, ['js', reload]);

     // javascript libraries changes
     // gulp.watch(jsLibs.in, ['jslib', 'jsliblive', reload]);
 });

 // default task
 gulp.task('default', ['html', 'images', 'fonts', 'css', 'js', 'watch', 'serve'], function(){
    // gulp.watch(dest+ "*.html", htmlInjector);
 });

 // gulp.task('default', ['serve']);
