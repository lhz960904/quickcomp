/**
 * 字符串转成大驼峰命名格式
 * @example hello-world => HelloWorld
 */
export function camelCase(str: string): string {
  return str.replace(/\b\w/g, (v) => v.toUpperCase()).replace(/-/g, '');
}
