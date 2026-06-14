// Data persistence via localStorage

const KEYS = {
  CLIENTS: 'ng_clients',
  MEALS: 'ng_meals',
  SETTINGS: 'ng_settings',
  OBSIDIAN_PATH: 'ng_obsidian_path',
  LINKS: 'ng_links',
};

let _state = {
  clients: [],
  meals: [],
  links: [],
  settings: { defaultPAL: 'moderate' },
};

export function initStore() {
  _state.clients = loadJSON(KEYS.CLIENTS, []);
  _state.meals = loadJSON(KEYS.MEALS, []);
  _state.links = loadJSON(KEYS.LINKS, []);
  _state.settings = loadJSON(KEYS.SETTINGS, { defaultPAL: 'moderate' });
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Clients
export function getClients() { return [..._state.clients]; }

export function getClient(id) { return _state.clients.find(c => c.id === id) || null; }

export function saveClient(client) {
  const idx = _state.clients.findIndex(c => c.id === client.id);
  if (idx >= 0) _state.clients[idx] = client;
  else _state.clients.unshift(client);
  save(KEYS.CLIENTS, _state.clients);
  return client;
}

export function deleteClient(id) {
  _state.clients = _state.clients.filter(c => c.id !== id);
  _state.meals = _state.meals.filter(m => m.clientId !== id);
  save(KEYS.CLIENTS, _state.clients);
  save(KEYS.MEALS, _state.meals);
}

// Meals
export function getMeals(clientId) {
  return _state.meals.filter(m => m.clientId === clientId).sort((a,b) => b.date.localeCompare(a.date));
}

export function saveMeal(meal) {
  const idx = _state.meals.findIndex(m => m.id === meal.id);
  if (idx >= 0) _state.meals[idx] = meal;
  else _state.meals.unshift(meal);
  save(KEYS.MEALS, _state.meals);
  return meal;
}

export function deleteMeal(id) {
  _state.meals = _state.meals.filter(m => m.id !== id);
  save(KEYS.MEALS, _state.meals);
}

// Links
export function getLinks() { return [..._state.links]; }

export function saveLink(link) {
  const idx = _state.links.findIndex(l => l.id === link.id);
  if (idx >= 0) _state.links[idx] = link;
  else _state.links.unshift(link);
  save(KEYS.LINKS, _state.links);
  return link;
}

export function deleteLink(id) {
  _state.links = _state.links.filter(l => l.id !== id);
  save(KEYS.LINKS, _state.links);
}

// Settings
export function getSettings() { return { ..._state.settings }; }
export function saveSettings(s) { _state.settings = { ..._state.settings, ...s }; save(KEYS.SETTINGS, _state.settings); }

// Util
export function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function today() { return new Date().toISOString().slice(0, 10); }
