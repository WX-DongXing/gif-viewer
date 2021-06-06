import { isGif, decimalToBinary, formatColors } from './utils'
import {Extension, Gif, LogicalScreenDescriptor, RGB} from './types';
import {
  EXTENSION_FLAG, HEADER_BYTE_LENGTH, LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH
} from './constant'
import {ExtensionFactory} from "./factory";

/**
 * 解析逻辑屏幕描述符
 * @param arrayBuffer
 */
function decodeLogicalScreenDescriptor (arrayBuffer: ArrayBuffer): LogicalScreenDescriptor {

  // 创建数据视图
  const dataView = new DataView(arrayBuffer)

  // 以低字节序读取两个字节为宽
  const width: number = dataView.getUint16(0, true)

  // 以低字节序读取两个字节为高
  const height: number = dataView.getUint16(2, true)

  // 获取打包字段
  const packedField: number = dataView.getUint8(4)

  // 解析打包字段
  const fieldBinary: number[] = decimalToBinary(packedField)

  // 全局颜色表标识
  const globalColorTableFlag = Boolean(fieldBinary[0])

  // 颜色分辨率
  const colorResolution: number = parseInt(fieldBinary.slice(1, 4).join(''), 2)

  // 排序标志，可忽略这个标识
  const sortFlag: number = fieldBinary[4]

  // 全局颜色表大小
  const globalColorTableSize: number = parseInt(fieldBinary.slice(5, 8).join(''), 2) + 1

  // 背景颜色索引
  const backgroundColorIndex: number = dataView.getUint8(5)

  // 像素宽高比
  const pixelAspectRatio: number = dataView.getUint8(6)

  return {
    width,
    height,
    packedField: {
      globalColorTableFlag,
      colorResolution,
      sortFlag,
      globalColorTableSize
    },
    backgroundColorIndex,
    pixelAspectRatio
  }
}

/**
 * 解析子图像组数据
 * @param subImageBuffer
 */
function decodeSubImages (subImageBuffer: ArrayBuffer): void {
  let decodeByteLength = 0

  const subDataView: DataView = new DataView(subImageBuffer)

  // 读取第一个字节判断标识
  const flag: number = subDataView.getUint8(0)

  // 如果是描述符标识则解析描述符
  if (flag === EXTENSION_FLAG) {
    // 扩展标识后一个字节判断扩展类型
    const extensionFlag = subDataView.getUint8(1)

    const extensionDecoder = ExtensionFactory.create(extensionFlag)

    const extension: Extension = extensionDecoder(subImageBuffer)

    console.log(extension)
  }
}

/**
 * 解码器
 * @param blob 图像数据
 */
async function decoder (blob: Blob): Promise<Gif | void> {

  const arrayBuffer: ArrayBuffer = await blob.arrayBuffer()

  // 文件类型 6 个字节
  const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, HEADER_BYTE_LENGTH)

  const decoder: TextDecoder = new TextDecoder('utf8')

  // gif version
  const version = decoder.decode(headerBuffer)

  if (!isGif(version)) {
    return console.error('Not Gif!')
  }

  // 逻辑屏幕描述数据 7 个字节
  const logicalScreenBuffer = arrayBuffer.slice(HEADER_BYTE_LENGTH, LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH)

  // 解析屏幕逻辑描述符
  const logicalScreeDescriptor: LogicalScreenDescriptor = decodeLogicalScreenDescriptor(logicalScreenBuffer)

  const { globalColorTableFlag, globalColorTableSize } = logicalScreeDescriptor.packedField

  // 解析字节数
  let parsedByteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH

  // 如果存在全局色彩表则进行解析
  if (globalColorTableFlag) {

    // 全局色彩表字节长度
    const globalColorTableLength: number = 3 * Math.pow(2, globalColorTableSize)

    parsedByteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH + globalColorTableLength

    // 全局色彩表数据
    const globalColorTableBuffer: ArrayBuffer = arrayBuffer.slice(LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH, parsedByteLength)

    // 全局色彩比RGB
    const globalRGBColors: RGB[] = formatColors(new Uint8Array(globalColorTableBuffer))
  }

  // 子图像组
  const subImageBuffer = arrayBuffer.slice(parsedByteLength, arrayBuffer.byteLength - 1)

  decodeSubImages(subImageBuffer)
}

export default { decoder }
