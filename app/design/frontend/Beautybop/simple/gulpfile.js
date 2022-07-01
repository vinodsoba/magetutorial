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


gulp.task('sass', done => {
    return gulp.src('web/sass/**/*.scss')
    .pipe(sass())
    .pipe(concatCss('styles.min.css'))
    .pipe(gulp.dest('web/css'))
    .pipe(connect.reload())
    .pipe(browserSync.stream())
    done();
});

gulp.task('js', done => {
    return gulp.src('web/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('../../../../../pub/static/frontend/Beautybop/simple/en_GB/js'))
    .pipe(connect.reload())
    .pipe(browserSync.stream())
    done();
});


gulp.task('clear', () =>
    cache.clearAll()
);


gulp.task('css', done => {
    return gulp.src('web/css/styles.min.css')
    .pipe(concatCss('styles.min.css'))
    .pipe(gulp.dest('../../../../../pub/static/frontend/Beautybop/simple/en_GB/css'))
    .pipe(connect.reload())
    .pipe(browserSync.stream())
    done();
});

gulp.task('watch', function(done){
    livereload.listen()
    gulp.watch('web/sass/**/*.scss', ['sass'])
    gulp.watch('web/js/**/*.js', ['js'])
    gulp.watch('web/css/**/*.css', ['css'])
    done()
    
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

