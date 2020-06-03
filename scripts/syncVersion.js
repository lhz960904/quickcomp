const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs');

const packageJsonPath = resolve(__dirname, '../package.json');
const tempaltePackageJsonPath = resolve(__dirname, '../template/package.json');

function getPackageJSON(path) {
  const packageStr = readFileSync(path, 'utf-8');
  try {
    return JSON.parse(packageStr);
  } catch (error) {
    throw new Error(error);
  }
}

const { version } = getPackageJSON(packageJsonPath);

const tempaltePackageJson = getPackageJSON(tempaltePackageJsonPath);

tempaltePackageJson.devDependencies.quickcomp = version;

writeFileSync(tempaltePackageJsonPath, JSON.stringify(tempaltePackageJson, null, 2));
