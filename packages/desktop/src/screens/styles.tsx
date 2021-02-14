import { Tokens } from 'components'
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
  color: ${Tokens.colors[100]};
  left: 0;
`

export const Controls = styled.div`
  width: 90px;
  height: max-content;
  position: absolute;
  right: 0;
  bottom: -40px;
  border-radius: 5px;
  padding: 0 6px;
  background: ${Tokens.colors[200]};
  display: flex;
  justify-content: space-between;
`

export const Select = styled.div`
  white-space: nowrap;
  color: ${Tokens.colors[100]};
  margin-bottom: 20px;
`

export const Control = styled.button`
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
`

export const style = (
  hasInitiatedResize: boolean
): Record<string, string | number> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 50,
  outline: `1px dashed ${
    hasInitiatedResize ? Tokens.colors[100] : 'transparent'
  }`,
  boxShadow: `0 0 0 1px ${
    hasInitiatedResize ? Tokens.colors[200] : 'transparent'
  }`
})
