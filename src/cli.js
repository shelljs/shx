#!/usr/bin/env node
import 'babel-polyfill';
import shx from './shx';

process.exit(shx(process.argv));
