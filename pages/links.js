import { getLinks, saveLink, deleteLink, newId } from '../js/store.js';
import { toast, confirm } from '../js/app.js';

const CATEGORIES = ['すべて', '食事摂取基準・ガイドライン', '研究・文献', '食品・成分表', 'ツール・計算機', '学会・機関', 'その他'];

export function renderLinks() {
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="max-w-5xl space-y-4">
      <!-- 検索・フィルタバー -->
      <div class="card flex items-center gap-3 flex-wrap">
        <input id="link-search" class="input flex-1 min-w-48" type="text" placeholder="タイトル・URL・メモで検索…">
        <button id="add-link-btn" class="btn-primary flex items-center gap-1.5 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          リンクを追加
        </button>
      </div>

      <!-- カテゴリフィルタ -->
      <div class="flex gap-2 flex-wrap" id="cat-filters">
        ${CATEGORIES.map((c, i) => `
          <button class="cat-btn px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
            ${i === 0 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700'}"
            data-cat="${c}">${c}</button>`).join('')}
      </div>

      <!-- リンク一覧 -->
      <div id="links-grid"></div>
    </div>
  `;

  let activeCat = 'すべて';
  let searchQ = '';

  function refresh() {
    const links = getLinks();
    const filtered = links.filter(l => {
      const matchCat = activeCat === 'すべて' || l.category === activeCat;
      const q = searchQ.toLowerCase();
      const matchQ = !q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || (l.memo || '').toLowerCase().includes(q) || (l.tags || []).some(t => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
    renderGrid(filtered);
  }

  document.getElementById('link-search').addEventListener('input', e => {
    searchQ = e.target.value.trim();
    refresh();
  });

  document.getElementById('cat-filters').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    document.querySelectorAll('.cat-btn').forEach(b => {
      const active = b.dataset.cat === activeCat;
      b.className = `cat-btn px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700'}`;
    });
    refresh();
  });

  document.getElementById('add-link-btn').addEventListener('click', () => openLinkModal(null, refresh));

  refresh();
}

function renderGrid(links) {
  const el = document.getElementById('links-grid');
  if (links.length === 0) {
    el.innerHTML = `<div class="card text-center py-12">
      <svg class="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
      <p class="text-slate-400 text-sm">まだリンクがありません</p>
      <button onclick="document.getElementById('add-link-btn').click()" class="btn-primary mt-3">+ 最初のリンクを追加</button>
    </div>`;
    return;
  }

  el.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    ${links.map(l => renderLinkCard(l)).join('')}
  </div>`;

  el.querySelectorAll('.edit-link').forEach(btn => {
    btn.onclick = () => openLinkModal(btn.dataset.id, () => renderGrid(getLinks()));
  });
  el.querySelectorAll('.del-link').forEach(btn => {
    btn.onclick = async () => {
      if (!await confirm('このリンクを削除しますか？')) return;
      deleteLink(btn.dataset.id);
      toast('削除しました');
      // refresh all
      const links = getLinks();
      renderGrid(links);
    };
  });
}

function renderLinkCard(l) {
  const host = (() => { try { return new URL(l.url).hostname; } catch { return ''; } })();
  const faviconUrl = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=32` : '';
  const catColor = categoryColor(l.category);

  return `<div class="card group hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
    <div class="flex items-start gap-3">
      <!-- Favicon / アイコン -->
      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
        ${faviconUrl
          ? `<img src="${faviconUrl}" class="w-6 h-6 object-contain" onerror="this.replaceWith(defaultLinkIcon())">`
          : linkSvg()
        }
      </div>

      <!-- タイトル・URL -->
      <div class="flex-1 min-w-0">
        <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"
           class="font-semibold text-slate-800 hover:text-brand-600 transition-colors line-clamp-1 text-sm leading-snug">
          ${esc(l.title)}
          <svg class="w-3 h-3 inline ml-0.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
        <div class="text-xs text-slate-400 truncate mt-0.5">${esc(host || l.url)}</div>
      </div>

      <!-- 操作ボタン -->
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button class="edit-link p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50" data-id="${l.id}" title="編集">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="del-link p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50" data-id="${l.id}" title="削除">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>

    <!-- メモ -->
    ${l.memo ? `<p class="text-xs text-slate-500 leading-relaxed line-clamp-2">${esc(l.memo)}</p>` : ''}

    <!-- タグ・カテゴリ -->
    <div class="flex items-center gap-2 flex-wrap mt-auto">
      <span class="text-xs px-2 py-0.5 rounded-full font-medium ${catColor}">${esc(l.category || 'その他')}</span>
      ${(l.tags || []).map(t => `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">#${esc(t)}</span>`).join('')}
    </div>
  </div>`;
}

function openLinkModal(editId, onSave) {
  const existing = editId ? getLinks().find(l => l.id === editId) : null;
  const link = existing || { id: newId(), title: '', url: '', category: 'その他', tags: [], memo: '' };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal max-w-lg">
    <div class="p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">${existing ? 'リンクを編集' : 'リンクを追加'}</h3>
      <div class="space-y-4">
        <div>
          <label class="label">URL <span class="text-red-400">*</span></label>
          <input id="l-url" class="input" type="url" placeholder="https://..." value="${esc(link.url)}">
        </div>
        <div>
          <label class="label">タイトル <span class="text-red-400">*</span></label>
          <input id="l-title" class="input" type="text" placeholder="ページのタイトル" value="${esc(link.title)}">
          <button id="fetch-title" class="text-xs text-brand-600 hover:underline mt-1">URLからタイトルを取得（手動コピー）</button>
        </div>
        <div>
          <label class="label">カテゴリ</label>
          <select id="l-cat" class="input">
            ${CATEGORIES.filter(c => c !== 'すべて').map(c => `<option ${c === link.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">タグ（スペース区切り）</label>
          <input id="l-tags" class="input" type="text" placeholder="例: 2025年版 エビデンス 鉄" value="${(link.tags || []).join(' ')}">
        </div>
        <div>
          <label class="label">メモ・概要</label>
          <textarea id="l-memo" class="input" rows="3" placeholder="どんなページか、どこで使うかなど…">${esc(link.memo || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button id="l-save" class="btn-primary flex-1">保存</button>
        <button id="l-cancel" class="btn-secondary">キャンセル</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  // URLからタイトルをコピー案内
  document.getElementById('fetch-title').addEventListener('click', () => {
    const url = document.getElementById('l-url').value.trim();
    if (!url) { toast('先にURLを入力してください', 'warn'); return; }
    navigator.clipboard.writeText(url).then(() => {
      toast('URLをコピーしました。ブラウザで開いてタイトルをコピーしてください', 'info');
    });
  });

  // URL入力時にタイトルが空なら自動でURLのホスト名をセット
  document.getElementById('l-url').addEventListener('blur', () => {
    const url = document.getElementById('l-url').value.trim();
    const titleEl = document.getElementById('l-title');
    if (url && !titleEl.value) {
      try { titleEl.value = new URL(url).hostname; } catch {}
    }
  });

  document.getElementById('l-save').addEventListener('click', () => {
    const url = document.getElementById('l-url').value.trim();
    const title = document.getElementById('l-title').value.trim();
    if (!url) { toast('URLを入力してください', 'error'); return; }
    if (!title) { toast('タイトルを入力してください', 'error'); return; }
    link.url = url;
    link.title = title;
    link.category = document.getElementById('l-cat').value;
    link.tags = document.getElementById('l-tags').value.split(/\s+/).map(t => t.replace(/^#/, '')).filter(Boolean);
    link.memo = document.getElementById('l-memo').value.trim();
    link.updatedAt = new Date().toISOString();
    saveLink(link);
    overlay.remove();
    onSave?.();
    toast(existing ? 'リンクを更新しました' : 'リンクを追加しました');
  });

  document.getElementById('l-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => document.getElementById('l-url').focus(), 50);
}

function categoryColor(cat) {
  const map = {
    '食事摂取基準・ガイドライン': 'bg-brand-100 text-brand-700',
    '研究・文献':                  'bg-blue-100 text-blue-700',
    '食品・成分表':                'bg-amber-100 text-amber-700',
    'ツール・計算機':              'bg-purple-100 text-purple-700',
    '学会・機関':                  'bg-teal-100 text-teal-700',
    'その他':                      'bg-slate-100 text-slate-600',
  };
  return map[cat] || map['その他'];
}

function linkSvg() {
  return `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`;
}

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
