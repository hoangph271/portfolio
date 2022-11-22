import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

type FsoFile = {
  filename: string
  path: string
  isFile: boolean
}

export default function Home({ data: files  }: PageProps<FsoFile[]>) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="flex flex-wrap">
        {files.map(file => (
          <div
            key={file.path}
            className="h-60 w-60 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(/api/file/${file.path}?thumbnail=1)`
            }}
          >
            {file.filename}
          </div>
        ))}
      </div>
    </>
  );
}

export const handler: Handlers<FsoFile[]> = {
  async GET(_, ctx) {
    const FSO_ROOT = '/Users/garand/MEGA/_temp()/withSpring'

    const files: FsoFile[] = []

    for await (const file of await Deno.readDir(FSO_ROOT)) {
      if (file.name.toUpperCase().endsWith('.ORF')) continue

      files.push({
        filename: file.name,
        path: file.name,
        isFile: file.isFile
      })
    }

    return ctx.render(files)
  },
}
