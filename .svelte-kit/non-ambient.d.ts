
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/openAI" | "/api/openAI/buy" | "/api/openAI/sell" | "/api/rapidApi" | "/buying" | "/selling";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/openAI": Record<string, never>;
			"/api/openAI/buy": Record<string, never>;
			"/api/openAI/sell": Record<string, never>;
			"/api/rapidApi": Record<string, never>;
			"/buying": Record<string, never>;
			"/selling": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/openAI" | "/api/openAI/" | "/api/openAI/buy" | "/api/openAI/buy/" | "/api/openAI/sell" | "/api/openAI/sell/" | "/api/rapidApi" | "/api/rapidApi/" | "/buying" | "/buying/" | "/selling" | "/selling/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/svelte.svg" | "/vite.svg" | string & {};
	}
}