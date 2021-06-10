import { RGB } from './types';
/**
 * 判断是否为 Gif 格式文件
 * @param version 文件头
 */
declare function isGif(version: string): boolean;
/**
 * 十进制转八位二进制数组
 * @param value
 */
declare function decimalToBinary(value: number): number[];
/**
 * 格式化数据颜色
 * @param colorArray
 */
declare function formatColors(colorArray: Uint8Array): RGB[];
export { isGif, decimalToBinary, formatColors };
