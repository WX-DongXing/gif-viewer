import { GIF_VERSION } from './constant'

interface LogicalScreenDescriptor {
  width: number
  height: number
}

interface Gif {
  readonly version: GIF_VERSION
  readonly logicalScreenDescriptor: LogicalScreenDescriptor
}

export {
  Gif,
  LogicalScreenDescriptor
}
