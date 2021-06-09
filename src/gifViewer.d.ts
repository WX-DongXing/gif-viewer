import { LogicalScreenDescriptor, RGB, SubImage } from './types'

export as namespace gifViewer

export class Gif {
  version: string
  byteLength: number
  headerBuffer: ArrayBuffer
  arrayBuffer: ArrayBuffer
  logicalScreenDescriptor: LogicalScreenDescriptor
  globalColorTable: RGB[]
  globalColorTableBuffer: ArrayBuffer
  subImages: SubImage[]
  trailer: ArrayBuffer
}

export function decoder(file: Blob | ArrayBuffer | File): Promise<Gif | void>
