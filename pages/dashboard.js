import { getClients, getMeals, today } from '../js/store.js';
import { navigate } from '../js/app.js';

export function renderDashboard() {
  const clients = getClients();
  const allMeals = clients.flatMap(c => getMeals(c.id));
  const todayStr = today();
  const todayMeals = allMeals.filter(m => m.date === todayStr);

  const recentClients = clients.slice(0, 6);

  document.getElementById('page-content').innerHTML = `
    <div class="space-y-6 max-w-5xl">
      <!-- Welcome -->
      <div class="bg-gradient-to-r from-brand-600 to-teal-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-1">NutriGuide</h2>
            <p class="text-brand-100 text-sm">栄養指導支援システム / 食事摂取基準2025年版</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">${clients.length}</div>
            <div class="text-brand-100 text-sm">登録クライアント</div>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-4">
        ${statCard('クライアント数', clients.length + '名', 'brand')}
        ${statCard('本日の記録', todayMeals.length + '件', 'teal')}
        ${statCard('総食事記録', allMeals.length + '件', 'slate')}
      </div>

      <!-- Quick actions -->
      <div class="card">
        <h3 class="font-semibold text-slate-700 mb-4">クイックアクション</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${quickAction('#/clients/new', '新規クライアント', 'M12 4v16m8-8H4', 'brand')}
          ${quickAction('#/calculator', '栄養量計算機', 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z', 'teal')}
          ${quickAction('#/converter', '食品変換', 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', 'blue')}
          ${quickAction('#/obsidian', 'Obsidianノート', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 'purple')}
        </div>
      </div>

      <!-- Recent clients -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-700">最近のクライアント</h3>
          <button onclick="location.hash='#/clients'" class="text-sm text-brand-600 hover:text-brand-700 font-medium">すべて見る →</button>
        </div>
        ${recentClients.length === 0
          ? emptyState('まだクライアントが登録されていません', '新規クライアントを追加しましょう', '#/clients/new', '+ 追加する')
          : `<div class="space-y-2">${recentClients.map(clientRow).join('')}</div>`
        }
      </div>

      <!-- About data sources -->
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p class="text-xs text-slate-500">
          <strong>データソース:</strong>
          日本人の食事摂取基準2025年版（厚生労働省）·
          日本食品標準成分表（文部科学省）·
          エビデンスのない情報は表示しません。
        </p>
      </div>
    </div>
  `;
}

function statCard(label, value, color) {
  const colors = { brand:'bg-brand-50 text-brand-700', teal:'bg-teal-50 text-teal-700', slate:'bg-slate-100 text-slate-700' };
  return `<div class="card text-center">
    <div class="text-2xl font-bold ${colors[color] || colors.slate} rounded-xl px-3 py-2 inline-block mb-2">${value}</div>
    <div class="text-sm text-slate-500">${label}</div>
  </div>`;
}

function quickAction(href, label, iconPath, color) {
  const colors = { brand:'bg-brand-50 text-brand-600 hover:bg-brand-100', teal:'bg-teal-50 text-teal-600 hover:bg-teal-100', blue:'bg-blue-50 text-blue-600 hover:bg-blue-100', purple:'bg-purple-50 text-purple-600 hover:bg-purple-100' };
  return `<a href="${href}" class="flex flex-col items-center gap-2 p-4 rounded-xl ${colors[color]} transition-colors cursor-pointer text-center">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
    </svg>
    <span class="text-sm font-medium">${label}</span>
  </a>`;
}

function clientRow(client) {
  const age = client.birthdate ? calcAgeSimple(client.birthdate) + '歳' : '-';
  const sexLabel = client.sex === 'male' ? '男性' : '女性';
  const sexColor = client.sex === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700';
  return `<a href="#/clients/${client.id}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      ${(client.name || '?')[0]}
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium text-slate-800 truncate">${client.name || '名前なし'}</div>
      <div class="text-xs text-slate-400">${age} · ${sexLabel}</div>
    </div>
    <span class="badge ${sexColor}">${client.height ? client.height + 'cm' : ''}</span>
  </a>`;
}

function calcAgeSimple(birthdate) {
  const today = new Date();
  const bd = new Date(birthdate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

export function emptyState(title, subtitle, href, btnLabel) {
  return `<div class="text-center py-10">
    <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
    </div>
    <p class="text-slate-600 font-medium mb-1">${title}</p>
    <p class="text-sm text-slate-400 mb-4">${subtitle}</p>
    ${href ? `<a href="${href}" class="btn-primary">${btnLabel}</a>` : ''}
  </div>`;
}
