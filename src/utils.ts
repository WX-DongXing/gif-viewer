import { GIF_VERSION } from './constant'
import { RGB } from './types'

/**
 * 判断是否为 Gif 格式文件
 * @param version 文件头
 */
function isGif (version: string): boolean {
  return Object.keys(GIF_VERSION).includes(version)
}

/**
 * 十进制转八位二进制数组
 * @param value
 */
function decimalToBinary(value: number): number[] {
  return [ ...value.toString(2).padStart(8, '0').split('').map(bs => parseInt(bs)) ]
}

/**
 * 格式化数据颜色
 * @param colorArray
 */
function formatColors(colorArray: Uint8Array): RGB[] {
  const colors: RGB[] = []
  for (let i = 0; i < colorArray.length; i++) {
    const value = colorArray[i]
    const index = i % 3
    if (index === 0) {
      colors.push(String(value))
    } else {
      colors[Math.floor(i / 3)] += `,${value}`
    }
  }
  return colors
}

export {
  isGif,
  decimalToBinary,
  formatColors
}
