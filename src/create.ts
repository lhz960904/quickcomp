import fse from 'fs-extra';
import { resolve } from 'path';
import chalk from 'chalk';

export default function create(pkgName: string) {
  const cwd = process.cwd();
  const targetDir = resolve(cwd, pkgName);
  if (fse.existsSync(targetDir)) {
    console.log(chalk.red(`${pkgName}目录已存在！`));
    process.exit(1);
  }
  fse.copySync(resolve(__dirname, '../template'), targetDir);
}
