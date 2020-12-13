import jimp from 'jimp'
import { useRef } from 'react'
import { IMAGE_TYPE, VIDEO_CSS } from '../constants'

export const useTakeScreenshot = ({ meta, minimize }) => {
  const video = useRef(null)

  const execute = (stream) => {
    video.current = document.createElement('video')
    video.current.style.cssText = VIDEO_CSS

    video.current.onloadedmetadata = function () {
      video.current.style.height = this.videoHeight + 'px'
      video.current.style.width = this.videoWidth + 'px'

      video.current.play()

      const canvas = document.createElement('canvas')
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight

      const context = canvas.getContext('2d')
      context.drawImage(video.current, 0, 0, canvas.width, canvas.height)

      const base64 = canvas.toDataURL(IMAGE_TYPE)

      video.current.remove()

      const encondedImageBuffer = new Buffer(
        base64.replace(/^data:image\/(png|gif|jpeg);base64,/, ''),
        'base64'
      )

      /**
       * @todo We could remove jimp and just do it with canvas.
       */
      jimp.read(encondedImageBuffer, (error, image) => {
        if (error) {
          throw error
        }

        const { width, height, x, y } = meta

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
