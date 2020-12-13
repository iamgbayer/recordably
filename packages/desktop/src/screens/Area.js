import { STATUS } from 'configs'
import {
  getIdAndSizeCurrentDisplay,
  getSourceAndUserMedia,
  pixelToInteger
} from 'helpers'
import { useFrames, useTakeScreenshot } from 'hooks'
import { equals, includes, isNil, merge, path, prop } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { Container, Control, Controls, Meta, Overlay, style } from './styles'

const { ipcRenderer, remote } = window.require('electron')
const { setIgnoreMouseEvents } = remote.getCurrentWindow()

export const Area = () => {
  const [hasInitiatedResize, setHasInitiatedResize] = useState(false)
  const [meta, setMeta] = useState({
    width: 10,
    height: 10
  })

  const rnd = useRef()
  const canUpdatePosition = useRef(true)

  const minimize = () => {
    rnd.current.updateSize({
      width: 10,
      height: 10
    })

    canUpdatePosition.current = true
    setHasInitiatedResize(false)

    ipcRenderer.send('minimize')
  }

  const takeScreenshot = useTakeScreenshot({ meta, minimize })
  const { finish, start } = useFrames({
    meta,
    minimize
  })

  const [status, setStatus] = useState(STATUS.initial)

  useEffect(() => {
    window.addEventListener('mousemove', (event) => {
      canUpdatePosition.current &&
        rnd.current.updatePosition({
          x: event.clientX - 15,
          y: event.clientY - 15
        })
    })
  }, [])

  /**
   * @todo Move to App.js
   */
  useEffect(() => {
    const whenEscPressedHideApplication = (event) => {
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

  const onCantUpdatePosition = (event, direction, ref) => {
    canUpdatePosition.current = false

    if (isNil(ref)) {
      return
    }

    setMeta((meta) =>
      merge(meta, {
        width: pixelToInteger(path(['style', 'width'], ref)),
        height: pixelToInteger(path(['style', 'height'], ref))
      })
    )
  }

  /**
   * @todo Move to App.js
   */
  const listenMouseEvents = () =>
    includes(status, [STATUS.recording, STATUS.initial]) &&
    setIgnoreMouseEvents(false)

  /**
   * @todo Move to App.js
   */
  const removeListenMouseEvents = () =>
    includes(status, [STATUS.recording]) &&
    setIgnoreMouseEvents(true, { forward: true })

  const { size } = getIdAndSizeCurrentDisplay()

  return (
    <Container>
      <Rnd
        ref={rnd}
        onResize={(event, direction, ref, delta, position) =>
          setMeta({
            width: pixelToInteger(path(['style', 'width'], ref)),
            height: pixelToInteger(path(['style', 'height'], ref)),
            x: position.x,
            y: position.y
          })
        }
        onResizeStart={() => {
          setHasInitiatedResize(true)
          onCantUpdatePosition()
        }}
        onDragStop={(event, direction) =>
          setMeta((meta) =>
            merge(meta, {
              x: direction.x,
              y: direction.y
            })
          )
        }
        onResizeStop={onCantUpdatePosition}
        bounds="parent"
        style={style(hasInitiatedResize)}
        default={{
          width: 10,
          height: 10
        }}
      >
        {hasInitiatedResize && (
          <Meta>
            {prop('width', meta)} x {prop('height', meta)}
          </Meta>
        )}

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
      </Rnd>

      <Overlay top={0} left={0} width="full" height={prop('y', meta)} />
      <Overlay
        top={prop('y', meta)}
        left={0}
        width={prop('x', meta)}
        height={prop('height', meta)}
      />
      <Overlay
        top={prop('height', meta) + prop('y', meta)}
        left={0}
        width="full"
        height={
          prop('height', size) - 40 - prop('height', meta) - prop('y', meta)
        }
      />
      <Overlay
        top={prop('y', meta)}
        left={prop('width', meta) + prop('x', meta)}
        width={prop('width', size) - prop('width', meta) - prop('x', meta)}
        height={prop('height', meta)}
      />
    </Container>
  )
}
