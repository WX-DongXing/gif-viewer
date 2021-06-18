import {EXTENSION_TYPE, GIF_VERSION, TRAILER_FLAG} from './constant'

interface Buffer {
  byteLength: number
  arrayBuffer: ArrayBuffer
}

interface Header extends Buffer {
  version: string
}

interface LogicalPackedField {
  globalColorTableFlag: number
  colorResolution: number
  sortFlag: number
  globalColorTableSize: number
}

interface LogicalScreenDescriptor extends Buffer {
  width: number
  height: number
  packedField: LogicalPackedField
  backgroundColorIndex: number
  pixelAspectRatio: number
}

type RGB = string

interface ColorTable extends Buffer {
  colors: RGB[]
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
  data?: ArrayBuffer[]
  identifier?: string
  authentication?: string
}

interface Extension extends Buffer {
  name: string
  type: EXTENSION_TYPE
  packedField?: ExtensionPackedField
  // graphics control
  delayTime?: number
  transparentColorIndex?: number
  // comment
  comment?: string
  // application
  application?: Application
}

interface SubImageData {
  byteLength: number
  minCodeSize: number
  arrayBuffers: ArrayBuffer[]
  imageData: ImageData
}

interface Image {
  graphicsControlExtension?: Extension
  imageDescriptor?: ImageDescriptor
  localColorTable?: ColorTable
  subImageData?: SubImageData
}

interface SubImage {
  byteLength: number
  extensions?: Extension[]
  images?: Image[]
}

interface ImagePackedField {
  localColorTableFlag: number
  interlaceFlag: number
  sortFlag: number
  reserved: number
  localColorTableSize: number
}

interface ImageDescriptor extends Buffer {
  left: number
  top: number
  width: number
  height: number
  packedField: ImagePackedField
}

interface BufferConcat {
  uintArray: Uint8Array
  byteLength: number
}

class Gif implements Buffer {
  byteLength: number
  arrayBuffer: ArrayBuffer
  header: Header | void
  logicalScreenDescriptor: LogicalScreenDescriptor
  globalColorTable: ColorTable
  extensions?: Extension[]
  images: Image[]
  trailer: ArrayBuffer = Uint8Array.from([TRAILER_FLAG]).buffer
}

interface GifHandler {
  decode (file: Blob | ArrayBuffer | File): Promise<Gif | void>
}

export {
  Gif,
  Header,
  GifHandler,
  LogicalScreenDescriptor,
  RGB,
  ColorTable,
  Extension,
  SubImage,
  Image,
  Application,
  ImageDescriptor,
  SubImageData,
  BufferConcat
}
