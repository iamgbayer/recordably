import dayjs from 'dayjs'
import { isNil, prop, propEq } from 'ramda'
const { remote, desktopCapturer } = window.require('electron')

export const createFolderName = (): string =>
  dayjs().format('yyyy-MM-dd@HH-mm-ss')

export const pixelToInteger = (string: string): number =>
  parseInt(string.replace(/px/, ''))

type ResolveNullable = (value?: unknown) => void

export const wait = (): Promise<void> =>
  new Promise((resolve: ResolveNullable) => {
    setTimeout(() => {
      resolve()
    }, 500)
  }) as Promise<void>

type CurrentDisplayProperties = {
  id: string
  size: {
    width: number
    height: number
  }
}

export const getIdAndSizeCurrentDisplay = (): CurrentDisplayProperties => {
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

interface Constraints {
  audio: boolean
  video: {
    mandatory: {
      chromeMediaSource: string
      chromeMediaSourceId: string
      minWidth: number
      maxWidth: number
      minHeight: number
      maxHeight: number
    }
  }
}

type GetUserMedia = {
  getUserMedia(constraints: Constraints): Promise<MediaStream>
}

type Source = {
  id: string
  display_id: string
}

export const getSourceAndUserMedia = (
  execute: (stream: MediaStream) => void
): void => {
  const { id, size } = getIdAndSizeCurrentDisplay()

  try {
    desktopCapturer
      .getSources({
        types: ['screen']
      })
      .then(async (sources: Array<Source>) => {
        const source: Source | undefined = sources.find(
          propEq('display_id', String(id))
        )

        const { width, height } = size

        /**
         * @todo Do something when source isn't found.
         */
        if (isNil(source)) {
          return
        }

        const stream = await (<GetUserMedia>(
          navigator.mediaDevices
        )).getUserMedia({
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
