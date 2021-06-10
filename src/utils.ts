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
  return colorArray.reduce((acc: RGB[], cur: number, index: number) => {
    const i = index % 3
    switch (i) {
      case 0:
        acc.push({ r: cur, g: 0, b: 0 })
        break
      case 1:
        Object.assign(acc[acc.length - 1], { g: cur })
        break
      case 2:
        Object.assign(acc[acc.length - 1], { b: cur })
        break
    }
    return acc
  }, [])
}

export {
  isGif,
  decimalToBinary,
  formatColors
}
