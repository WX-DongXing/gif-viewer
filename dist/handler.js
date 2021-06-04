(async function () {

  const { decoder } = window.gifDecoder || {}

  const GIF_SOURCE = 'data:image/gif;base64,R0lGODlhCgAKAJEAAP////8AAAAA/wAAACH5BAAAAAAALAAAAAAKAAoAAAIWjC2Zhyoc3DOgAnXslfqo3mCMBJFMAQA7'

  const blob = await (await fetch(GIF_SOURCE)).blob()

  const gif = await decoder(blob)

  console.log('gif: ', gif)
})()
