import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["svelte.svg","vite.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BPV0BlQm.js",app:"_app/immutable/entry/app.D7Xu_L9j.js",imports:["_app/immutable/entry/start.BPV0BlQm.js","_app/immutable/chunks/Nf4Cgrso.js","_app/immutable/chunks/Dus5G4-p.js","_app/immutable/entry/app.D7Xu_L9j.js","_app/immutable/chunks/Dus5G4-p.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js')),
			__memo(() => import('../server/nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/openAI/buy",
				pattern: /^\/api\/openAI\/buy\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/openAI/buy/_server.ts.js'))
			},
			{
				id: "/api/openAI/sell",
				pattern: /^\/api\/openAI\/sell\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/openAI/sell/_server.ts.js'))
			},
			{
				id: "/api/rapidApi",
				pattern: /^\/api\/rapidApi\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/rapidApi/_server.ts.js'))
			},
			{
				id: "/buying",
				pattern: /^\/buying\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
