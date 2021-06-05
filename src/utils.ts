import { GIF_VERSION } from './constant'

/**
 * 判断是否为 Gif 格式文件
 * @param version 文件头
 */
function isGif (version: string): boolean {
  return Object.keys(GIF_VERSION).includes(version)
}

/**
 * 十进制转八位二进制数组
 * @param value 十进制值
 */
function decimalToBinary(value: number): number[] {
  const binaryString = value.toString(2)
  const binaryArray = binaryString.split('').map(bs => parseInt(bs))
  return [...new Array(8 - binaryArray.length).fill(0), ...binaryArray]
}

export {
  isGif,
  decimalToBinary
}
