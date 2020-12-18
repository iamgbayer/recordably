import { IMAGE_TYPE, VIDEO_CSS } from 'configs'
import jimp from 'jimp'
import { isNil } from 'ramda'
import { useRef } from 'react'
import { MetaProperties } from 'screens'

type Dependencies = {
  meta: MetaProperties
  minimize: () => void
}

type Return = (stream: MediaStream) => void

export const useTakeScreenshot = ({ meta, minimize }: Dependencies): Return => {
  const video = useRef<HTMLVideoElement>(document.createElement('video'))

  const execute = (stream: MediaStream) => {
    const { width, height, x, y } = meta

    video.current = document.createElement('video')
    video.current.style.cssText = VIDEO_CSS

    if (isNil(video.current)) {
      return
    }

    video.current.onloadedmetadata = function () {
      video.current.style.height = `${height}px`
      video.current.style.width = `${width}px`

      video.current.play()

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d') as CanvasRenderingContext2D
      context.drawImage(video.current, 0, 0, canvas.width, canvas.height)

      const base64 = canvas.toDataURL(IMAGE_TYPE)

      video.current.remove()

      const encodedImageBuffer = new Buffer(
        base64.replace(/^data:image\/(png|gif|jpeg);base64,/, ''),
        'base64'
      )

      /**
       * @todo We could remove jimp and just do it with canvas.
       */
      jimp.read(encodedImageBuffer, (error, image) => {
        if (error) {
          throw error
        }

        image
          .crop(x, y, width, height)
          .getBase64(IMAGE_TYPE, (error, base64data) => {
            fetch(base64data)
              .then((response) => response.blob())
              .then(async (blob) => {
                const item = new window.ClipboardItem({
                  [IMAGE_TYPE]: blob
                })

                await navigator.clipboard.write([item])

                minimize()
              })
          })
      })

      try {
        stream.getTracks()[0].stop()
      } catch (error) {
        console.log(error)
      }
    }

    video.current.srcObject = stream
  }

  return execute
}
