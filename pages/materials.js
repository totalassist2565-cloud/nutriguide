// 説明用資料ページ — 画像ギャラリー
import { saveMaterial, getMaterial, getAllMaterials, deleteMaterial, fileToDataURL, compressImage } from '../js/db.js';
import { newId } from '../js/store.js';
import { toast, confirm } from '../js/app.js';

const CATEGORIES = {
  balance:   '食事バランス',
  nutrients: '栄養素の働き',
  disease:   '疾患別指導資料',
  foods:     '食品・食材',
  lifestyle: '生活習慣',
  chart:     'グラフ・データ',
  other:     'その他',
};

export async function renderMaterials() {
  document.getElementById('header-actions').innerHTML = `
    <label class="btn-primary cursor-pointer flex items-center gap-1.5">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
      画像を追加
      <input id="upload-input" type="file" accept="image/*" multiple class="hidden">
    </label>`;

  document.getElementById('page-content').innerHTML = `
    <div class="max-w-6xl space-y-4">
      <!-- Filter bar -->
      <div class="flex flex-wrap items-center gap-3">
        <input id="mat-search" class="input w-52" type="text" placeholder="タイトルで検索...">
        <div class="flex gap-1 flex-wrap">
          <button class="cat-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-100 text-brand-700" data-cat="">すべて</button>
          ${Object.entries(CATEGORIES).map(([k,v]) => `
            <button class="cat-btn px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100" data-cat="${k}">${v}</button>
          `).join('')}
        </div>
      </div>

      <!-- Gallery -->
      <div id="gallery" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="col-span-full flex items-center justify-center py-16">
          <div class="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  `;

  let materials = await getAllMaterials();
  let activeCategory = '';
  let searchQuery = '';

  function filteredMaterials() {
    return materials.filter(m => {
      const matchCat = !activeCategory || m.category === activeCategory;
      const matchQ = !searchQuery || m.title.toLowerCase().includes(searchQuery);
      return matchCat && matchQ;
    });
  }

  function renderGallery() {
    const list = filteredMaterials();
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    if (list.length === 0) {
      gallery.innerHTML = `<div class="col-span-full text-center py-16">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <p class="text-slate-500 font-medium mb-2">画像がありません</p>
        <p class="text-slate-400 text-sm">右上の「画像を追加」からアップロードしてください</p>
      </div>`;
      return;
    }

    gallery.innerHTML = list.map(m => `
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow material-card" data-id="${m.id}">
        <div class="relative aspect-video bg-slate-100 cursor-pointer view-btn" data-id="${m.id}">
          <img src="${m.thumbnail}" alt="${m.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </div>
        </div>
        <div class="p-3">
          <div class="flex items-start justify-between gap-1 mb-1">
            <h4 class="font-medium text-slate-800 text-sm leading-tight line-clamp-2 flex-1">${esc(m.title)}</h4>
            <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="edit-btn p-1 rounded text-slate-400 hover:text-brand-600" data-id="${m.id}" title="編集">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="del-btn p-1 rounded text-slate-400 hover:text-red-500" data-id="${m.id}" title="削除">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-wrap">
            <span class="tag bg-brand-50 text-brand-600">${CATEGORIES[m.category] || m.category}</span>
            ${m.tags ? m.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="tag bg-slate-100 text-slate-500">${esc(t)}</span>`).join('') : ''}
          </div>
          ${m.memo ? `<p class="text-xs text-slate-400 mt-1.5 line-clamp-2">${esc(m.memo)}</p>` : ''}
          <p class="text-xs text-slate-300 mt-1">${new Date(m.createdAt).toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    `).join('');

    // Attach events
    document.querySelectorAll('.view-btn').forEach(btn => btn.onclick = () => openViewer(btn.dataset.id, materials));
    document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => openEditModal(btn.dataset.id, materials, async () => { materials = await getAllMaterials(); renderGallery(); }));
    document.querySelectorAll('.del-btn').forEach(btn => btn.onclick = async () => {
      if (await confirm('この画像を削除しますか？')) {
        await deleteMaterial(btn.dataset.id);
        materials = materials.filter(m => m.id !== btn.dataset.id);
        renderGallery();
        toast('削除しました');
      }
    });
  }

  renderGallery();

  // Category filter
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.dataset.cat;
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = b.dataset.cat === activeCategory
          ? 'cat-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-100 text-brand-700'
          : 'cat-btn px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100';
      });
      renderGallery();
    };
  });

  // Search
  document.getElementById('mat-search')?.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    renderGallery();
  });

  // Upload
  document.getElementById('upload-input')?.addEventListener('change', async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    for (const file of files) {
      await openAddModal(file, async () => { materials = await getAllMaterials(); renderGallery(); });
    }
    e.target.value = '';
  });
}

// ─── 追加モーダル ───
async function openAddModal(file, onSave) {
  const compressed = await compressImage(file, 1400, 0.88);
  const dataURL = await fileToDataURL(compressed);
  const thumb = await makeThumbnail(compressed);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal max-w-lg">
    <div class="p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">資料を追加</h3>
      <div class="mb-4">
        <img src="${dataURL}" class="w-full rounded-xl object-contain max-h-64 bg-slate-100">
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">タイトル <span class="text-red-500">*</span></label>
          <input id="mat-title" class="input" type="text" placeholder="例: PFCバランスの説明資料" value="${esc(file.name.replace(/\.[^.]+$/, ''))}">
        </div>
        <div>
          <label class="label">カテゴリ</label>
          <select id="mat-cat" class="input">
            ${Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">タグ（カンマ区切り）</label>
          <input id="mat-tags" class="input" type="text" placeholder="例: ビタミン, 鉄, 貧血">
        </div>
        <div>
          <label class="label">メモ</label>
          <textarea id="mat-memo" class="input" rows="2" placeholder="使い方・対象クライアントなど"></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button id="mat-save" class="btn-primary flex-1">保存</button>
        <button id="mat-cancel" class="btn-secondary">キャンセル</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  document.getElementById('mat-save').onclick = async () => {
    const title = document.getElementById('mat-title').value.trim();
    if (!title) { alert('タイトルを入力してください'); return; }
    const mat = {
      id: newId(),
      title,
      category: document.getElementById('mat-cat').value,
      tags: document.getElementById('mat-tags').value,
      memo: document.getElementById('mat-memo').value,
      dataURL,
      thumbnail: thumb,
      createdAt: Date.now(),
    };
    await saveMaterial(mat);
    overlay.remove();
    onSave?.();
    toast('資料を保存しました');
  };
  document.getElementById('mat-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ─── 編集モーダル ───
async function openEditModal(id, materials, onSave) {
  const m = materials.find(x => x.id === id);
  if (!m) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal max-w-lg">
    <div class="p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">資料を編集</h3>
      <div class="mb-4">
        <img src="${m.thumbnail}" class="w-full rounded-xl object-contain max-h-48 bg-slate-100">
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">タイトル</label>
          <input id="edit-title" class="input" type="text" value="${esc(m.title)}">
        </div>
        <div>
          <label class="label">カテゴリ</label>
          <select id="edit-cat" class="input">
            ${Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}" ${m.category===k?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">タグ</label>
          <input id="edit-tags" class="input" type="text" value="${esc(m.tags || '')}">
        </div>
        <div>
          <label class="label">メモ</label>
          <textarea id="edit-memo" class="input" rows="2">${esc(m.memo || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button id="edit-save" class="btn-primary flex-1">更新</button>
        <button id="edit-cancel" class="btn-secondary">キャンセル</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  document.getElementById('edit-save').onclick = async () => {
    m.title = document.getElementById('edit-title').value.trim() || m.title;
    m.category = document.getElementById('edit-cat').value;
    m.tags = document.getElementById('edit-tags').value;
    m.memo = document.getElementById('edit-memo').value;
    await saveMaterial(m);
    overlay.remove();
    onSave?.();
    toast('更新しました');
  };
  document.getElementById('edit-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ─── 拡大ビューア ───
async function openViewer(id, materials) {
  const m = materials.find(x => x.id === id);
  if (!m) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.innerHTML = `<div class="max-w-4xl w-full mx-4">
    <div class="flex items-center justify-between mb-3 px-1">
      <div>
        <h3 class="text-white font-semibold text-lg">${esc(m.title)}</h3>
        <p class="text-slate-400 text-sm">${CATEGORIES[m.category] || ''} ${m.tags ? '· ' + m.tags : ''}</p>
      </div>
      <div class="flex gap-2">
        <a id="dl-btn" href="${m.dataURL}" download="${esc(m.title)}.jpg" class="btn-secondary text-sm">⬇ ダウンロード</a>
        <button id="close-viewer" class="text-white/70 hover:text-white p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    <img src="${m.dataURL}" alt="${esc(m.title)}" class="w-full rounded-2xl object-contain max-h-[75vh]">
    ${m.memo ? `<p class="text-slate-400 text-sm mt-3 px-1">${esc(m.memo)}</p>` : ''}
  </div>`;
  document.body.appendChild(overlay);

  document.getElementById('close-viewer').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// サムネイル生成（400px幅）
async function makeThumbnail(blob) {
  const compressed = await compressImage(blob instanceof File ? blob : new File([blob], 'img'), 400, 0.7);
  return fileToDataURL(compressed);
}

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
