import z from 'zod'

export const MimeType = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  SVG: 'image/svg+xml',
  JSON: 'application/json',
  PDF: 'application/pdf',
  PLAIN: 'text/plain',
  MP4: 'video/mp4',
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  BMP: 'image/bmp',
  TIFF: 'image/tiff',
  XML: 'application/xml',
  ZIP: 'application/zip',
  GZIP: 'application/gzip',
} as const
export type MimeType = (typeof MimeType)[keyof typeof MimeType]

export const MimeTypeSchema = z.enum(MimeType).or(z.string())
