

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.Do4Tx0hP.js","_app/immutable/chunks/Dus5G4-p.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DEpKyr1n.js"];
export const stylesheets = ["_app/immutable/assets/2.DagGfLuA.css"];
export const fonts = [];
