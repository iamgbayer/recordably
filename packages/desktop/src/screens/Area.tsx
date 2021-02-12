import { Overlays } from 'components/Overlays'
import { STATUS } from 'configs'
import { getSourceAndUserMedia, pixelToInteger } from 'helpers'
import { useFrames, useTakeScreenshot } from 'hooks'
import { equals, includes, isNil, merge, not, path, prop } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { Rnd, RndResizeCallback } from 'react-rnd'
import { Container, Control, Controls, Size, style, Select } from './styles'

const { ipcRenderer, remote } = window.require('electron')
const { setIgnoreMouseEvents } = remote.getCurrentWindow()

export type MetaProperties = {
  width: number
  height: number
  x: number
  y: number
}

export const Area = (): React.ReactElement => {
  const [hasInitiatedResize, setHasInitiatedResize] = useState(false)
  const [meta, setMeta] = useState<MetaProperties>({
    width: 10,
    height: 10,
    x: 0,
    y: 0
  })

  const rnd = useRef<Rnd>(null)
  const canUpdatePosition = useRef(true)

  const minimize = () => {
    if (isNil(rnd.current)) {
      return
    }

    canUpdatePosition.current = true
    setHasInitiatedResize(false)

    setMeta({
      width: 10,
      height: 10,
      x: 0,
      y: 0
    })

    rnd.current.updateSize({
      width: 10,
      height: 10
    })

    setTimeout(() => ipcRenderer.send('minimize'), 0)
  }

  const takeScreenshot = useTakeScreenshot({ meta, minimize })
  const { finish, start } = useFrames({
    meta,
    minimize
  })

  const [status, setStatus] = useState(STATUS.initial)

  useEffect(() => {
    window.addEventListener(
      'mousemove',
      (event) =>
        canUpdatePosition.current &&
        rnd.current?.updatePosition({
          x: event.clientX - 15,
          y: event.clientY - 15
        })
    )
  }, [])

  /**
   * @todo Move to App.js
   */
  useEffect(() => {
    const whenEscPressedHideApplication = (event: KeyboardEvent) => {
      equals(event.key, 'Escape') && minimize()
    }

    document.addEventListener('keydown', whenEscPressedHideApplication)

    return () =>
      document.removeEventListener('keydown', whenEscPressedHideApplication)
  }, [])

  const onTakeScreenshot = () => getSourceAndUserMedia(takeScreenshot)

  const onStartRecordFrames = () => {
    setStatus(STATUS.recording)

    getSourceAndUserMedia(start)
    setIgnoreMouseEvents(true, { forward: true })
  }

  const onFinishRecordFrames = () => {
    setStatus(STATUS.initial)

    finish()
  }

  const onCantUpdatePosition: RndResizeCallback = (_event, _direction, ref) => {
    canUpdatePosition.current = false

    if (isNil(ref)) {
      return
    }

    setMeta((meta) =>
      merge(meta, {
        width: pixelToInteger(path(['style', 'width'], ref) as string),
        height: pixelToInteger(path(['style', 'height'], ref) as string)
      })
    )
  }

  /**
   * @todo Move to App.js
   */
  const listenMouseEvents = (): void =>
    includes(status, [STATUS.recording, STATUS.initial]) &&
    setIgnoreMouseEvents(false)

  /**
   * @todo Move to App.js
   */
  const removeListenMouseEvents = (): void =>
    includes(status, [STATUS.recording]) &&
    setIgnoreMouseEvents(true, { forward: true })

  return (
    <Container>
      <Rnd
        ref={rnd}
        onDrag={(_event, direction) =>
          setMeta((meta) =>
            merge(meta, {
              x: direction.x,
              y: direction.y
            })
          )
        }
        onResize={(_event, _direction, ref, _delta, position) =>
          setMeta({
            width: pixelToInteger(path(['style', 'width'], ref) as string),
            height: pixelToInteger(path(['style', 'height'], ref) as string),
            x: position.x,
            y: position.y
          })
        }
        onResizeStart={() => {
          setHasInitiatedResize(true)

          canUpdatePosition.current = false
        }}
        onResizeStop={onCantUpdatePosition}
        bounds="parent"
        style={style(hasInitiatedResize) as React.CSSProperties}
        default={{
          width: 10,
          height: 10,
          x: 0,
          y: 0
        }}
      >
        {not(hasInitiatedResize) && <Select>Select an area</Select>}

        {hasInitiatedResize && (
          <>
            <Size>
              {prop('width', meta)} x {prop('height', meta)}
            </Size>

            <Controls
              onMouseEnter={listenMouseEvents}
              onMouseLeave={removeListenMouseEvents}
            >
              <Control onClick={minimize}>close</Control>
              <Control onClick={onTakeScreenshot}>screenshot</Control>
              <Control
                onClick={
                  equals(STATUS.recording, status)
                    ? onFinishRecordFrames
                    : onStartRecordFrames
                }
              >
                {equals(STATUS.recording, status) ? 'finish' : 'record'}
              </Control>
            </Controls>
          </>
        )}
      </Rnd>

      <Overlays meta={meta} />
    </Container>
  )
}
