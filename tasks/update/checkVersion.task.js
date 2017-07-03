var gulp = require('gulp');

var lastVersion = exec('npm show tlow version', {
    silent: true
}).stdout.trim();
