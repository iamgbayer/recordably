import { FRAME_RATE, IMAGE_TYPE, MAX_LENGTH, VIDEO_CSS } from 'configs'
import GIFEncoder from 'gif-encoder-2'
import { ResolveNullable } from 'helpers'
import { isNil, prop } from 'ramda'
import { useRef, useState } from 'react'
import { MetaProperties } from 'screens'

const { remote } = window.require('electron')
const fs = window.require('fs')
const { dialog, app } = remote

type Dependencies = {
  meta: MetaProperties
  minimize: () => void
}

type Return = {
  start: (stream: MediaStream) => void
  finish: () => Promise<void>
}

type DialogProps = {
  filePath: string | null
}

type ContextNullable = CanvasRenderingContext2D | null

export const useFrames = ({ meta, minimize }: Dependencies): Return => {
  const [frames, setFrames] = useState<Array<string>>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeLimit, setTimeLimit] = useState(MAX_LENGTH)

  const video = useRef<HTMLVideoElement>(document.createElement('video'))
  const canvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const context = useRef<ContextNullable>(null)
  const timeout = useRef<number>(0)
  const captureInterval = useRef<number>(0)

  const start = (stream: MediaStream) => {
    context.current = canvas.current.getContext('2d')

    canvas.current.width = prop('width', meta)
    canvas.current.height = prop('height', meta)

    video.current.style.cssText = VIDEO_CSS
    video.current.srcObject = stream
    document.body.appendChild(video.current)
    video.current.onloadedmetadata = () => video.current.play()

    captureInterval.current = setInterval(
      onCaptureFrame,
      Math.round(1000 / FRAME_RATE)
    )

    timeout.current = setInterval(
      () => setTimeLimit((limit) => limit - 1000),
      1000
    )
  }

  const onCaptureFrame = () => {
    const { width, height, x, y } = meta

    /**
     * @todo
     */
    if (
      isNil(video.current) ||
      isNil(context.current) ||
      isNil(canvas.current)
    ) {
      return
    }

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

    const frame = canvas.current.toDataURL(IMAGE_TYPE) as string

    setFrames((frames) => [...frames, frame])
  }

  const finish = async () => {
    if (isNil(video.current)) {
      return
    }

    minimize()

    const { width, height } = meta

    video.current.pause()

    clearInterval(captureInterval.current)
    clearInterval(timeout.current)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const encoder = new GIFEncoder(width, height)
    encoder.start()

    const process = async (frame: string) => {
      return new Promise((resolve: ResolveNullable) => {
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

    for (const frame of frames) {
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

    dialog.showSaveDialog(options).then(({ filePath }: DialogProps) => {
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
