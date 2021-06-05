import {EXTENSION_TYPE, GIF_VERSION} from './constant'

interface LogicalPackedField {
  globalColorTableFlag: boolean
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

interface Gif {
  readonly version: GIF_VERSION
  readonly logicalScreenDescriptor: LogicalScreenDescriptor
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

interface Extension {
  name: string
  type: EXTENSION_TYPE
  byteLength: number
  packedField: ExtensionPackedField
  // graphics control
  delayTime?: number
  transparentColorIndex?: number
}

export {
  Gif,
  LogicalScreenDescriptor,
  RGB,
  Extension
}
