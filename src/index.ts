import { decimalToBinary, formatColors, isGif } from './utils'
import {
  ColorTable,
  Gif, GifHandler, Header,
  Image, ImageDescriptor,
  LogicalScreenDescriptor,
  SubImage, SubImageData,
  RGB,Extension,
} from './types'
import {
  EXTENSION_TYPE,
  EXTENSION_FLAG,
  HEADER_BYTE_LENGTH,
  IMAGE_DATA_END_FLAG,
  IMAGE_DESCRIPTOR_BYTE_LENGTH,
  IMAGE_DESCRIPTOR_FLAG,
  LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH,
  TRAILER_FLAG, CLEAR_CODE, END_OF_INFORMATION
} from './constant'
import { ExtensionFactory } from './factory'


class GifViewer implements GifHandler {
  gif: Gif

  constructor() {
    this.gif = new Gif()
  }

  /**
   * 解码头部信息，判断是否为GIF格式
   * @param arrayBuffer
   */
  decodeHeader (arrayBuffer: ArrayBuffer): Header | void {

    // 创建 ASCII 解码器
    const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

    // gif version
    const version: string = ASCIIDecoder.decode(arrayBuffer)

    if (!isGif(version)) {
      return console.error('Not Gif!')
    }

    return {
      version,
      arrayBuffer,
      byteLength: HEADER_BYTE_LENGTH
    }
  }

  /**
   * 解码逻辑屏幕描述符
   * @param arrayBuffer
   */
  decodeLogicalScreenDescriptor (arrayBuffer: ArrayBuffer): LogicalScreenDescriptor {
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

    // real byteLength = index + 1
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
  decodeImageDescriptor (arrayBuffer: ArrayBuffer): ImageDescriptor {

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

    // real byteLength = index + 1 （1字节）
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
   * @param bufferArray 图像数据
   * @param minCodeSize 最小代码尺度
   * @param colorTable 本地或全局色彩表
   * @param imageDescriptor 图像描述符
   * @param graphicsControlExtension 图像控制扩展
   */
  decodeImageDataBuffer(bufferArray: Uint8Array, minCodeSize: number, colorTable: RGB[], imageDescriptor: ImageDescriptor, graphicsControlExtension?: Extension): ImageData {

    // 数据视图
    const dataView: DataView = new DataView(bufferArray.buffer)

    // 子图像宽高
    const { width, height } = imageDescriptor

    // 透明颜色标识及索引
    const { transparentColorIndex, packedField } = graphicsControlExtension || {}

    // 色彩表索引
    const colorTableMap = new Map(Object.entries(colorTable))

    // 编码表
    let codeTable: Map<number, Array<number>>

    // 编码表最大索引值
    let codeTableMaxIndex = 0

    // 编码历史
    let codes: Map<number, number>

    let filledLength = 0

    // 解码输出
    const output: Uint8Array = new Uint8Array(width * height)

    // 索引
    let index = 0

    // 字节长度
    let byteSize = 0

    // 读取索引
    let readIndex = 0

    // 字节剩余值
    let reserved = ''

    // 重置编码表
    const initCodeTable = (): void=> {
      // 默认编码表
      codeTable = new Map(Object.keys(colorTable).map((key: string) => [+key, [+key]]))

      // 以最小代码尺度，采用幂等计算特殊码的值，但是存在空余的情况
      codeTableMaxIndex = Math.pow(2, minCodeSize)

      // 设置清除码
      codeTable.set(codeTableMaxIndex, [CLEAR_CODE])

      // 设置结束码
      codeTable.set(codeTableMaxIndex += 1, [END_OF_INFORMATION])

      // 设置字节长度
      byteSize = minCodeSize + 1

      // 初始化索引
      index = 0

      // 初始化编码历史
      codes = new Map()
    }

    // 初始化编码表
    initCodeTable()

    while (readIndex !== dataView.byteLength) {
      // 二进制字节

      if (reserved.length < byteSize) {

        if (readIndex + 1 === dataView.byteLength) {
          const byte = dataView.getUint8(readIndex).toString(2).padStart(8, '0')
          reserved = byte + reserved
          readIndex += 1
        } else {
          const byte = dataView.getUint16(readIndex, true).toString(2).padStart(16, '0')
          reserved = byte + reserved
          readIndex += 2
        }
      }

      const byteValue = new Array(byteSize).fill(null).reduce((acc: string, _, i: number) => {
        acc = reserved.substr(-(i + 1), 1) + acc
        return acc
      }, '')

      reserved = reserved.substr(0, reserved.length - byteSize)

      // 十进制字节
      const code: number = parseInt(byteValue, 2)

      // 当前 code 对应颜色索引值
      const colorIndex = codeTable.get(code) ?? []

      // 如果对应清除码，则重置编码表
      if (colorIndex.includes(CLEAR_CODE)) {
        initCodeTable()
        continue
      } else if (colorIndex.includes(END_OF_INFORMATION)) {
        // 如果对应结束码，结束解码
        break
      }

      // 将 code 值存储
      codes.set(index, code)

      // 如果为第一个值，直接将颜色索引输出
      if (index === 0) {
        output.set(colorIndex, filledLength)
        filledLength += colorIndex.length
      } else {
        const P = codeTable.get(codes.get(index - 1))

        if (codeTable.has(code)) {
          const [K] = colorIndex
          codeTable.set(codeTableMaxIndex += 1, P.concat(K))
          output.set(colorIndex, filledLength)
          filledLength += colorIndex.length
        } else {
          const [K] = P
          const R = P.concat(K)
          codeTable.set(codeTableMaxIndex += 1, R)
          output.set(R, filledLength)
          filledLength += R.length
        }
      }

      // 索引增加
      index += 1

      // 字节数根据编码表而更新
      if (codeTableMaxIndex + 1 === Math.pow(2, byteSize) && byteSize < 12) {
        byteSize += 1
      }
    }

    const colorArray = new Uint8ClampedArray(output.length * 4)

    const transparentColorFlag = packedField?.transparentColorFlag === 1

    console.log(output)

    for (let i = 0; i < output.length; i++) {
      const colorIndex: number = output[i]
      const color: Uint8Array = colorTableMap.get(String(colorIndex))
      const transparentColor = (transparentColorFlag && +colorIndex === transparentColorIndex) ? 0 : 255
      colorArray.set(color, i * 4)
      colorArray[i * 4 + 3] = transparentColor
    }

    if (imageDescriptor.packedField.interlaceFlag === 0) {
      return new ImageData(colorArray, width, height)
    } else {

      // pass 1 从第0行开始，每隔8行扫描一次
      // pass 2 从第4行开始，每隔8行扫描一次
      // pass 3 从第2行开始，每隔4行扫描一次
      // pass 4 从第1行开始，每隔2行扫描一次

      const pass = [0, 4, 2 , 1]

      const split = [8, 8, 4, 2]

      const interlaceColorArray = new Uint8ClampedArray(colorArray.length)

      let renderLength = 0

      for (let i = 0; i < pass.length; i++) {

        for (let j = pass[i]; j < height; j += split[i]) {

          const data = colorArray.slice(renderLength, renderLength += (width * 4))

          interlaceColorArray.set(data, j * width * 4)

        }

      }

      return new ImageData(interlaceColorArray, width, height)
    }
  }

  /**
   * 解码图像数据
   * @param arraybuffer
   * @param colorTable
   * @param imageDescriptor
   * @param graphicsControlExtension
   */
  decodeImageData (arraybuffer: ArrayBuffer, colorTable: RGB[], imageDescriptor: ImageDescriptor, graphicsControlExtension?: Extension): SubImageData {
    let byteLength = 0

    // 数据视图
    const  dataView: DataView = new DataView(arraybuffer)

    // 最小代码尺度
    const minCodeSize: number = dataView.getUint8(byteLength)

    // 图像数据
    const arrayBuffers: ArrayBuffer[] = []

    // 最小代码尺度下一个字节便是图像数据字节长度
    let imageDataByteLength: number = dataView.getUint8(byteLength += 1)

    while (imageDataByteLength !== IMAGE_DATA_END_FLAG) {

      // 图像数据
      const imageDataBuffer: ArrayBuffer = arraybuffer.slice(byteLength += 1, byteLength += imageDataByteLength)

      arrayBuffers.push(imageDataBuffer)

      imageDataByteLength = dataView.getUint8(byteLength)
    }

    // real byteLength = index + 1 （1字节）
    byteLength += 1

    // 图像数据总字节数
    let imageDataBuffersLength = 0

    for (let i = 0; i < arrayBuffers.length; i++) {
      imageDataBuffersLength += arrayBuffers[i].byteLength
    }

    // 总图像数据
    const uintArray: Uint8Array = new Uint8Array(imageDataBuffersLength)

    let uintBufferLength = 0

    for (let i = 0; i < arrayBuffers.length; i++) {
      const uintBuffer = new Uint8Array(arrayBuffers[i])
      uintArray.set(uintBuffer, uintBufferLength)
      uintBufferLength += uintBuffer.byteLength
    }

    // 解码图像数据
    const imageData: ImageData = this.decodeImageDataBuffer(uintArray, minCodeSize, colorTable, imageDescriptor, graphicsControlExtension)

    return {
      byteLength,
      minCodeSize,
      arrayBuffers,
      imageData
    }
  }

  /**
   * 解析子图像组数据
   * @param subImageBuffer
   */
  decodeSubImages (subImageBuffer: ArrayBuffer): SubImage {
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
        const imageDescriptor: ImageDescriptor = this.decodeImageDescriptor(imageDescriptorBuffer)

        Object.assign(image, { imageDescriptor })

        const { localColorTableFlag, localColorTableSize } = imageDescriptor.packedField

        // 本地色彩表紧跟着图像描述符，如果存在则解析本地图像表，
        if (localColorTableFlag === 1) {

          // 本地色彩表字节长度
          const localColorTableLength: number = 3 * Math.pow(2, localColorTableSize)

          // 本地色彩表数据
          const localColorTableBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, byteLength += localColorTableLength)

          // 本地色彩表
          const localColorTableColors: RGB[] = formatColors(new Uint8Array(localColorTableBuffer))

          Object.assign(image, {
            localColorTable: {
              colors: localColorTableColors,
              byteLength: localColorTableLength,
              arrayBuffer: localColorTableBuffer
            }
          })
        }

        // 图像数据在图像描述符或本地色彩表之后，解析图像数据
        const imageDataBuffer: ArrayBuffer = subImageBuffer.slice(byteLength, subImageBuffer.byteLength)

        // 本地色彩表或者全局色彩表色彩数据
        const colorTable: RGB[] = image?.localColorTable?.colors || this.gif.globalColorTable.colors

        // 解码子图像数据
        const subImageData: SubImageData = this.decodeImageData(imageDataBuffer, colorTable, imageDescriptor, graphicsControlExtension)

        byteLength += subImageData.byteLength

        Object.assign(image, { subImageData })

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
   * 解码全局色彩表
   * @param arrayBuffer
   * @param offset
   * @param globalColorTableSize
   */
  decodeGlobalColorTable (arrayBuffer: ArrayBuffer, offset: number, globalColorTableSize: number): ColorTable {

    // 全局色彩表字节长度
    const globalColorTableLength: number = 3 * Math.pow(2, globalColorTableSize)

    // 全局色彩表数据
    const globalColorTableBuffer: ArrayBuffer = arrayBuffer.slice(offset, offset + globalColorTableLength)

    // 全局色彩表
    const globalColorTableColors: RGB[] = formatColors(new Uint8Array(globalColorTableBuffer))

    return {
      byteLength: globalColorTableLength,
      arrayBuffer: globalColorTableBuffer,
      colors: globalColorTableColors
    }
  }

  /**
   * 解码GIF
   * @param file
   */
  async decode (file: Blob | ArrayBuffer | File): Promise<Gif | void> {
    // 图像数据
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

    // 解析字节数
    let byteLength = 0

    // 文件类型 6 个字节
    const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, byteLength += HEADER_BYTE_LENGTH)

    // 解码头部信息
    this.gif.header = this.decodeHeader(headerBuffer)

    // 逻辑屏幕描述数据 7 个字节
    const logicalScreenBuffer: ArrayBuffer = arrayBuffer.slice(byteLength, byteLength += LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH)

    // 解析屏幕逻辑描述符
    this.gif.logicalScreenDescriptor = this.decodeLogicalScreenDescriptor(logicalScreenBuffer)

    const { globalColorTableFlag, globalColorTableSize } = this.gif.logicalScreenDescriptor.packedField

    // 如果存在全局色彩表则进行解析
    if (globalColorTableFlag === 1) {

      const globalColorTable: ColorTable = this.decodeGlobalColorTable(arrayBuffer, byteLength, globalColorTableSize)

      byteLength += globalColorTable.byteLength

      Object.assign(this.gif, { globalColorTable })
    }

    // 子图像组数据
    const subImageBuffer = arrayBuffer.slice(byteLength, arrayBuffer.byteLength)

    // 解码子图像数据
    const { byteLength: subImageByteLength, extensions, images }: SubImage = this.decodeSubImages(subImageBuffer)

    byteLength += subImageByteLength

    return Object.assign(this.gif, { byteLength, arrayBuffer, extensions, images })
  }

}

export default GifViewer
