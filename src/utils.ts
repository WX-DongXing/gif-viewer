import { GIF_VERSION } from './constant'

function isGif (version: string): boolean {
  return Object.keys(GIF_VERSION).includes(version)
}

export {
  isGif
}
