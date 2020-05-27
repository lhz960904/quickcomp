import ora from 'ora';
import ejs from 'ejs';
import fse from 'fs-extra';
import chalk from 'chalk';
import execa from 'execa';
import { resolve, relative } from 'path';
import inquirer from 'inquirer';
import Metalsmith from 'metalsmith';
import logSymbols from 'log-symbols';

interface Answer {
  packageName: string;
  packageDescription: string;
  isTypeScript: boolean;
}

export default async function create(pkgName: string) {
  const cwd = process.cwd();
  const targetDir = resolve(cwd, pkgName);

  if (fse.existsSync(targetDir)) {
    console.error(logSymbols.error, chalk.red(`${pkgName}目录已存在！`));
    process.exit(1);
  }

  const answer: Answer = await inquirer.prompt([
    {
      name: 'packageName',
      message: 'name of package',
      default: pkgName,
    },
    {
      name: 'packageDescription',
      message: 'description of package',
      default: 'React component created by quickcomp',
    },
    {
      name: 'isTypeScript',
      message: 'use typescript or not',
      default: true,
      type: 'confirm',
    },
  ]);

  const spinner = ora('正在生成项目模板...').start();

  generateTemplate(answer, targetDir)
    .then(async (res) => {
      spinner.stop();
      console.log(logSymbols.success, chalk.green('模板创建成功！'));
      console.log(chalk.green(`\ncd ${relative(cwd, targetDir)}\n\nnpm install\n\nnpm run start`));
    })
    .catch((err) => {
      console.error(logSymbols.error, chalk.red(`创建失败：${err.message}`));
    });
}

function generateTemplate(matadata: Answer, targetDir: string) {
  return new Promise((resolve, reject) => {
    Metalsmith(__dirname)
      .metadata(matadata)
      .clean(false)
      .source('../template')
      .destination(targetDir)
      .use(templatePlugin)
      .build((err) => {
        err ? reject(err) : resolve();
      });
  });
}

function templatePlugin(
  files: Metalsmith.Files,
  metalsmith: Metalsmith,
  done: Metalsmith.Callback
) {
  const meta = metalsmith.metadata() as Answer;
  // 去除变量
  Object.keys(files).forEach((fileName) => {
    const s = files[fileName].contents.toString();
    files[fileName].contents = ejs.render(s, meta);
  });

  // 是否ts编写
  if (!meta.isTypeScript) {
    const packJSON = JSON.parse(files['package.json'].contents);
    delete packJSON.devDependencies.typescript;
    files['package.json'].contents = JSON.stringify(packJSON, null, 2);
    delete files['tsconfig.json'];
    delete files['src/index.tsx'];
  } else {
    delete files['src/index.jsx'];
  }

  setImmediate(done);
}
