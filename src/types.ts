import {EXTENSION_TYPE, GIF_VERSION} from './constant'

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
  from: number
  to: number
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

interface SubImage {
  extensions?: Extension[]
  imageDescriptor?: any
  localColorTable?: RGB[]
  imageData?: any
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

interface ImageData {
  minCodeSize: number
  imageDataBuffers: ArrayBuffer[]
}

export {
  Gif,
  LogicalScreenDescriptor,
  RGB,
  Extension,
  SubImage,
  ImageDescriptor,
  ImageData
}
