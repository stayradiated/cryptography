import { Stream } from 'stream'

const readStream = async (stream: Stream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunkList = new Array<Buffer>()
    stream.on('data', (chunk: Buffer) => chunkList.push(chunk))
    stream.on('end', () => {
      resolve(Buffer.concat(chunkList))
    })
    stream.on('error', (error: Error) => {
      reject(new Error(`Error converting stream: ${error.message}`))
    })
  })
}

export default readStream
