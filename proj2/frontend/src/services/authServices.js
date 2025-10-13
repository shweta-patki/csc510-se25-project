const USERS_KEY = 'mock_users';
const AUTH_KEY = 'auth_mock';

async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function makeToken() { return btoa(`${Math.random().toString(36).slice(2)}:${Date.now()}`); }

export async function register({ username, password }) {
    // simulate network
    await new Promise(r => setTimeout(r, 250));
    const users = loadUsers();
    if (users.find(u => u.username === username)) {
        const e = new Error('User already exists');
        e.code = 'USER_EXISTS';
        throw e;
    }
    const passwordHash = await hashPassword(password);
    users.push({ username, passwordHash });
    saveUsers(users);
    const token = makeToken();
    const auth = { user: { username }, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return auth;
}

export async function login({ username, password }) {
    await new Promise(r => setTimeout(r, 250));
    const users = loadUsers();
    const found = users.find(u => u.username === username);
    if (!found) throw new Error('Invalid credentials');
    const passwordHash = await hashPassword(password);
    if (passwordHash !== found.passwordHash) throw new Error('Invalid credentials');
    const token = makeToken();
    const auth = { user: { username }, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return auth;
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
}

export function getSavedAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}