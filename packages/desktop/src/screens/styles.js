import { equals } from 'ramda'
import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
`

export const Overlay = styled.div.attrs(({ width, height, top, left }) => ({
  style: {
    width: equals(width, 'full') ? '100%' : width + 'px',
    height: equals(height, 'full') ? '100%' : height + 'px',
    top: top + 'px',
    left: left + 'px'
  }
}))`
  position: absolute;
  z-index: 1;
  background: rgba(0, 0, 0, 0.4);
`

export const Meta = styled.div`
  position: absolute;
  top: -20px;
  left: 0;
`

export const Controls = styled.div`
  width: max-content;
  height: max-content;
  position: absolute;
  right: 0;
  bottom: -20px;
`

export const Control = styled.button``

export const style = (hasInitiatedResize) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 50,
  border: `dashed 1px ${hasInitiatedResize ? 'white' : 'transparent'}`
})
