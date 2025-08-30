

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/buying/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.DxEj8w3B.js","_app/immutable/chunks/Dus5G4-p.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = ["_app/immutable/assets/3.Z9oWwcTK.css"];
export const fonts = [];
