import dayjs from 'dayjs'
import { prop, propEq } from 'ramda'
const { remote, desktopCapturer } = window.require('electron')

export const createFolderName = () => dayjs().format('yyyy-MM-dd@HH-mm-ss')

export const pixelToInteger = (string) => parseInt(string.replace(/px/, ''))

export const wait = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

export const getIdAndSizeCurrentDisplay = () => {
  const { screen } = remote

  const cursor = screen.getCursorScreenPoint()
  const { id, size } = screen.getDisplayNearestPoint({
    x: cursor.x,
    y: cursor.y
  })

  return {
    id,
    size
  }
}

export const getSourceAndUserMedia = (execute) => {
  const { id, size } = getIdAndSizeCurrentDisplay()

  try {
    desktopCapturer
      .getSources({
        types: ['screen']
      })
      .then(async (sources) => {
        const source = sources.find(propEq('display_id', String(id)))

        const { width, height } = size

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: prop('id', source),
              minWidth: width,
              maxWidth: width,
              minHeight: height,
              maxHeight: height
            }
          }
        })

        execute(stream)
      })
  } catch (err) {
    console.error(err)
  }
}
