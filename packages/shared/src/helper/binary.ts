export function uInt8Array2ab(arr: Uint8Array) {
  const buf = new ArrayBuffer(arr.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, arrLen = arr.length; i < arrLen; i++) {
    bufView[i] = arr[i]
  }
  return buf
}

export function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode(...new Uint8Array(buf))
}

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export function uInt8Array2str(arr: Uint8Array) {
  return String.fromCharCode(...arr)
}

export function str2Uint8Array(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return bufView
}
