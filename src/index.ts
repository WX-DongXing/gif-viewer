import { isGif, decimalToBinary, formatColors } from './utils'
import {Extension, Gif, ImageDescriptor, LogicalScreenDescriptor, RGB, SubImage, ImageData} from './types'
import {
  EXTENSION_FLAG,
  HEADER_BYTE_LENGTH, IMAGE_DATA_END_FLAG, IMAGE_DESCRIPTOR_BYTE_LENGTH,
  IMAGE_DESCRIPTOR_FLAG,
  LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH,
  TRAILER_FLAG
} from './constant'
import {ExtensionFactory} from './factory'

/**
 * 解码逻辑屏幕描述符
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
  const globalColorTableFlag = fieldBinary[0]

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
 * 解码图像描述符
 * @param arrayBuffer
 */
function decodeImageDescriptor (arrayBuffer: ArrayBuffer): ImageDescriptor {
  // 数据视图
  const dataView: DataView = new DataView(arrayBuffer)

  // 水平偏移
  const left: number = dataView.getUint16(1, true)

  // 垂直偏移
  const top: number = dataView.getUint16(3, true)

  // 子图像宽度
  const width: number = dataView.getUint16(5, true)

  // 子图像高度
  const height: number = dataView.getUint16(7, true)

  // 获取打包字段
  const packedField: number = dataView.getUint8(9)

  // 解析打包字段
  const fieldBinary: number[] = decimalToBinary(packedField)

  // 本地色彩表标识
  const localColorTableFlag: number = fieldBinary[0]

  // 扫描标识
  const interlaceFlag: number = fieldBinary[1]

  // 分类标识
  const sortFlag: number = fieldBinary[2]

  // 保留位
  const reserved: number = parseInt(fieldBinary.slice(3, 5).join(''), 2)

  // 本地色彩表大小
  const localColorTableSize: number = parseInt(fieldBinary.slice(5, 8).join(''), 2) + 1

  return {
    left,
    top,
    width,
    height,
    packedField: {
      localColorTableFlag,
      interlaceFlag,
      sortFlag,
      reserved,
      localColorTableSize
    }
  }
}

/**
 * 解码图像数据
 * @param arraybuffer
 */
function decodeImageData (arraybuffer: ArrayBuffer): ImageData[] {
  let byteLength = 0

  // 数据视图
  const  dataView: DataView = new DataView(arraybuffer)

  // 子图像数据
  const imageData: ImageData[] = []

  // 最小代码尺度
  const minCodeSize: number = dataView.getUint8(byteLength)

  byteLength += 1

  while (byteLength < arraybuffer.byteLength) {

    // 最小代码尺度下一个字节便是图像数据字节长度
    const imageDataByteLength: number = dataView.getUint8(byteLength)

    // 如果下一条数据为终止则跳出循环
    if (imageDataByteLength === IMAGE_DATA_END_FLAG) break

    // 图像数据
    const imageDataBuffer: ArrayBuffer = arraybuffer.slice(byteLength += 1, byteLength += imageDataByteLength)

    imageData.push({
      minCodeSize,
      byteLength,
      imageDataBuffer
    })
  }

  return imageData
}

/**
 * 解析子图像组数据
 * @param subImageBuffer
 */
function decodeSubImages (subImageBuffer: ArrayBuffer): SubImage[] {
  // 已解析字节数
  let byteLength = 0

  // 子图像数据
  const subImages: SubImage[] = [{}]

  const subDataView: DataView = new DataView(subImageBuffer)

  console.log(new Uint8Array(subImageBuffer))

  while (byteLength < subImageBuffer.byteLength) {

    // 当前子图像
    const subImage: SubImage = subImages[subImages.length - 1]

    // 读取第一个字节判断标识
    const flag: number = subDataView.getUint8(byteLength)

    console.log('flag: ', flag)

    // 如果是描述符标识则解析描述符
    if (flag === EXTENSION_FLAG) {

      // 扩展标识后一个字节判断扩展类型
      const extensionFlag = subDataView.getUint8(byteLength + 1)

      console.log('extension flag: ', extensionFlag)

      // 根据扩展标识创建不同的扩展解析器
      const extensionDecoder = ExtensionFactory.create(extensionFlag)

      // 解析扩展
      const extension: Extension = extensionDecoder(subImageBuffer, byteLength)

      if (subImage.extensions) {
        subImage.extensions.push(extension)
      } else {
        subImage.extensions = [extension]
      }

      byteLength += extension.byteLength

    } else if (flag === IMAGE_DESCRIPTOR_FLAG) {
      // 图像描述符数据十个字节
      const imageDescriptorBuffer = subImageBuffer.slice(byteLength, byteLength += IMAGE_DESCRIPTOR_BYTE_LENGTH)

      // 解析图像描述符
      const imageDescriptor: ImageDescriptor = decodeImageDescriptor(imageDescriptorBuffer)

      subImage.imageDescriptor = imageDescriptor

      const { localColorTableFlag, localColorTableSize } = imageDescriptor.packedField

      // 本地色彩表紧跟着图像描述符，如果存在则解析本地图像表，
      if (localColorTableFlag === 1) {
        // 本地色彩表字节长度
        const localColorTableLength: number = 3 * Math.pow(2, localColorTableSize)

        // 本地色彩表数据
        const localColorTableBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, localColorTableLength)

        byteLength += localColorTableLength

        // 本地色彩表
        subImage.localColorTable = formatColors(new Uint8Array(localColorTableBuffer))
      }

      // 图像数据在图像描述符或本地色彩表之后，解析图像数据
      const imageDataBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, subImageBuffer.byteLength)

      console.log(new Uint8Array(imageDataBuffer))

      // 解码子图像数据
      const imageData: ImageData[] = decodeImageData(imageDataBuffer)

      // 子图像字节长度
      const imageDataByteLength: number = imageData.reduce((acc: number, cur: ImageData) => acc += cur.byteLength, 1)

      byteLength += imageDataByteLength

      subImage.imageData = imageData

    } else if (flag === TRAILER_FLAG) {
      // 达到结尾标识表明已经解析完成
      byteLength = subImageBuffer.byteLength
    } else {
      console.error('子图像解析异常！')
      break
    }
  }

  return subImages
}

/**
 * 解码器
 * @param blob 图像数据
 */
async function decoder (blob: Blob): Promise<Gif | void> {
  const gif: Gif = new Gif()

  const arrayBuffer: ArrayBuffer = await blob.arrayBuffer()

  // 文件类型 6 个字节
  const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, HEADER_BYTE_LENGTH)

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // gif version
  const version = ASCIIDecoder.decode(headerBuffer)

  if (!isGif(version)) {
    return console.error('Not Gif!')
  }

  // 逻辑屏幕描述数据 7 个字节
  const logicalScreenBuffer = arrayBuffer.slice(HEADER_BYTE_LENGTH, LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH)

  // 解析屏幕逻辑描述符
  const logicalScreenDescriptor: LogicalScreenDescriptor = decodeLogicalScreenDescriptor(logicalScreenBuffer)

  const { globalColorTableFlag, globalColorTableSize } = logicalScreenDescriptor.packedField

  // 解析字节数
  let byteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH

  // 如果存在全局色彩表则进行解析
  if (globalColorTableFlag === 1) {

    // 全局色彩表字节长度
    const globalColorTableLength: number = 3 * Math.pow(2, globalColorTableSize)

    byteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH + globalColorTableLength

    // 全局色彩表数据
    const globalColorTableBuffer: ArrayBuffer = arrayBuffer.slice(LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH, byteLength)

    // 全局色彩表
    const globalColorTable: RGB[] = formatColors(new Uint8Array(globalColorTableBuffer))

    Object.assign(gif, { globalColorTable })
  }

  // 子图像组
  const subImageBuffer = arrayBuffer.slice(byteLength, arrayBuffer.byteLength)

  // 解码子图像数据
  const subImages: SubImage[] = decodeSubImages(subImageBuffer)

  return Object.assign(gif, { version, byteLength, arrayBuffer, logicalScreenDescriptor, subImages })
}

export default { decoder }
