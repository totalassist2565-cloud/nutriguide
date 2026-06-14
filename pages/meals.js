import { getClients, getMeals, saveMeal, deleteMeal, getClient, newId, today } from '../js/store.js';
import { calcTargets, calcAge, sumMealNutrition, calcAchievement, rateBarColor } from '../js/nutrition.js';
import { FOODS, NUTRIENT_LABELS, searchFoods } from '../js/foods.js';
import { toast, confirm } from '../js/app.js';
import { saveMealImage, getMealImage, deleteMealImage, fileToDataURL, compressImage } from '../js/db.js';

const MEAL_TYPES = ['朝食', '昼食', '夕食', '間食', 'その他'];

export function renderMeals(params) {
  const clients = getClients();
  const preselect = (new URLSearchParams(location.hash.includes('?') ? location.hash.split('?')[1] : '')).get('client') || '';

  document.getElementById('page-content').innerHTML = `
    <div class="max-w-5xl space-y-4">
      <div class="card flex items-center gap-4 flex-wrap">
        <label class="label mb-0 whitespace-nowrap">クライアント</label>
        <select id="meal-client-select" class="input max-w-64">
          <option value="">選択してください</option>
          ${clients.map(c => `<option value="${c.id}" ${c.id===preselect?'selected':''}>${c.name}</option>`).join('')}
        </select>
        <button id="add-meal-btn" class="btn-primary ml-auto hidden flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          食事を追加
        </button>
      </div>
      <div id="meals-content"></div>
    </div>
  `;

  const clientSelect = document.getElementById('meal-client-select');

  function loadClient(clientId) {
    if (!clientId) { document.getElementById('meals-content').innerHTML = ''; return; }
    document.getElementById('add-meal-btn').classList.remove('hidden');
    renderMealContent(clientId);
  }

  clientSelect.addEventListener('change', () => loadClient(clientSelect.value));
  document.getElementById('add-meal-btn').addEventListener('click', () => {
    const cid = clientSelect.value;
    if (cid) openMealModal(cid, null, () => renderMealContent(cid));
  });

  if (preselect) loadClient(preselect);
}

async function renderMealContent(clientId) {
  const client = getClient(clientId);
  const meals = getMeals(clientId);
  const container = document.getElementById('meals-content');
  if (!client) return;

  const age = calcAge(client.birthdate);
  const hasTargets = age && client.weight && client.height;
  const targets = hasTargets ? calcTargets({
    age, sex: client.sex, weight: client.weight, height: client.height,
    pal: client.pal, lifestage: client.lifestage, conditions: client.conditions || []
  }) : null;

  if (meals.length === 0) {
    container.innerHTML = `<div class="card text-center py-10">
      <p class="text-slate-500 mb-3">まだ食事記録がありません</p>
      <button onclick="document.getElementById('add-meal-btn').click()" class="btn-primary">+ 最初の記録を追加</button>
    </div>`;
    return;
  }

  const byDate = {};
  meals.forEach(m => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });
  const sortedDates = Object.keys(byDate).sort().reverse();

  container.innerHTML = `<div class="space-y-4" id="dates-container">
    ${sortedDates.map(date => renderDateBlock(date, byDate[date], targets)).join('')}
  </div>`;

  // 画像を非同期で読み込んで埋め込む
  for (const meal of meals) {
    if (meal.imageId) {
      const img = await getMealImage(meal.imageId);
      if (img) {
        const el = document.getElementById(`meal-img-${meal.id}`);
        if (el) el.src = img.dataURL;
      }
    }
  }

  attachMealActions(clientId);
}

function renderDateBlock(date, meals, targets) {
  const dayTotal = sumMealNutrition(meals.flatMap(m => m.items || []));
  const ach = targets ? {
    energy: calcAchievement(dayTotal.energy, targets.eer),
    protein: calcAchievement(dayTotal.protein, targets.protein),
    fiber: calcAchievement(dayTotal.fiber, targets.fiber),
    salt: calcAchievement(dayTotal.salt, targets.salt),
  } : null;

  return `<div class="card">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-slate-700">${formatDate(date)}</div>
      ${ach ? `<div class="text-xs text-slate-400">${dayTotal.energy}kcal / 目標${targets.eer}kcal</div>` : ''}
    </div>
    ${ach ? `<div class="flex gap-2 mb-4 flex-wrap">
      ${miniAch('エネルギー', ach.energy, false)}
      ${miniAch('たんぱく質', ach.protein, false)}
      ${miniAch('食物繊維', ach.fiber, false)}
      ${miniAch('食塩', ach.salt, true)}
    </div>` : ''}
    <div class="space-y-3">
      ${meals.map(m => renderMealCard(m)).join('')}
    </div>
  </div>`;
}

function miniAch(label, pct, lowerIsBetter) {
  if (pct === null) return '';
  const color = rateBarColor(pct, lowerIsBetter);
  return `<div class="bg-slate-50 rounded-lg px-3 py-2 text-center min-w-16">
    <div class="text-xs text-slate-500">${label}</div>
    <div class="text-sm font-bold" style="color:${color}">${Math.min(pct, 999)}%</div>
  </div>`;
}

function renderMealCard(meal) {
  const total = sumMealNutrition(meal.items || []);
  const hasItems = (meal.items || []).length > 0;
  const hasImage = !!meal.imageId;

  return `<div class="border border-slate-100 rounded-xl p-3 group" id="meal-${meal.id}">
    <div class="flex items-start gap-3">
      <!-- 画像サムネイル -->
      ${hasImage ? `<div class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100 cursor-pointer view-meal-img" data-id="${meal.id}">
        <img id="meal-img-${meal.id}" src="" alt="" class="w-full h-full object-cover">
      </div>` : ''}
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge bg-brand-100 text-brand-700">${meal.mealType || '食事'}</span>
            ${hasItems ? `<span class="text-sm text-slate-500">${total.energy}kcal · P${total.protein}g · F${total.fat}g · C${total.carb}g</span>` : ''}
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="edit-meal p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50" data-id="${meal.id}" title="編集">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="del-meal p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" data-id="${meal.id}" title="削除">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        ${meal.freeText ? `<p class="text-sm text-slate-600 mb-1.5">${esc(meal.freeText)}</p>` : ''}
        ${hasItems ? `<div class="text-xs text-slate-500 flex flex-wrap gap-1">
          ${meal.items.map(i => `<span class="bg-slate-100 px-2 py-0.5 rounded-full">${i.name} ${i.amount}g</span>`).join('')}
        </div>` : ''}
        ${meal.claudeResult ? `<div class="mt-2 bg-brand-50 rounded-lg p-2 text-xs text-brand-700 whitespace-pre-wrap">${esc(meal.claudeResult)}</div>` : ''}
      </div>
    </div>
  </div>`;
}

function attachMealActions(clientId) {
  document.querySelectorAll('.edit-meal').forEach(btn => {
    btn.onclick = () => {
      const meal = getMeals(clientId).find(m => m.id === btn.dataset.id);
      if (meal) openMealModal(clientId, meal, () => renderMealContent(clientId));
    };
  });
  document.querySelectorAll('.del-meal').forEach(btn => {
    btn.onclick = async () => {
      if (!await confirm('この食事記録を削除しますか？')) return;
      const meal = getMeals(clientId).find(m => m.id === btn.dataset.id);
      if (meal?.imageId) await deleteMealImage(meal.imageId);
      deleteMeal(btn.dataset.id);
      renderMealContent(clientId);
      toast('削除しました');
    };
  });
  document.querySelectorAll('.view-meal-img').forEach(btn => {
    btn.onclick = async () => {
      const meal = getMeals(clientId).find(m => m.id === btn.dataset.id);
      if (!meal?.imageId) return;
      const img = await getMealImage(meal.imageId);
      if (!img) return;
      openImageViewer(img.dataURL, meal.mealType + ' ' + meal.date);
    };
  });
}

async function openMealModal(clientId, existingMeal, onSave) {
  const meal = existingMeal || { id: newId(), clientId, date: today(), mealType: '朝食', items: [], freeText: '', imageId: null, claudeResult: '' };

  // 既存画像を読み込む
  let currentImageDataURL = null;
  let pendingImageFile = null;
  if (meal.imageId) {
    const stored = await getMealImage(meal.imageId);
    if (stored) currentImageDataURL = stored.dataURL;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal max-w-2xl">
    <div class="p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">${existingMeal ? '食事記録を編集' : '食事を記録する'}</h3>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">日付</label>
            <input id="m-date" class="input" type="date" value="${meal.date}">
          </div>
          <div>
            <label class="label">食事区分</label>
            <select id="m-type" class="input">
              ${MEAL_TYPES.map(t => `<option ${t===meal.mealType?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- 画像アップロードエリア -->
        <div>
          <label class="label">食事の写真・スクリーンショット（任意）</label>
          <div id="img-zone" class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors relative">
            ${currentImageDataURL
              ? `<img id="preview-img" src="${currentImageDataURL}" class="max-h-48 mx-auto rounded-lg object-contain">`
              : `<div id="img-placeholder">
                  <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p class="text-sm text-slate-400">クリックまたはドラッグ＆ドロップで画像をアップロード</p>
                  <p class="text-xs text-slate-300 mt-1">JPG / PNG / スクリーンショット対応</p>
                </div>`
            }
            <input id="img-input" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
          </div>
          <div id="claude-analyze-section" class="${currentImageDataURL ? '' : 'hidden'} mt-2">
            ${renderClaudeAnalyzeUI(meal.claudeResult || '')}
          </div>
          ${currentImageDataURL ? `<button id="remove-img" class="text-xs text-red-400 hover:text-red-600 mt-1">✕ 画像を削除</button>` : ''}
        </div>

        <div>
          <label class="label">自由入力メモ</label>
          <textarea id="m-free" class="input" rows="2" placeholder="例: ご飯150g、みそ汁1杯...">${esc(meal.freeText || '')}</textarea>
        </div>

        <div>
          <label class="label">食品・栄養値を追加</label>
          <div class="flex gap-1 mb-3 bg-slate-100 p-1 rounded-lg">
            <button id="tab-search" class="flex-1 text-xs py-1.5 px-3 rounded-md bg-white font-medium text-slate-700 shadow-sm">食品検索</button>
            <button id="tab-manual" class="flex-1 text-xs py-1.5 px-3 rounded-md text-slate-500">外部アプリから入力</button>
          </div>
          <div id="panel-search">
            <div class="flex gap-2 mb-2">
              <input id="m-food-search" class="input flex-1" type="text" placeholder="食品名で検索">
              <input id="m-food-amount" class="input w-24" type="number" placeholder="g" value="100">
              <button id="m-food-add" class="btn-secondary flex-shrink-0">追加</button>
            </div>
            <div id="m-food-suggest" class="grid grid-cols-2 gap-1 mb-2"></div>
          </div>
          <div id="panel-manual" class="hidden">
            <p class="text-xs text-slate-500 mb-2">外部アプリで計算した栄養値を入力してください。</p>
            <a href="https://eat-treat.jp/calculation" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg mb-3 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              栄養計算を開く（eat-treat.jp）
            </a>
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div><label class="label text-xs">エネルギー(kcal)</label><input id="mn-energy" class="input" type="number" min="0" placeholder="0"></div>
              <div><label class="label text-xs">たんぱく質(g)</label><input id="mn-protein" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
              <div><label class="label text-xs">脂質(g)</label><input id="mn-fat" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
              <div><label class="label text-xs">炭水化物(g)</label><input id="mn-carb" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
              <div><label class="label text-xs">食物繊維(g)</label><input id="mn-fiber" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
              <div><label class="label text-xs">食塩相当量(g)</label><input id="mn-salt" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
            </div>
            <details class="mb-3">
              <summary class="text-xs text-slate-500 cursor-pointer select-none">▶ ミネラル・ビタミン（任意）</summary>
              <div class="grid grid-cols-3 gap-2 mt-2">
                <div><label class="label text-xs">カリウム(mg)</label><input id="mn-potassium" class="input" type="number" min="0" placeholder="0"></div>
                <div><label class="label text-xs">カルシウム(mg)</label><input id="mn-calcium" class="input" type="number" min="0" placeholder="0"></div>
                <div><label class="label text-xs">鉄(mg)</label><input id="mn-iron" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
                <div><label class="label text-xs">亜鉛(mg)</label><input id="mn-zinc" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンA(μgRAE)</label><input id="mn-vitA" class="input" type="number" min="0" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンD(μg)</label><input id="mn-vitD" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンB1(mg)</label><input id="mn-vitB1" class="input" type="number" min="0" step="0.01" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンB2(mg)</label><input id="mn-vitB2" class="input" type="number" min="0" step="0.01" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンB6(mg)</label><input id="mn-vitB6" class="input" type="number" min="0" step="0.01" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンB12(μg)</label><input id="mn-vitB12" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
                <div><label class="label text-xs">ビタミンC(mg)</label><input id="mn-vitC" class="input" type="number" min="0" placeholder="0"></div>
                <div><label class="label text-xs">葉酸(μg)</label><input id="mn-folate" class="input" type="number" min="0" placeholder="0"></div>
                <div><label class="label text-xs">ナイアシン(mg)</label><input id="mn-niacin" class="input" type="number" min="0" step="0.1" placeholder="0"></div>
              </div>
            </details>
            <div class="flex gap-2">
              <input id="mn-label" class="input flex-1 text-sm" type="text" placeholder="食事の名前（例: 昼食・栄養君より）">
              <button id="mn-add" class="btn-primary flex-shrink-0">追加</button>
            </div>
          </div>
          <div id="m-items" class="space-y-1 mt-2"></div>
        </div>

        <div id="m-total" class="hidden bg-brand-50 rounded-xl p-3 text-sm text-brand-700"></div>
      </div>

      <div class="flex gap-3 mt-6">
        <button id="m-save" class="btn-primary flex-1">保存</button>
        <button id="m-cancel" class="btn-secondary">キャンセル</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  let items = [...(meal.items || [])];
  renderItems();

  // 画像アップロード処理
  const imgInput = document.getElementById('img-input');
  imgInput.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    pendingImageFile = file;
    const compressed = await compressImage(file, 1200, 0.85);
    currentImageDataURL = await fileToDataURL(compressed);
    document.getElementById('img-zone').innerHTML = `
      <img id="preview-img" src="${currentImageDataURL}" class="max-h-48 mx-auto rounded-lg object-contain">
      <input id="img-input-new" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">`;
    document.getElementById('img-zone').insertAdjacentHTML('afterend', `<button id="remove-img" class="text-xs text-red-400 hover:text-red-600 mt-1">✕ 画像を削除</button>`);
    document.getElementById('claude-analyze-section').classList.remove('hidden');
    document.getElementById('claude-analyze-section').innerHTML = renderClaudeAnalyzeUI('');
    attachClaudeUI();

    document.getElementById('img-input-new')?.addEventListener('change', async ev => {
      const f = ev.target.files[0]; if (!f) return;
      pendingImageFile = f;
      const c2 = await compressImage(f, 1200, 0.85);
      currentImageDataURL = await fileToDataURL(c2);
      document.getElementById('preview-img').src = currentImageDataURL;
    });
    attachRemoveImg();
  });

  function attachRemoveImg() {
    document.getElementById('remove-img')?.addEventListener('click', () => {
      pendingImageFile = null;
      currentImageDataURL = null;
      meal.imageId = null;
      document.getElementById('img-zone').innerHTML = `
        <div id="img-placeholder">
          <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <p class="text-sm text-slate-400">クリックまたはドラッグ＆ドロップで画像をアップロード</p>
        </div>
        <input id="img-input" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">`;
      document.getElementById('claude-analyze-section').classList.add('hidden');
      document.getElementById('remove-img')?.remove();
      // re-attach input
      document.getElementById('img-input')?.addEventListener('change', async e => {
        const file = e.target.files[0]; if (!file) return;
        pendingImageFile = file;
        const comp = await compressImage(file, 1200, 0.85);
        currentImageDataURL = await fileToDataURL(comp);
        document.getElementById('img-zone').innerHTML = `
          <img id="preview-img" src="${currentImageDataURL}" class="max-h-48 mx-auto rounded-lg object-contain">
          <input id="img-input-new" type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">`;
        document.getElementById('img-zone').insertAdjacentHTML('afterend', `<button id="remove-img" class="text-xs text-red-400 hover:text-red-600 mt-1">✕ 画像を削除</button>`);
        document.getElementById('claude-analyze-section').classList.remove('hidden');
        document.getElementById('claude-analyze-section').innerHTML = renderClaudeAnalyzeUI('');
        attachClaudeUI();
        attachRemoveImg();
      });
    });
  }
  attachRemoveImg();
  attachClaudeUI();

  // 食品検索
  const searchEl = document.getElementById('m-food-search');
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim();
    const suggest = document.getElementById('m-food-suggest');
    if (!q) { suggest.innerHTML = ''; return; }
    suggest.innerHTML = searchFoods(q, 8).map(f => `
      <button class="suggest-pick text-left p-2 rounded-lg border border-slate-200 hover:border-brand-400 text-xs" data-id="${f.id}">
        <div class="font-medium">${f.name}</div><div class="text-slate-400">${f.energy}kcal/100g</div>
      </button>`).join('');
    suggest.querySelectorAll('.suggest-pick').forEach(btn => {
      btn.onclick = () => { const food = FOODS.find(f => f.id === btn.dataset.id); searchEl.value = food.name; suggest.innerHTML = ''; };
    });
  });

  // タブ切替
  document.getElementById('tab-search').addEventListener('click', () => {
    document.getElementById('tab-search').className = 'flex-1 text-xs py-1.5 px-3 rounded-md bg-white font-medium text-slate-700 shadow-sm';
    document.getElementById('tab-manual').className = 'flex-1 text-xs py-1.5 px-3 rounded-md text-slate-500';
    document.getElementById('panel-search').classList.remove('hidden');
    document.getElementById('panel-manual').classList.add('hidden');
  });
  document.getElementById('tab-manual').addEventListener('click', () => {
    document.getElementById('tab-manual').className = 'flex-1 text-xs py-1.5 px-3 rounded-md bg-white font-medium text-slate-700 shadow-sm';
    document.getElementById('tab-search').className = 'flex-1 text-xs py-1.5 px-3 rounded-md text-slate-500';
    document.getElementById('panel-manual').classList.remove('hidden');
    document.getElementById('panel-search').classList.add('hidden');
  });

  // 外部アプリ入力
  document.getElementById('mn-add').onclick = () => {
    const g = id => parseFloat(document.getElementById(id)?.value) || 0;
    const label = document.getElementById('mn-label').value.trim() || '手動入力（外部アプリ）';
    const item = {
      id: 'manual', name: label, amount: 0, isManual: true,
      energy: g('mn-energy'), protein: g('mn-protein'), fat: g('mn-fat'),
      satFat: 0, carb: g('mn-carb'), fiber: g('mn-fiber'), sugar: 0,
      salt: g('mn-salt'), potassium: g('mn-potassium'), calcium: g('mn-calcium'),
      iron: g('mn-iron'), zinc: g('mn-zinc'), vitA: g('mn-vitA'), vitD: g('mn-vitD'),
      vitB1: g('mn-vitB1'), vitB2: g('mn-vitB2'), vitB6: g('mn-vitB6'),
      vitB12: g('mn-vitB12'), vitC: g('mn-vitC'), folate: g('mn-folate'), niacin: g('mn-niacin'),
    };
    if (item.energy === 0 && item.protein === 0 && item.carb === 0) { toast('栄養値を入力してください'); return; }
    items.push(item);
    renderItems();
    ['mn-energy','mn-protein','mn-fat','mn-carb','mn-fiber','mn-salt','mn-potassium','mn-calcium',
     'mn-iron','mn-zinc','mn-vitA','mn-vitD','mn-vitB1','mn-vitB2','mn-vitB6','mn-vitB12',
     'mn-vitC','mn-folate','mn-niacin','mn-label'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    toast('栄養値を追加しました');
  };

  document.getElementById('m-food-add').onclick = () => {
    const name = searchEl.value.trim();
    const amount = parseFloat(document.getElementById('m-food-amount').value) || 100;
    if (!name) return;
    const food = FOODS.find(f => f.name === name);
    if (food) {
      const r = amount / 100;
      const item = Object.fromEntries(Object.entries(food).map(([k,v]) => [k, typeof v === 'number' && k !== 'amount' ? Math.round(v * r * 100) / 100 : v]));
      item.amount = amount;
      items.push(item);
    } else {
      items.push({ id:'custom', name, amount, energy:0, protein:0, fat:0, carb:0, fiber:0, sugar:0, salt:0, potassium:0, calcium:0, iron:0, zinc:0, vitA:0, vitD:0, vitB1:0, vitB2:0, vitB6:0, vitB12:0, vitC:0, folate:0, niacin:0 });
    }
    searchEl.value = '';
    renderItems();
  };

  function renderItems() {
    document.getElementById('m-items').innerHTML = items.map((item, i) => `
      <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
        <span class="flex-1 text-slate-700">${item.name}</span>
        ${item.isManual
          ? `<span class="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">外部入力</span>`
          : `<span class="text-slate-500">${item.amount}g</span>`}
        <button class="text-slate-400 hover:text-red-500 rm-item" data-i="${i}">×</button>
      </div>`).join('');
    updateTotal();
    document.querySelectorAll('.rm-item').forEach(btn => {
      btn.onclick = () => { items.splice(parseInt(btn.dataset.i), 1); renderItems(); };
    });
  }

  function updateTotal() {
    const total = document.getElementById('m-total');
    if (items.length === 0) { total.classList.add('hidden'); return; }
    const s = sumMealNutrition(items);
    total.classList.remove('hidden');
    total.innerHTML = `合計: ${s.energy}kcal · たんぱく質${s.protein}g · 脂質${s.fat}g · 炭水化物${s.carb}g · 食塩${s.salt}g`;
  }

  // 保存
  document.getElementById('m-save').onclick = async () => {
    meal.date = document.getElementById('m-date').value;
    meal.mealType = document.getElementById('m-type').value;
    meal.freeText = document.getElementById('m-free').value;
    meal.items = items;
    meal.claudeResult = document.getElementById('claude-result-input')?.value || meal.claudeResult || '';

    // 画像を保存
    if (pendingImageFile) {
      const imgId = meal.imageId || newId();
      const compressed = await compressImage(pendingImageFile, 1200, 0.85);
      const dataURL = await fileToDataURL(compressed);
      await saveMealImage({ id: imgId, dataURL, mealId: meal.id });
      meal.imageId = imgId;
    } else if (!currentImageDataURL && meal.imageId) {
      await deleteMealImage(meal.imageId);
      meal.imageId = null;
    }

    saveMeal(meal);
    overlay.remove();
    onSave?.();
    toast('食事記録を保存しました');
  };

  document.getElementById('m-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function renderClaudeAnalyzeUI(existingResult) {
  return `
    <div class="bg-gradient-to-r from-brand-50 to-teal-50 rounded-xl p-4 border border-brand-100">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center text-white text-xs font-bold">AI</div>
        <span class="text-sm font-semibold text-brand-800">Claudeで食事内容を解析</span>
      </div>
      <p class="text-xs text-slate-500 mb-3">①「プロンプトをコピー」→ ② <a href="https://claude.ai" target="_blank" class="text-brand-600 underline">claude.ai</a> で画像と一緒に送信 → ③ 返答を下に貼り付け</p>
      <div class="flex gap-2 mb-3">
        <button id="copy-analyze-prompt" class="btn-primary text-xs flex-1">① プロンプトをコピー</button>
        <a href="https://claude.ai" target="_blank" class="btn-secondary text-xs flex-1 text-center">② claude.ai を開く</a>
      </div>
      <div>
        <label class="label text-xs">③ Claudeの返答を貼り付け（そのまま保存されます）</label>
        <textarea id="claude-result-input" class="input text-xs" rows="3" placeholder="Claudeが解析した食事内容をここに貼り付けてください...">${existingResult}</textarea>
      </div>
    </div>`;
}

function attachClaudeUI() {
  document.getElementById('copy-analyze-prompt')?.addEventListener('click', () => {
    const prompt = `添付した食事の写真・スクリーンショットから、食べている食品と大まかな量（グラム数）を読み取ってください。

以下のフォーマットで回答してください：
【食品名】【量（g）】
例：
・白米 150g
・味噌汁 200ml
・焼き鮭 80g

量が不明な場合は「（推定）」と付けてください。
スクリーンショットがアプリの記録画面の場合は、そのまま読み取ってください。`;
    navigator.clipboard.writeText(prompt).then(() => toast('プロンプトをコピーしました！claude.aiに画像と一緒に送ってください'));
  });
}

function openImageViewer(dataURL, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.background = 'rgba(0,0,0,0.9)';
  overlay.innerHTML = `<div class="max-w-3xl w-full mx-4 text-center">
    <p class="text-white/70 text-sm mb-3">${esc(title)}</p>
    <img src="${dataURL}" class="max-h-[80vh] mx-auto rounded-xl object-contain">
    <button class="mt-4 btn-secondary close-v">閉じる</button>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.close-v').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['日','月','火','水','木','金','土'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
