// @ts-ignore
import storybook from '@storybook/react/standalone';
import generator from './sotrybook/generator';
import { join, extname } from 'path';
import { readFileSync, existsSync } from 'fs';
import rimraf from 'rimraf';
import vfs from 'vinyl-fs';
import gulpTs from 'gulp-typescript';
import gulpIf from 'gulp-if';
import gulpLess from 'gulp-less';
import { isTsFile } from './utils';
import getBabelConfig from './utils/getBabelConfig';
import through from 'through2';
import * as babel from '@babel/core';
import * as ts from 'typescript';

function getTSConfig() {
  const tsconfigPath = join(process.cwd(), 'tsconfig.json');

  if (existsSync(tsconfigPath)) {
    const readFile = (path: string) => readFileSync(path, 'utf-8');
    const result = ts.readConfigFile(tsconfigPath, readFile);
    if (result.error) return {};
    return result.config.compilerOptions || {};
  }

  return {};
}

function transform(): NodeJS.ReadWriteStream {
  return through.obj((file, env, cb) => {
    try {
      const transformContet = babel.transform(file.contents, {
        ...getBabelConfig(),
        filename: file.path,
      })?.code;
      if (!transformContet) throw new Error();
      file.contents = Buffer.from(transformContet);
      // .jsx -> .js
      file.path = file.path.replace(extname(file.path), '.js');
      cb(null, file);
    } catch (e) {
      console.log(`Compiled faild: ${file.path}`);
      console.log(e);
      cb(null);
    }
  });
}

function buildSource(srcPath: string, targetPath: string) {
  const patterns = [
    join(srcPath, '**/*'),
    `!${join(srcPath, '**/fixtures{,/**}')}`,
    `!${join(srcPath, '**/demos{,/**}')}`,
    `!${join(srcPath, '**/__test__{,/**}')}`,
    `!${join(srcPath, '**/*.mdx')}`,
    `!${join(srcPath, '**/*.md')}`,
    `!${join(srcPath, '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)')}`,
  ];

  const tsConfig = getTSConfig();

  return new Promise((resolve) => {
    const stream = vfs
      .src(patterns)
      .pipe(gulpIf((f) => isTsFile(f.path), gulpTs(tsConfig)))
      .pipe(gulpIf((f) => /\.less$/.test(f.path), gulpLess()))
      .pipe(gulpIf((f) => /\.jsx?$/.test(f.path), transform()))
      .pipe(vfs.dest(targetPath));
    stream.on('end', resolve);
  });
}

export default async function serve() {
  const { storybookPath } = generator(process.cwd());

  const srcPath = join(process.cwd(), 'src');
  const targetPath = join(process.cwd(), 'libx');
  const docsPath = join(process.cwd(), 'docs');

  // clear
  rimraf.sync(targetPath);
  rimraf.sync(docsPath);

  // build source code
  await buildSource(srcPath, targetPath);

  // build docs
  await storybook({
    mode: 'static',
    outputDir: docsPath,
    configDir: storybookPath,
  });
}
