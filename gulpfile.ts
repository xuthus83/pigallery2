import * as gulp from 'gulp';
import * as fs from 'fs';
import * as zip from 'gulp-zip';
import * as ts from 'gulp-typescript';
// @ts-ignore
import * as jeditor from 'gulp-json-editor';


const exec = require('child_process').exec;

const translationFolder = 'translate';
const tsBackendProject = ts.createProject('tsconfig.json');
declare var process: NodeJS.Process;

const getSwitch = (name: string, def: string = null): string => {
  name = '--' + name;
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith(name + '=')) {
      return process.argv[i].replace(name + '=', '').trim();
    }
    if (process.argv[i].startsWith(name)) {
      if (i + 1 < process.argv.length) {
        return process.argv[i + 1].trim();
      }
      return 'true';
    }
  }
  return def;
};

gulp.task('build-backend', function () {
  return gulp.src([
    'src/common/**/*.ts',
    'src/backend/**/*.ts'], {base: '.'})
    .pipe(tsBackendProject())
    .js
    .pipe(gulp.dest('./release'));

});

const handleError = (cb: (err: any) => void) => {
  return (err: any, stdout: string, stderr: string) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  };
};

const createFrontendTask = (type: string, script: string) => {
  gulp.task(type, (cb) => {
    exec(script, handleError(cb));
  });
};


const getLanguages = () => {
  if (!fs.existsSync('./src/frontend/' + translationFolder)) {
    return [];
  }
  const dirCont = fs.readdirSync('./src/frontend/' + translationFolder);
  const files: string[] = dirCont.filter((elm) => {
    return elm.match(/.*\.[a-zA-Z]+\.(xlf)/ig);
  });

  // get languages to filter
  let languageFilter: string[] = null;
  if (getSwitch('languages')) {
    languageFilter = getSwitch('languages').split(',');
  }

  let languages = files.map((f: string) => {
    return f.split('.')[1];
  });

  if (languageFilter !== null) {
    languages = languages.filter((l) => {
      return languageFilter.indexOf(l) !== -1;
    });
  }
  return languages;
};

gulp.task('build-frontend', (() => {
  const languages = getLanguages().filter((l) => {
    return l !== 'en';
  });
  const tasks = [];
  createFrontendTask('build-frontend-release default',
    'ng build --aot --prod --output-path=./release/dist --no-progress --i18n-locale=en' +
    ' --i18n-format xlf --i18n-file src/frontend/' + translationFolder + '/messages.en.xlf' +
    ' --i18n-missing-translation warning');
  tasks.push('build-frontend-release default');
  for (let i = 0; i < languages.length; i++) {
    createFrontendTask('build-frontend-release ' + languages[i],
      'ng build --aot --prod --output-path=./release/dist/' + languages[i] +
      ' --no-progress --i18n-locale=' + languages[i] +
      ' --i18n-format xlf --i18n-file src/frontend/' + translationFolder + '/messages.' + languages[i] + '.xlf' +
      ' --i18n-missing-translation warning');
    tasks.push('build-frontend-release ' + languages[i]);
  }
  return gulp.series(...tasks);
})());

gulp.task('copy-static', function () {
  return gulp.src([
    'src/backend/model/diagnostics/blank.jpg',
    'README.md',
  //  'package-lock.json', should not add, it keeps optional packages optional even with --force-opt-packages.
    'LICENSE'], {base: '.'})
    .pipe(gulp.dest('./release'));
});

gulp.task('copy-package', function () {
  return gulp.src([
    'package.json'], {base: '.'})
    .pipe(jeditor((json: {
      devDependencies: { [key: string]: string },
      scripts: { [key: string]: string },
      dependencies: { [key: string]: string },
      optionalDependencies: { [key: string]: string },
      buildTime: string,
      buildCommitHash: string
    }) => {
      delete json.devDependencies;
      json.scripts = {start: 'node ./src/backend/index.js'};

      if (getSwitch('skip-opt-packages')) {
        const skipPackages = getSwitch('skip-opt-packages').split(',');
        for (const pkg of skipPackages) {
          for (const key of Object.keys(json.optionalDependencies)) {
            if (key.indexOf(pkg) !== -1) {
              delete json.optionalDependencies[key];
            }
          }
        }
      }

      if (!!getSwitch('force-opt-packages')) {
        for (const key of Object.keys(json.optionalDependencies)) {
          json.dependencies[key] = json.optionalDependencies[key];
        }
        delete json.optionalDependencies;
      }
      json.buildTime = (new Date()).toISOString();

      try {
        json.buildCommitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim();
      } catch (e) {
      }

      return json;
    }))
    .pipe(gulp.dest('./release'));
});


gulp.task('zip-release', function () {
  return gulp.src(['release/**/*'], {base: './release'})
    .pipe(zip('pigallery2.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('create-release', gulp.series('build-frontend', 'build-backend', 'copy-static', 'copy-package', 'zip-release'));


const simpleBuild = (isProd: boolean) => {
  const languages = getLanguages().filter((l) => {
    return l !== 'en';
  });
  const tasks = [];
  let cmd = 'ng build --aot ';
  if (isProd) {
    cmd += ' --prod --no-extract-licenses ';
  }
  createFrontendTask('build-frontend default', cmd + '--output-path=./dist --no-progress --no-progress --i18n-locale en' +
    ' --i18n-format=xlf --i18n-file=src/frontend/' + translationFolder + '/messages.en.xlf' + ' --i18n-missing-translation warning');
  tasks.push('build-frontend default');
  if (!process.env.CI) { // don't build languages if running in CI
    for (let i = 0; i < languages.length; i++) {
      createFrontendTask('build-frontend ' + languages[i], cmd +
        '--output-path=./dist/' + languages[i] +
        ' --no-progress --i18n-locale ' + languages[i] +
        ' --i18n-format=xlf --i18n-file=src/frontend/' + translationFolder +
        '/messages.' + languages[i] + '.xlf' + ' --i18n-missing-translation warning');
      tasks.push('build-frontend ' + languages[i]);
    }
  }
  return gulp.series(...tasks);
};

gulp.task('extract-locale', (cb) => {
  console.log('creating source translation file:  locale.source.xlf');
  exec('ng xi18n --out-file=./../../locale.source.xlf  --i18n-format=xlf --i18n-locale=en',
    {maxBuffer: 1024 * 1024}, (error: any, stdOut: string, stdErr: string) => {
      console.log(stdOut);
      console.log(stdErr);
      if (error) {
        return cb(error);
      }
      exec('ngx-extractor -i src/frontend/**/*.ts -f xlf --out-file locale.source.xlf',
        handleError(cb));
    });
});

const translate = (list: any[], cb: (err: any) => void) => {
  const localsStr = '"[\\"' + list.join('\\",\\"') + '\\"]"';
  exec('xlf-google-translate --source-lang="en" --source-file="./locale.source.xlf" --destination-folder="./src/frontend/"' +
    translationFolder + ' --destination-languages=' + localsStr,
    handleError(cb));
};
const merge = (list: any[], cb: (err: any) => void) => {
  const localsStr = '"[\\"' + list.join('\\",\\"') + '\\"]"';
  exec('xlf-google-translate --method="extend-only" --source-lang="en" --source-file="./locale.source.xlf" --destination-folder="./src/frontend/"' +
    translationFolder + ' --destination-languages=' + localsStr,
    handleError(cb));
};

gulp.task('update-translation-only', function (cb) {
  translate(getLanguages(), cb);
});
gulp.task('merge-translation-only', function (cb) {
  merge(getLanguages(), cb);
});

gulp.task('update-translation', gulp.series('extract-locale', 'update-translation-only'));

gulp.task('merge-new-translation', gulp.series('extract-locale', 'merge-translation-only'));


gulp.task('add-translation-only', (cb) => {
  const languages = getLanguages();
  let lng = null;
  for (let i = 0; i < process.argv.length - 1; i++) {
    if (process.argv[i] === 'add-translation') {
      lng = process.argv[i + 1].replace('--', '');
    }
  }
  if (lng == null) {
    console.error('Error: set language with \'--\' e.g: npm run add-translation -- --en');
    return cb();
  }
  if (languages.indexOf(lng) !== -1) {
    console.error('Error: language already exists, can\'t add. These language(s) already exist(s): ' + languages);
    return cb();
  }
  translate([lng], cb);
});


gulp.task('add-translation', gulp.series('extract-locale', 'add-translation-only'));


gulp.task('build-dev', simpleBuild(false));
gulp.task('build-prod', simpleBuild(true));
