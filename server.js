import { watch } from "fs";

let server = null;
let client = null;
let starting = false;

async function restartServer() {
    starting = true;

    if (server) {
        server.stop();
        if (client) client.close();
        server = null;
        client = null;
    }

    await Bun.build({
        entrypoints: ['./src/script.js'],
        outdir: './build',
    });

    server = Bun.serve({
        port: 3000,
        async fetch(req, server) {
            const url = new URL(req.url);

            if (url.pathname === "/hotpocket") {
                return server.upgrade(req);
            }
            
            if (url.pathname === "/") {
                const filePath = "./build/index.html";
                const file = Bun.file(filePath);
                return new Response(file);
            }

            const filePath = `./build${url.pathname}`;
            const file = Bun.file(filePath);
            return new Response(file);
        },
        websocket: {
            async open(ws) {
                client = ws;
            },
        },
    });
    
    console.log(`Listening on localhost:${server.port}`);
    starting = false;
}

await restartServer();

watch(
    './src',
    { recursive: true },
    async (event, filename) => {
        if (!starting) await restartServer();
    },
);