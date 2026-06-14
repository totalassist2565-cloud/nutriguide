import { getClients, deleteClient } from '../js/store.js';
import { navigate, toast, confirm } from '../js/app.js';
import { emptyState } from './dashboard.js';

export function renderClients() {
  document.getElementById('header-actions').innerHTML = `
    <a href="#/clients/new" class="btn-primary flex items-center gap-1.5">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      新規クライアント
    </a>`;

  const clients = getClients();
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="space-y-4 max-w-4xl">
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <input id="search-input" type="text" class="input flex-1" placeholder="名前で検索...">
        </div>
        <div id="client-list">
          ${renderList(clients)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('search-input').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = q ? clients.filter(c => (c.name || '').toLowerCase().includes(q)) : clients;
    document.getElementById('client-list').innerHTML = renderList(filtered);
    attachDeleteHandlers();
  });

  attachDeleteHandlers();
}

function renderList(clients) {
  if (clients.length === 0) {
    return emptyState('クライアントがいません', '右上のボタンから追加してください', null, '');
  }
  return `<div class="divide-y divide-slate-100">
    ${clients.map(clientRow).join('')}
  </div>`;
}

function calcAgeSimple(birthdate) {
  if (!birthdate) return null;
  const today = new Date();
  const bd = new Date(birthdate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

function clientRow(c) {
  const age = c.birthdate ? calcAgeSimple(c.birthdate) + '歳' : '-';
  const sexLabel = c.sex === 'male' ? '男性' : '女性';
  const sexColor = c.sex === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700';
  const bmi = (c.weight && c.height) ? (c.weight / ((c.height/100)**2)).toFixed(1) : null;

  return `<div class="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-2 transition-colors group">
    <a href="#/clients/${c.id}" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        ${(c.name || '?')[0]}
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-medium text-slate-800 truncate">${c.name || '名前なし'}</div>
        <div class="text-xs text-slate-400">${age} · ${c.height ? c.height + 'cm' : ''} · ${c.weight ? c.weight + 'kg' : ''} ${bmi ? '· BMI ' + bmi : ''}</div>
      </div>
      <span class="badge ${sexColor} flex-shrink-0">${sexLabel}</span>
    </a>
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <a href="#/clients/${c.id}" class="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="詳細">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
      </a>
      <button class="delete-btn p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" data-id="${c.id}" title="削除">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  </div>`;
}

function attachDeleteHandlers() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const ok = await confirm('このクライアントとすべての食事記録を削除しますか？この操作は元に戻せません。');
      if (ok) {
        deleteClient(id);
        toast('クライアントを削除しました');
        renderClients();
      }
    };
  });
}
