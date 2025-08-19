import z from 'zod'

export const uInt8Array = () => z.instanceof(Uint8Array)
