/**
 * 字符串转成大驼峰命名格式
 * @example hello-world => HelloWorld
 */
export function camelCase(str: string): string {
  return str.replace(/\b\w/g, (v) => v.toUpperCase()).replace(/-/g, '');
}

/**
 * 给定文件路径判断是否是ts文件
 */
export function isTsFile(path: string): boolean {
  return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
}
