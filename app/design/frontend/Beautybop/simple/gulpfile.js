const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const concatCss = require('gulp-concat-css');
const connect = require('gulp-connect');
const browserSync = require('browser-sync').create();
const livereload = require('gulp-livereload');
const cache = require('gulp-cache');

// Static server
gulp.task('browserSync', function() {
    browserSync.init({  
            proxy: "dev.beautybop.co.uk/",
            hostname: "dev.beautybop.co.uk/",
            port: 3000,  
    });
});


gulp.task('sass', async function(){
    return gulp.src('web/sass/**/*.scss')
    .pipe(sass())
    .pipe(concatCss('styles.min.css'))
    .pipe(gulp.dest('web/css'))
    .pipe(connect.reload())
    .pipe(browserSync.stream());
});

gulp.task('js', async function(){
    return gulp.src('web/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('web/js'))
    .pipe(connect.reload())
    .pipe(browserSync.stream());
});


gulp.task('clear', () =>
    cache.clearAll()
);


gulp.task('css', async function(){
    return gulp.src('web/css/styles.min.css')
    .pipe(concatCss('styles.min.css'))
    .pipe(gulp.dest('../../../../../pub/static/frontend/Beautybop/simple/en_GB/css'))
    .pipe(connect.reload())
    .pipe(browserSync.stream());
});

gulp.task('watch', function(){
    livereload.listen()
    gulp.watch('web/sass/**/*.scss', ['sass'])
    gulp.watch('web/js/**/*.js', ['js'])
    gulp.watch('web/css/**/*.css', ['css'])
    
});


// connect live reload on browser
gulp.task('connect', function() {
    connect.server({
        connect: true
    });
});

// added sass, js, css to be watched
gulp.watch('web/sass/**/*.scss', gulp.series(['sass', ]));
gulp.watch('web/js/**/*.js', gulp.series(['js']));
gulp.watch('web/css/**/*css', gulp.series(['css']));

gulp.task('default', gulp.series(['browserSync']), gulp.series(['watch']), gulp.series(['clear']));

