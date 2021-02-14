import React from 'react'
import Props from './Props'

export const Gif = ({ width, height, color }: Props): React.ReactNode => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
  >
    <g>
      <rect fill="none" height={height} width={width} x="0" />
    </g>
    <g>
      <rect fill={color} height="6" width="1.5" x="11.5" y="9" />
      <path
        fill={color}
        d="M9,9H6c-0.6,0-1,0.5-1,1v4c0,0.5,0.4,1,1,1h3c0.6,0,1-0.5,1-1v-2H8.5v1.5h-2v-3H10V10C10,9.5,9.6,9,9,9z"
      />
      <polygon
        fill={color}
        points="19,10.5 19,9 14.5,9 14.5,15 16,15 16,13 18,13 18,11.5 16,11.5 16,10.5"
      />
    </g>
  </svg>
)
