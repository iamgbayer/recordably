import React, { memo } from 'react'
import styled, { css } from 'styled-components'
import { ifProp } from 'styled-tools'
import * as Icons from './Icons'
import { Tokens } from '../Tokens'

type Props = {
  name: 'close' | 'camera' | 'gif'
  color?: number
  width?: number
  height?: number
  onClick?: () => void
  marginLeft?: number | string
  marginRight?: number | string
  marginTop?: number | string
  marginBottom?: number | string
}

const capitalize = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1)

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 0;

  ${ifProp(
    'onClick',
    css`
      cursor: pointer;
    `
  )};
`

export const Icon = memo(
  ({ name, color = 100, width = 20, height = 20, ...props }: Props) => {
    const Iconable: React.FC<{
      width: number
      height: number
      color: string
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }> = Icons[capitalize(name)]

    return (
      <Container {...props}>
        <Iconable width={width} height={height} color={Tokens.colors[color]} />
      </Container>
    )
  }
)
