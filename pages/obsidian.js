// Obsidian Vault 参照機能
// File System Access API (Chrome/Edge で動作)

const VAULT_PATH_KEY = 'ng_obsidian_handle';
let vaultHandle = null;
let allNotes = [];

export function renderObsidian() {
  document.getElementById('page-content').innerHTML = `
    <div class="max-w-5xl space-y-4">
      <!-- Vault selector -->
      <div class="card">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex-1">
            <h3 class="font-semibold text-slate-700">Obsidian Vault 接続</h3>
            <p class="text-sm text-slate-400 mt-0.5">D:\\Vaults\\Nutrition-Public\\Nutrition-Public</p>
          </div>
          <button id="open-vault-btn" class="btn-primary">📂 Vaultフォルダを開く</button>
        </div>
        <div id="vault-status" class="mt-3 text-sm text-slate-500">
          ${vaultHandle ? `✅ 接続済: ${allNotes.length}件のノート` : 'フォルダを選択してください'}
        </div>
        <p class="text-xs text-amber-600 mt-2">※ Chrome/Edge のみ対応。フォルダを選択するとローカルファイルを読み込みます（外部送信なし）。</p>
      </div>

      ${vaultHandle ? renderSearchPanel() : renderInstructions()}
    </div>
  `;

  document.getElementById('open-vault-btn').onclick = openVault;

  if (vaultHandle) {
    attachSearchEvents();
  }
}

async function openVault() {
  if (!window.showDirectoryPicker) {
    alert('この機能はChrome/Edge（最新版）のみ対応しています。\n\nFirefox/Safariでは使用できません。');
    return;
  }
  try {
    document.getElementById('vault-status').textContent = '読み込み中...';
    vaultHandle = await window.showDirectoryPicker({ mode: 'read' });
    allNotes = await readAllMarkdown(vaultHandle);
    document.getElementById('vault-status').innerHTML = `✅ 接続済: <strong>${allNotes.length}件</strong>のノートを読み込みました`;
    document.getElementById('page-content').querySelector('.max-w-5xl').insertAdjacentHTML('beforeend', renderSearchPanel());
    attachSearchEvents();
  } catch (e) {
    if (e.name !== 'AbortError') {
      document.getElementById('vault-status').textContent = 'エラー: ' + e.message;
    }
  }
}

async function readAllMarkdown(dirHandle, basePath = '') {
  const notes = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      try {
        const file = await entry.getFile();
        const content = await file.text();
        notes.push({
          name: entry.name.replace('.md', ''),
          path: basePath ? basePath + '/' + entry.name : entry.name,
          content,
          tags: extractTags(content),
          excerpt: extractExcerpt(content),
        });
      } catch {}
    } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
      const sub = await readAllMarkdown(entry, basePath ? basePath + '/' + entry.name : entry.name);
      notes.push(...sub);
    }
  }
  return notes;
}

function extractTags(content) {
  const matches = content.match(/#[\w\/ぁ-ん亜-熙ァ-ン]+/g) || [];
  return [...new Set(matches)];
}

function extractExcerpt(content) {
  return content.replace(/^---[\s\S]*?---/, '').replace(/#+\s*/g, '').trim().slice(0, 150) + '...';
}

function renderSearchPanel() {
  const allTags = [...new Set(allNotes.flatMap(n => n.tags))].sort();
  const tagOptions = allTags.map(t => `<option value="${t}">${t}</option>`).join('');

  return `<div id="obsidian-search-panel" class="card space-y-4">
    <h3 class="font-semibold text-slate-700">ノートを検索・参照</h3>
    <div class="flex gap-3 flex-wrap">
      <input id="obs-search" class="input flex-1 min-w-40" type="text" placeholder="キーワードで検索（例: 鉄分、貧血、PMS）">
      <select id="obs-tag-filter" class="input w-52">
        <option value="">すべてのタグ</option>
        ${tagOptions}
      </select>
    </div>
    <div id="obs-results" class="space-y-2">
      ${allNotes.slice(0, 10).map(noteCard).join('')}
    </div>
  </div>
  <div id="obs-viewer" class="hidden card">
    <div class="flex items-center justify-between mb-4">
      <h3 id="obs-view-title" class="font-semibold text-slate-800"></h3>
      <div class="flex gap-2">
        <button id="obs-copy-btn" class="btn-secondary text-xs">📋 コピー</button>
        <button id="obs-close-btn" class="btn-secondary text-xs">✕ 閉じる</button>
      </div>
    </div>
    <div id="obs-view-content" class="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-96 overflow-y-auto bg-slate-50 rounded-xl p-4"></div>
  </div>`;
}

function noteCard(note) {
  const tagBadges = note.tags.slice(0, 5).map(t => `<span class="tag bg-slate-100 text-slate-600">${t}</span>`).join(' ');
  return `<div class="p-3 border border-slate-100 rounded-xl hover:border-brand-200 hover:bg-brand-50 cursor-pointer transition-colors note-card" data-path="${note.path}">
    <div class="flex items-start justify-between gap-2 mb-1">
      <span class="font-medium text-slate-800 text-sm">${note.name}</span>
      <span class="text-xs text-slate-400 flex-shrink-0">${note.path.split('/')[0]}</span>
    </div>
    <p class="text-xs text-slate-500 mb-2 line-clamp-2">${note.excerpt}</p>
    <div class="flex flex-wrap gap-1">${tagBadges}</div>
  </div>`;
}

function attachSearchEvents() {
  const searchEl = document.getElementById('obs-search');
  const tagEl = document.getElementById('obs-tag-filter');
  if (!searchEl) return;

  function updateResults() {
    const q = searchEl.value.toLowerCase();
    const tag = tagEl.value;
    let results = allNotes;
    if (q) results = results.filter(n => n.name.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    if (tag) results = results.filter(n => n.tags.includes(tag));
    document.getElementById('obs-results').innerHTML = results.slice(0, 20).map(noteCard).join('') || '<p class="text-slate-400 text-sm">該当するノートがありません</p>';
    attachCardClicks();
  }

  searchEl.addEventListener('input', updateResults);
  tagEl.addEventListener('change', updateResults);
  attachCardClicks();
}

function attachCardClicks() {
  document.querySelectorAll('.note-card').forEach(card => {
    card.onclick = () => {
      const note = allNotes.find(n => n.path === card.dataset.path);
      if (!note) return;
      document.getElementById('obs-viewer').classList.remove('hidden');
      document.getElementById('obs-view-title').textContent = note.name;
      document.getElementById('obs-view-content').textContent = note.content;
      document.getElementById('obs-copy-btn').onclick = () => {
        navigator.clipboard.writeText(note.content).then(() => alert('ノート内容をコピーしました。Claudeに貼り付けてください。'));
      };
      document.getElementById('obs-close-btn').onclick = () => {
        document.getElementById('obs-viewer').classList.add('hidden');
      };
      document.getElementById('obs-viewer').scrollIntoView({ behavior: 'smooth' });
    };
  });
}

function renderInstructions() {
  return `<div class="card">
    <h3 class="font-semibold text-slate-700 mb-3">使い方</h3>
    <ol class="space-y-3 text-sm text-slate-600">
      <li class="flex gap-3">
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">1</span>
        <span>「Vaultフォルダを開く」をクリックし、<code class="bg-slate-100 px-1 rounded">D:\\Vaults\\Nutrition-Public\\Nutrition-Public</code> を選択</span>
      </li>
      <li class="flex gap-3">
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">2</span>
        <span>すべての.mdファイルが読み込まれ、キーワード・タグで検索できます</span>
      </li>
      <li class="flex gap-3">
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">3</span>
        <span>関連ノートを開き「📋 コピー」→ Claudeに貼り付けて栄養指導コメントに活用</span>
      </li>
    </ol>
    <p class="text-xs text-slate-400 mt-4">※ ファイルはすべてローカルで処理されます。外部サーバーへの送信は一切ありません。</p>
  </div>`;
}
