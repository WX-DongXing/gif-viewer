import { EXTENSION_TYPE } from './constant'

interface LogicalPackedField {
  globalColorTableFlag: number
  colorResolution: number
  sortFlag: number
  globalColorTableSize: number
}

interface LogicalScreenDescriptor {
  width: number
  height: number
  packedField: LogicalPackedField
  backgroundColorIndex: number
  pixelAspectRatio: number
}

interface RGB {
  r: number
  g: number
  b: number
}

interface ExtensionPackedField {
  // graphics control
  reserved?: number
  disposalMethod?: number
  userInputFlag?: number
  transparentColorFlag?: number
}

interface Application {
  version: string
  from?: number
  to?: number
  data?: ArrayBuffer
}

interface Extension {
  name: string
  type: EXTENSION_TYPE
  byteLength: number
  packedField?: ExtensionPackedField
  // graphics control
  delayTime?: number
  transparentColorIndex?: number
  // comment
  comment?: string
  // application
  application?: Application
}

interface ImageData {
  byteLength: number
  minCodeSize: number
  imageDataBuffers: ArrayBuffer[]
}

interface Image {
  graphicsControlExtension?: Extension
  imageDescriptor?: ImageDescriptor
  localColorTable?: RGB[]
  imageData?: ImageData
}

interface SubImage {
  byteLength: number
  extensions?: Extension[]
  images?: Image[]
}

class Gif {
  version: string
  byteLength: number
  arrayBuffer: ArrayBuffer
  logicalScreenDescriptor: LogicalScreenDescriptor
  globalColorTable: RGB[]
  subImages: SubImage[]
}

interface ImagePackedField {
  localColorTableFlag: number
  interlaceFlag: number
  sortFlag: number
  reserved: number
  localColorTableSize: number
}

interface ImageDescriptor {
  left: number
  top: number
  width: number
  height: number
  packedField: ImagePackedField
}

export {
  Gif,
  LogicalScreenDescriptor,
  RGB,
  Extension,
  SubImage,
  Image,
  Application,
  ImageDescriptor,
  ImageData
}
