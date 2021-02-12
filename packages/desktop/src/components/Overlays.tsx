import { getIdAndSizeCurrentDisplay } from 'helpers'
import { equals, prop } from 'ramda'
import React from 'react'
import { MetaProperties } from 'screens'
import styled from 'styled-components'
import { Tokens } from './Tokens'

type OverlayProps = {
  width: number | string
  height: number | string
  top: number
  left: number
}

const Overlay = styled.div.attrs<OverlayProps>(
  ({ width, height, top, left }: OverlayProps) => ({
    style: {
      width: equals(width, 'full') ? '100%' : width + 'px',
      height: equals(height, 'full') ? '100%' : height + 'px',
      top: top + 'px',
      left: left + 'px'
    }
  })
)<OverlayProps>`
  position: absolute;
  z-index: 1;
  background: ${Tokens.colors[300]};
`

type Props = {
  meta: MetaProperties
}

export const Overlays = ({ meta }: Props): React.ReactElement => {
  const { size } = getIdAndSizeCurrentDisplay()

  return (
    <>
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
    </>
  )
}
