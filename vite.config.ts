import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";
import { promises } from "fs";
import { defineConfig } from "vitest/config";

// used to load fonts server side for thumbnail generation
function loadTTFAsArrayBuffer() {
	return {
		name: "load-ttf-as-array-buffer",
		async transform(_src, id) {
			if (id.endsWith(".ttf")) {
				return `export default new Uint8Array([
			${new Uint8Array(await promises.readFile(id))}
		  ]).buffer`;
			}
		},
	};
}

/* This is necessary for TranscribeJS to load shout.wasm.worker.mjs */
const viteServerConfig = () => ({
	name: "add-headers",
	configureServer: (server) => {
		server.middlewares.use((req, res, next) => {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET");
			res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
			res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
			next();
		});
	},
});

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: "svelte",
		}),
		loadTTFAsArrayBuffer(),
		viteServerConfig(),
	],
	optimizeDeps: {
		include: [
			"browser-image-resizer",
			"uuid",
			"@huggingface/transformers",
			"sharp",
			"@gradio/client",
			"@transcribe/transcriber",
		],
	},
	server: {
		open: "/",
	},
	test: {
		setupFiles: ["./scripts/setupTest.ts"],
		deps: { inline: ["@sveltejs/kit"] },
		globals: true,
	},
});
