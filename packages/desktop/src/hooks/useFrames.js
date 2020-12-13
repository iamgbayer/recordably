import { FRAME_RATE, IMAGE_TYPE, MAX_LENGTH, VIDEO_CSS } from 'configs'
import GIFEncoder from 'gif-encoder-2'
import { isNil, prop } from 'ramda'
import { useRef, useState } from 'react'

const { remote } = window.require('electron')
const fs = window.require('fs')
const { dialog, app } = remote

export const useFrames = ({ meta, minimize }) => {
  const [frames, setFrames] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [timeLimit, setTimeLimit] = useState(MAX_LENGTH)

  const video = useRef(null)
  const captureInterval = useRef(null)
  const context = useRef(null)
  const canvas = useRef(null)
  const timeout = useRef(null)

  const start = (stream) => {
    canvas.current = document.createElement('canvas')

    context.current = canvas.current.getContext('2d')
    canvas.current.width = prop('width', meta)
    canvas.current.height = prop('height', meta)

    video.current = document.createElement('video')
    video.current.style.cssText = VIDEO_CSS
    video.current.srcObject = stream
    document.body.appendChild(video.current)
    video.current.onloadedmetadata = () => video.current.play()

    captureInterval.current = setInterval(
      onCaptureFrame,
      Math.round(1000 / FRAME_RATE)
    )

    timeout.current = setInterval(() => {
      setTimeLimit((cur) => cur - 1000)
    }, 1000)
  }

  const onCaptureFrame = () => {
    const { width, height, x, y } = meta

    context.current.drawImage(
      video.current,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    )

    let frame = canvas.current.toDataURL(IMAGE_TYPE)

    setFrames((frames) => [...frames, frame])
  }

  const finish = async () => {
    const { width, height } = meta
    minimize()

    video.current.pause()
    clearInterval(captureInterval.current)
    clearInterval(timeout.current)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')

    const encoder = new GIFEncoder(width, height)
    encoder.start()

    const process = async (frame) => {
      return new Promise((resolve) => {
        const image = new Image()

        image.onload = () => {
          ctx.drawImage(image, 0, 0)
          encoder.setDelay(100)
          encoder.addFrame(ctx)
          resolve()
        }

        image.src = frame
      })
    }

    for (let frame of frames) {
      await process(frame)
    }

    encoder.finish()

    const buffer = encoder.out.getData()

    const options = {
      title: 'Save GIF',
      defaultPath: app.getAppPath(),
      buttonLabel: 'Save',
      filters: [{ name: 'gif', extensions: ['gif'] }]
    }

    setFrames([])

    dialog.showSaveDialog(options).then(({ filePath }) => {
      if (isNil(filePath)) {
        return
      }

      fs.writeFileSync(filePath, buffer, console.log)
    })
  }

  return {
    start,
    finish
  }
}
