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

/**
 * @deprecated
 */
export function uint8ToBinaryString(arr: Uint8Array) {
  return String.fromCharCode(...arr)
}

/**
 * @deprecated
 */
export function binaryStringToUint8(str: string) {
  const bufView = new Uint8Array(str.length)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return bufView
}

export function uint8ToHex(view: Uint8Array) {
  let result = ''
  let value

  for (let i = 0; i < view.length; i++) {
    value = view[i].toString(16)
    result += value.length === 1 ? '0' + value : value
  }

  return result
}

export function hexToUint8(input: string) {
  if (input.length % 2 !== 0) {
    throw new Error('Expected string to be an even number of characters')
  }

  const view = new Uint8Array(input.length / 2)

  for (let i = 0; i < input.length; i += 2) {
    view[i / 2] = parseInt(input.substring(i, i + 2), 16)
  }

  return view
}
