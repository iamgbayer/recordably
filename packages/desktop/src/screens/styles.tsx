import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
`

export const Size = styled.div`
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

export const style = (
  hasInitiatedResize: boolean
): Record<string, unknown> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 50,
  border: `dashed 1px ${hasInitiatedResize ? '#fff' : 'transparent'}`
})
