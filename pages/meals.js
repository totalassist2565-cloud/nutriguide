import { getClients, getMeals, saveMeal, deleteMeal, getClient, newId, today } from '../js/store.js';
import { calcTargets, calcAge, sumMealNutrition, calcAchievement, rateBarColor } from '../js/nutrition.js';
import { FOODS, FOOD_CATEGORIES, NUTRIENT_LABELS, searchFoods } from '../js/foods.js';
import { toast, confirm, registerChart, destroyChart } from '../js/app.js';

const MEAL_TYPES = ['朝食', '昼食', '夕食', '間食', 'その他'];

export function renderMeals(params) {
  const clients = getClients();
  const preselect = (new URLSearchParams(location.hash.includes('?') ? location.hash.split('?')[1] : '')).get('client') || '';

  document.getElementById('page-content').innerHTML = `
    <div class="max-w-5xl space-y-4">
      <!-- Client selector -->
      <div class="card flex items-center gap-4">
        <label class="label mb-0 whitespace-nowrap">クライアント</label>
        <select id="meal-client-select" class="input max-w-64">
          <option value="">選択してください</option>
          ${clients.map(c => `<option value="${c.id}" ${c.id===preselect?'selected':''}>${c.name}</option>`).join('')}
        </select>
        <button id="add-meal-btn" class="btn-primary ml-auto hidden">+ 食事を追加</button>
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

function renderMealContent(clientId) {
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

  // Group by date
  const byDate = {};
  meals.forEach(m => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });
  const sortedDates = Object.keys(byDate).sort().reverse();

  container.innerHTML = `<div class="space-y-4">
    ${sortedDates.map(date => renderDateBlock(date, byDate[date], targets, clientId)).join('')}
  </div>`;
}

function renderDateBlock(date, meals, targets, clientId) {
  const dayTotal = sumMealNutrition(meals.flatMap(m => m.items || []));
  const ach = targets ? {
    energy: calcAchievement(dayTotal.energy, targets.eer),
    protein: calcAchievement(dayTotal.protein, targets.protein),
    fat: calcAchievement(dayTotal.fat, targets.fatDGmax),
    carb: calcAchievement(dayTotal.carb, targets.carbDGmax),
    fiber: calcAchievement(dayTotal.fiber, targets.fiber),
    salt: calcAchievement(dayTotal.salt, targets.salt),
  } : null;

  return `<div class="card">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-slate-700">${formatDate(date)}</div>
      ${ach ? `<div class="text-xs text-slate-400">${dayTotal.energy}kcal / 目標${targets.eer}kcal</div>` : ''}
    </div>

    ${ach ? `<div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
      ${miniAch('エネルギー', ach.energy, '%', false)}
      ${miniAch('たんぱく質', ach.protein, '%', false)}
      ${miniAch('脂質', ach.fat, '%', true)}
      ${miniAch('炭水化物', ach.carb, '%', true)}
      ${miniAch('食物繊維', ach.fiber, '%', false)}
      ${miniAch('食塩', ach.salt, '%', true)}
    </div>` : ''}

    <div class="space-y-2">
      ${meals.map(m => renderMealCard(m, clientId)).join('')}
    </div>
  </div>`;
}

function miniAch(label, pct, unit, lowerIsBetter) {
  if (pct === null) return `<div class="bg-slate-50 rounded-lg p-2 text-center"><div class="text-xs text-slate-400">${label}</div><div class="text-xs text-slate-400">-</div></div>`;
  const color = rateBarColor(pct, lowerIsBetter);
  const displayPct = Math.min(pct, 999);
  return `<div class="bg-slate-50 rounded-lg p-2 text-center">
    <div class="text-xs text-slate-500 mb-1">${label}</div>
    <div class="text-sm font-bold" style="color:${color}">${displayPct}%</div>
  </div>`;
}

function renderMealCard(meal, clientId) {
  const total = sumMealNutrition(meal.items || []);
  const hasItems = (meal.items || []).length > 0;
  return `<div class="border border-slate-100 rounded-xl p-3" id="meal-${meal.id}">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="badge bg-brand-100 text-brand-700">${meal.mealType || '食事'}</span>
        ${hasItems ? `<span class="text-sm text-slate-500">${total.energy}kcal · P${total.protein}g · F${total.fat}g · C${total.carb}g</span>` : ''}
      </div>
      <div class="flex gap-1">
        <button class="edit-meal p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50" data-id="${meal.id}" data-cid="${clientId}" title="編集">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="del-meal p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" data-id="${meal.id}" data-cid="${clientId}" title="削除">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    ${meal.freeText ? `<p class="text-sm text-slate-600 italic mb-2">${meal.freeText}</p>` : ''}
    ${hasItems ? `<div class="text-xs text-slate-500 flex flex-wrap gap-1">${meal.items.map(i => `<span class="bg-slate-100 px-2 py-0.5 rounded-full">${i.name} ${i.amount}g</span>`).join('')}</div>` : ''}
  </div>`;
}

function openMealModal(clientId, existingMeal, onSave) {
  const meal = existingMeal || { id: newId(), clientId, date: today(), mealType: '朝食', items: [], freeText: '' };

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
        <div>
          <label class="label">自由入力（テキストで記録）</label>
          <textarea id="m-free" class="input" rows="2" placeholder="例: ご飯150g、みそ汁1杯、焼き鮭100g...">${meal.freeText || ''}</textarea>
        </div>
        <div>
          <label class="label">食品を追加（栄養計算用）</label>
          <div class="flex gap-2 mb-2">
            <input id="m-food-search" class="input flex-1" type="text" placeholder="食品名を検索">
            <input id="m-food-amount" class="input w-24" type="number" placeholder="g" value="100">
            <button id="m-food-add" class="btn-secondary flex-shrink-0">追加</button>
          </div>
          <div id="m-food-suggest" class="grid grid-cols-2 gap-1 mb-2"></div>
          <div id="m-items" class="space-y-1"></div>
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

  function renderItems() {
    const el = document.getElementById('m-items');
    el.innerHTML = items.map((item, i) => `
      <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
        <span class="flex-1 text-slate-700">${item.name}</span>
        <span class="text-slate-500">${item.amount}g</span>
        <button class="text-slate-400 hover:text-red-500 remove-item" data-i="${i}">×</button>
      </div>`).join('');
    updateTotal();
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.onclick = () => { items.splice(parseInt(btn.dataset.i), 1); renderItems(); };
    });
  }

  function updateTotal() {
    if (items.length === 0) { document.getElementById('m-total').classList.add('hidden'); return; }
    const total = sumMealNutrition(items);
    document.getElementById('m-total').classList.remove('hidden');
    document.getElementById('m-total').innerHTML = `合計: ${total.energy}kcal · たんぱく質${total.protein}g · 脂質${total.fat}g · 炭水化物${total.carb}g · 食塩${total.salt}g`;
  }

  const searchEl = document.getElementById('m-food-search');
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim();
    const suggest = document.getElementById('m-food-suggest');
    if (!q) { suggest.innerHTML = ''; return; }
    const results = searchFoods(q, 8);
    suggest.innerHTML = results.map(f => `
      <button class="suggest-pick text-left p-2 rounded-lg border border-slate-200 hover:border-brand-400 text-xs" data-id="${f.id}">
        <div class="font-medium">${f.name}</div>
        <div class="text-slate-400">${f.energy}kcal/100g</div>
      </button>`).join('');
    suggest.querySelectorAll('.suggest-pick').forEach(btn => {
      btn.onclick = () => {
        const food = FOODS.find(f => f.id === btn.dataset.id);
        searchEl.value = food.name;
        suggest.innerHTML = '';
        document.getElementById('m-food-amount').focus();
      };
    });
  });

  document.getElementById('m-food-add').onclick = () => {
    const name = searchEl.value.trim();
    const amount = parseFloat(document.getElementById('m-food-amount').value) || 100;
    if (!name) return;
    const food = FOODS.find(f => f.name === name);
    if (food) {
      const ratio = amount / 100;
      const item = { ...food };
      Object.keys(item).forEach(k => { if (typeof item[k] === 'number' && k !== 'amount') item[k] = Math.round(item[k] * ratio * 100) / 100; });
      item.amount = amount;
      items.push(item);
    } else {
      items.push({ id: 'custom', name, amount, energy:0,protein:0,fat:0,carb:0,fiber:0,sugar:0,salt:0,potassium:0,calcium:0,iron:0,zinc:0,vitA:0,vitD:0,vitB1:0,vitB2:0,vitB6:0,vitB12:0,vitC:0,folate:0,niacin:0 });
    }
    searchEl.value = '';
    renderItems();
  };

  document.getElementById('m-save').onclick = () => {
    meal.date = document.getElementById('m-date').value;
    meal.mealType = document.getElementById('m-type').value;
    meal.freeText = document.getElementById('m-free').value;
    meal.items = items;
    saveMeal(meal);
    overlay.remove();
    onSave?.();
    toast('食事記録を保存しました');
  };

  document.getElementById('m-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // Attach edit/delete after render
  document.addEventListener('click', function handler(e) {
    if (e.target.closest('.edit-meal')) {
      const btn = e.target.closest('.edit-meal');
      const mid = btn.dataset.id;
      const cid = btn.dataset.cid;
      const m = getMeals(cid).find(x => x.id === mid);
      if (m) { overlay.remove(); document.removeEventListener('click', handler); openMealModal(cid, m, onSave); }
    }
    if (e.target.closest('.del-meal')) {
      const btn = e.target.closest('.del-meal');
      confirm('この食事記録を削除しますか？').then(ok => {
        if (ok) { deleteMeal(btn.dataset.id); onSave?.(); toast('削除しました'); }
      });
    }
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

// Re-attach edit/delete after content render
document.addEventListener('click', function(e) {
  if (e.target.closest('.edit-meal')) {
    const btn = e.target.closest('.edit-meal');
    const clientId = btn.dataset.cid;
    const mealId = btn.dataset.id;
    const meal = getMeals(clientId).find(m => m.id === mealId);
    if (meal) openMealModal(clientId, meal, () => renderMealContent(clientId));
  }
  if (e.target.closest('.del-meal')) {
    const btn = e.target.closest('.del-meal');
    confirm('この記録を削除しますか？').then(ok => {
      if (ok) { deleteMeal(btn.dataset.id); renderMealContent(btn.dataset.cid); toast('削除しました'); }
    });
  }
});
