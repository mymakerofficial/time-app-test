import msgpack from '@ygoe/msgpack'

export function createEncodedStream<T>({
  handler,
}: {
  handler: (
    controller: ReadableStreamDefaultController<T>,
  ) => void | Promise<void>
}) {
  return new ReadableStream<T>({
    start: handler,
  }).pipeThrough(
    new TransformStream<T, Uint8Array>({
      transform: (chunk, controller) => {
        controller.enqueue(msgpack.encode(chunk))
      },
    }),
  )
}
