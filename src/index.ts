import { decimalToBinary, formatColors, isGif } from './utils'
import { Extension, Gif, Image, ImageData, ImageDescriptor, LogicalScreenDescriptor, RGB, SubImage } from './types'
import {
  EXTENSION_TYPE,
  EXTENSION_FLAG,
  HEADER_BYTE_LENGTH,
  IMAGE_DATA_END_FLAG,
  IMAGE_DESCRIPTOR_BYTE_LENGTH,
  IMAGE_DESCRIPTOR_FLAG,
  LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH,
  TRAILER_FLAG
} from './constant'
import { ExtensionFactory } from './factory'

/**
 * 解码逻辑屏幕描述符
 * @param arrayBuffer
 */
function decodeLogicalScreenDescriptor (arrayBuffer: ArrayBuffer): LogicalScreenDescriptor {
  let byteLength = 0

  // 创建数据视图
  const dataView = new DataView(arrayBuffer)

  // 以低字节序读取两个字节为宽
  const width: number = dataView.getUint16(byteLength, true)

  // 以低字节序读取两个字节为高
  const height: number = dataView.getUint16(byteLength += 2, true)

  // 获取打包字段
  const packedField: number = dataView.getUint8(byteLength += 2)

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
  const backgroundColorIndex: number = dataView.getUint8(byteLength += 1)

  // 像素宽高比
  const pixelAspectRatio: number = dataView.getUint8(byteLength += 1)

  // real byteLength = index + 1 （1字节）
  byteLength += 1

  return {
    byteLength,
    arrayBuffer,
    width,
    height,
    packedField: {
      globalColorTableFlag,
      colorResolution,
      sortFlag,
      globalColorTableSize
    },
    backgroundColorIndex,
    pixelAspectRatio,
  }
}

/**
 * 解码图像描述符
 * @param arrayBuffer
 */
function decodeImageDescriptor (arrayBuffer: ArrayBuffer): ImageDescriptor {

  // 字节
  let byteLength = 0

  // 数据视图
  const dataView: DataView = new DataView(arrayBuffer)

  // 水平偏移
  const left: number = dataView.getUint16(byteLength += 1, true)

  // 垂直偏移
  const top: number = dataView.getUint16(byteLength += 2, true)

  // 子图像宽度
  const width: number = dataView.getUint16(byteLength += 2, true)

  // 子图像高度
  const height: number = dataView.getUint16(byteLength += 2, true)

  // 获取打包字段
  const packedField: number = dataView.getUint8(byteLength += 2)

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

  // real byteLength = index + 1
  byteLength += 1

  return {
    byteLength,
    arrayBuffer,
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
function decodeImageData (arraybuffer: ArrayBuffer): ImageData {
  let byteLength = 0

  // 数据视图
  const  dataView: DataView = new DataView(arraybuffer)

  // 最小代码尺度
  const minCodeSize: number = dataView.getUint8(byteLength)

  // 图像数据
  const imageDataBuffers: ArrayBuffer[] = []

  // 最小代码尺度下一个字节便是图像数据字节长度
  let imageDataByteLength: number = dataView.getUint8(byteLength += 1)

  while (imageDataByteLength !== IMAGE_DATA_END_FLAG) {

    // 图像数据
    const imageDataBuffer: ArrayBuffer = arraybuffer.slice(byteLength += 1, byteLength += imageDataByteLength)

    imageDataBuffers.push(imageDataBuffer)

    imageDataByteLength = dataView.getUint8(byteLength)
  }

  // real byteLength = index + 1 （1字节）
  byteLength += 1

  return {
    byteLength,
    minCodeSize,
    imageDataBuffers
  }
}

/**
 * 解析子图像组数据
 * @param subImageBuffer
 */
function decodeSubImages (subImageBuffer: ArrayBuffer): SubImage {
  // 解析字节数
  let byteLength = 0

  // 图像控制扩展
  let graphicsControlExtension: Extension = null

  // 子图像数据
  const subImage: SubImage = { extensions: [], images: [], byteLength }

  // 子图像数据视图
  const subDataView: DataView = new DataView(subImageBuffer)

  // 标识
  let flag: number = subDataView.getUint8(byteLength)

  while (flag !== TRAILER_FLAG) {

    // 如果是描述符标识则解析描述符
    if (flag === EXTENSION_FLAG) {

      // 扩展标识后一个字节判断扩展类型
      const extensionFlag = subDataView.getUint8(byteLength + 1)

      // 根据扩展标识创建不同的扩展解析器
      const extensionDecoder = ExtensionFactory.create(extensionFlag)

      // 解析扩展
      const extension: Extension = extensionDecoder(subImageBuffer, byteLength)

      // 如果为图像控制扩展，将其置于子图像中，其余的置于扩展中
      if (extension.type === EXTENSION_TYPE.graphics_control) {
        graphicsControlExtension = extension
      } else {
        subImage.extensions.push(extension)
      }

      byteLength += extension.byteLength

    } else if (flag === IMAGE_DESCRIPTOR_FLAG) {

      const image: Image = { graphicsControlExtension }

      // 图像描述符数据十个字节
      const imageDescriptorBuffer = subImageBuffer.slice(byteLength, byteLength += IMAGE_DESCRIPTOR_BYTE_LENGTH)

      // 解析图像描述符
      const imageDescriptor: ImageDescriptor = decodeImageDescriptor(imageDescriptorBuffer)

      Object.assign(image, { imageDescriptor })

      const { localColorTableFlag, localColorTableSize } = imageDescriptor.packedField

      // 本地色彩表紧跟着图像描述符，如果存在则解析本地图像表，
      if (localColorTableFlag === 1) {
        // 本地色彩表字节长度
        const localColorTableLength: number = 3 * Math.pow(2, localColorTableSize)

        // 本地色彩表数据
        const localColorTableBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, byteLength += localColorTableLength)

        // 本地色彩表
        const localColorTable: RGB[] = formatColors(new Uint8Array(localColorTableBuffer))

        Object.assign(image, { localColorTable })
      }

      // 图像数据在图像描述符或本地色彩表之后，解析图像数据
      const imageDataBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, subImageBuffer.byteLength)

      // 解码子图像数据
      const imageData: ImageData = decodeImageData(imageDataBuffer)

      byteLength += imageData.byteLength

      Object.assign(image, { imageData })

      subImage.images.push(image)

    } else {
      console.error('子图像解析异常！')
      break
    }

    // 读取第一个字节判断标识
    flag = subDataView.getUint8(byteLength)
  }

  // real byteLength = index + 1
  byteLength += 1

  return Object.assign(subImage, { byteLength })
}

/**
 * 解码器
 * @param file 图像数据
 */
async function decoder (file: Blob | ArrayBuffer | File): Promise<Gif | void> {

  let arrayBuffer: ArrayBuffer

  if (file instanceof Blob) {

    arrayBuffer = await file.arrayBuffer()

  } else if (file instanceof File) {

    arrayBuffer = await new Promise<ArrayBuffer>(resolve => {
      const fileReader: FileReader = new FileReader()
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer)
      fileReader.readAsArrayBuffer(file)
    })

  } else if (file instanceof ArrayBuffer) {

    arrayBuffer = file

  } else {

    return console.error('Params file must be Blob or ArrayBuffer of File!')
  }

  // gif
  const gif: Gif = new Gif()

  // 解析字节数
  let byteLength = 0

  // 文件类型 6 个字节
  const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, byteLength += HEADER_BYTE_LENGTH)

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // gif version
  const version = ASCIIDecoder.decode(headerBuffer)

  if (!isGif(version)) {
    return console.error('Not Gif!')
  }

  // 逻辑屏幕描述数据 7 个字节
  const logicalScreenBuffer: ArrayBuffer = arrayBuffer.slice(byteLength, byteLength += LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH)

  // 解析屏幕逻辑描述符
  const logicalScreenDescriptor: LogicalScreenDescriptor = decodeLogicalScreenDescriptor(logicalScreenBuffer)

  const { globalColorTableFlag, globalColorTableSize } = logicalScreenDescriptor.packedField

  // 如果存在全局色彩表则进行解析
  if (globalColorTableFlag === 1) {

    // 全局色彩表字节长度
    const globalColorTableLength: number = 3 * Math.pow(2, globalColorTableSize)

    // 全局色彩表数据
    const globalColorTableBuffer: ArrayBuffer = arrayBuffer.slice(byteLength, byteLength += globalColorTableLength)

    // 全局色彩表
    const globalColorTable: RGB[] = formatColors(new Uint8Array(globalColorTableBuffer))

    Object.assign(gif, { globalColorTable, globalColorTableBuffer })
  }

  // 子图像组
  const subImageBuffer = arrayBuffer.slice(byteLength, arrayBuffer.byteLength)

  // 解码子图像数据
  const subImage: SubImage = decodeSubImages(subImageBuffer)

  byteLength += subImage.byteLength

  return Object.assign(gif, { version, byteLength, arrayBuffer, headerBuffer, logicalScreenDescriptor, subImage })
}

export default { decoder, Gif }
