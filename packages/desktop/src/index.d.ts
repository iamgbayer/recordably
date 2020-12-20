declare module 'gif-encoder-2'

declare let ClipboardItem: {
  prototype: ClipboardItem
  new (objects: Record<string, Blob>): ClipboardItem
}

interface Clipboard {
  write(items: Array<ClipboardItem>): Promise<void>
}

interface GlobalEventHandlers {
  videoWidth: number
  videoHeight: number
}
