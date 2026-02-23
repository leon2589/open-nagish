const STORAGE_KEY = 'opennagish_prefs';

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded or private mode */ }
}

export function get(key, defaultValue) {
  const prefs = load();
  return prefs[key] !== undefined ? prefs[key] : defaultValue;
}

export function set(key, value) {
  load();
  cache[key] = value;
  save();
}

export function remove(key) {
  load();
  delete cache[key];
  save();
}

export function clearAll() {
  cache = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function getAll() {
  return { ...load() };
}
