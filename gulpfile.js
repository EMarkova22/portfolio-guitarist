// Определяем константы Gulp
const {
	src,
	dest,
	watch,
	parallel,
	series
} = require('gulp');

// Подключаем модули gulp-sass
const scss = require('gulp-sass')(require('sass'));

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');

// Подключаем для выгрузки страницы на github pages
const ghPages = require('gulp-gh-pages');

// Подключаем del для очистки папки dist
const del = require('del');




// Функции

// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: {
			baseDir: 'app/'
		}, // Указываем папку сервера
		notify: false, // Отключаем уведомления
	})
}


// Для стилей
function styles() {
	return src('app/scss/style.scss') // Выбираем источник:
		.pipe(scss()) // конвертация файла
		.pipe(concat('style.min.css')) // Конкатенируем в файл style.min.css
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 version'],
			grid: true
		})) // Создадим префиксы с помощью Autoprefixer
		.pipe(dest('app/css')) // Выгрузим результат в папку "app/css/"
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}



// Для скриптов
function scripts() {
	return src([ // Берём файлы из источников
			'node_modules/jquery/dist/jquery.js', // Пример подключения библиотеки
			'app/js/main.js' // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
		.pipe(concat('main.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/js')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

// Для изображений
function images() {
	return src('app/images/**/*.*') //Берём все изображения из папки источника
		.pipe(imagemin([ // Сжимаем и оптимизируем изображеня
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.mozjpeg({
				quality: 75,
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
						removeViewBox: true
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest('dist/images')) // Выгружаем оптимизированные изображения в папку назначения
}

// Для финальной сбрки проекта
function build() {
	return src([ // Выбираем нужные файлы
			'app/**/*.html',
			'app/css/style.min.css',
			'app/js/main.min.js',
		], {
			base: 'app'
		}) //Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

// Для удаления файлов с папки dist
function cleanDist() {
	return del('dist') // Удаляем всё содержимое папки "dist/"
}

// Для мониторинга процесса
function watching() {
	watch(['app/scss/**/*.scss'], styles); // Мониторим файлы на изменения (автоматически следим за процессом)
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.html']).on('change', browserSync.reload) // Мониторим файлы HTML на изменения
}



function deploy() {
	return src('./dist/**/*')
	pipe(deploy({
		remoteUrl: "https://emarkova22.github.io/portfolio-guitarist/",
		branch: "main"
	}))
};




// Экспортируем функции

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию watching () в таск 
exports.watching = watching;

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Удаление всех папок в /'dust'
exports.cleanDist = cleanDist;


// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleanDist, styles, scripts, images, build);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, watching);