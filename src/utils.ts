import { GIF_VERSION } from './constant'

function isGif (fileType: string): boolean {
  return Object.keys(GIF_VERSION).includes(fileType)
}

export {
  isGif
}
