import { GIF_VERSION } from './constant'

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

export {
  Gif,
  LogicalScreenDescriptor,
  RGB
}
