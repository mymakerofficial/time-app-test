import z from 'zod'
import { uint8ToHex } from '@/helper/binary.ts'

export const uInt8Array = () => z.instanceof(Uint8Array)

export const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO date string
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // ISO string → Date
    encode: (date) => date.toISOString(), // Date → ISO string
  },
)

export function hexExamples() {
  return Array.from({ length: 4 }, () =>
    uint8ToHex(crypto.getRandomValues(new Uint8Array(32))),
  )
}
