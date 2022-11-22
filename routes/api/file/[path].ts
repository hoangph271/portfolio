import { decode, Image } from "https://deno.land/x/imagescript@v1.2.14/mod.ts";
import { join, extname } from "https://deno.land/std@0.102.0/path/posix.ts";
import ExifReader from 'npm:exifreader'
import { HandlerContext } from "$fresh/server.ts";

const isThumbnailSupported = (filePath: string) => {
  const fileExt = extname(filePath).toUpperCase()

  return ['.JPEG', '.JPG', '.PNG'].includes(fileExt)
}
const createThumbnail = async (filePath: string) => {
  const image = await decode(await Deno.readFile(filePath), true) as Image

  const aspectRatio = image.width / image.height
  const MAX_SIZE = 300
  const maxSize = aspectRatio > 1
    ? image.width > MAX_SIZE ? MAX_SIZE : image.width
    : image.height > MAX_SIZE ? MAX_SIZE : image.height

  const [width, height] = aspectRatio > 1
    ? [maxSize, maxSize / aspectRatio]
    : [maxSize * aspectRatio, maxSize]

  image.resize(width, height)

  const { Orientation } = await ExifReader.load(filePath)
  switch (Orientation?.value ?? 1) {
    case 1:
      break
    case 6:
      image.rotate(270)
      break
    case 8:
      image.rotate(90)
      break
    default:
      console.info(`// TODO: Handle ${Orientation?.value} for ${filePath}`)
  }

  return image.encodeJPEG()
}

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  const { path } = ctx.params
  const thumbnail = new URL(req.url).searchParams.get('thumbnail')
  const FSO_ROOT = '/Users/garand/MEGA/_temp()/withSpring'
  const fullPath = join(FSO_ROOT, path)

  if (thumbnail) {
    return isThumbnailSupported(path)
      ? new Response(await createThumbnail(fullPath))
      : new Response(await Deno.readFile('static/binary.png'))
  }

  return new Response(await Deno.readFile(fullPath));
};
