import { FOODS, FOOD_CATEGORIES, NUTRIENT_LABELS, searchFoods, topFoodsByNutrient, gramsNeeded } from '../js/foods.js';

export function renderConverter() {
  document.getElementById('page-content').innerHTML = `
    <div class="max-w-5xl space-y-6">
      <!-- Tab toggle -->
      <div class="flex bg-slate-100 rounded-xl p-1 w-fit">
        <button id="tab-food2nut" class="px-4 py-2 rounded-lg text-sm font-medium bg-white shadow-sm text-slate-800" onclick="switchTab('food2nut')">食品 → 栄養素</button>
        <button id="tab-nut2food" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700" onclick="switchTab('nut2food')">栄養素 → 食品</button>
        <button id="tab-rank"     class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700" onclick="switchTab('rank')">栄養素ランキング</button>
      </div>

      <div id="tab-content">
        ${renderFood2Nut()}
      </div>
    </div>
  `;

  window.switchTab = (tab) => {
    ['food2nut','nut2food','rank'].forEach(t => {
      const btn = document.getElementById('tab-'+t);
      if (t === tab) { btn.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-white shadow-sm text-slate-800'; }
      else { btn.className = 'px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700'; }
    });
    const map = { food2nut: renderFood2Nut, nut2food: renderNut2Food, rank: renderRanking };
    document.getElementById('tab-content').innerHTML = map[tab]?.() || '';
    if (tab === 'food2nut') attachFood2NutEvents();
    if (tab === 'nut2food') attachNut2FoodEvents();
    if (tab === 'rank') attachRankEvents();
  };

  attachFood2NutEvents();
}

// ─────────────── 食品 → 栄養素 ───────────────
function renderFood2Nut() {
  return `<div class="card space-y-4">
    <h3 class="font-semibold text-slate-700">食品・量を入力 → 栄養素がわかる</h3>
    <div class="flex gap-3">
      <input id="food-search" class="input flex-1" type="text" placeholder="食品名を入力（例: 鶏むね肉）">
      <input id="food-amount" class="input w-28" type="number" placeholder="量 (g)" value="100">
    </div>
    <div id="food-search-results" class="grid grid-cols-2 md:grid-cols-3 gap-2"></div>
    <div id="food-nutrition" class="hidden">
      <div class="bg-brand-50 rounded-xl p-3 mb-3">
        <span id="food-selected-name" class="font-semibold text-brand-700"></span>
        <span id="food-selected-amount" class="text-brand-500 text-sm ml-1"></span>
      </div>
      <div id="food-nutrient-grid" class="grid grid-cols-2 md:grid-cols-3 gap-3"></div>
    </div>
  </div>`;
}

function attachFood2NutEvents() {
  let selectedFood = null;

  const searchEl = document.getElementById('food-search');
  const amountEl = document.getElementById('food-amount');
  if (!searchEl) return;

  function updateNutrition() {
    if (!selectedFood) return;
    const amount = parseFloat(amountEl.value) || 100;
    const ratio = amount / 100;
    document.getElementById('food-selected-amount').textContent = `${amount}g あたりの栄養素`;
    const grid = document.getElementById('food-nutrient-grid');
    grid.innerHTML = Object.entries(NUTRIENT_LABELS).map(([key, meta]) => {
      const val = selectedFood[key];
      if (val == null) return '';
      const computed = Math.round(val * ratio * 100) / 100;
      return `<div class="bg-white border border-slate-100 rounded-lg p-2.5">
        <div class="text-xs text-slate-400">${meta.label}</div>
        <div class="font-semibold text-slate-800">${computed} <span class="text-xs text-slate-400">${meta.unit}</span></div>
      </div>`;
    }).join('');
  }

  function showResults(foods) {
    const container = document.getElementById('food-search-results');
    container.innerHTML = foods.map(f => `
      <button class="food-pick text-left p-2.5 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm" data-id="${f.id}">
        <div class="font-medium text-slate-800 truncate">${f.name}</div>
        <div class="text-xs text-slate-400">${FOOD_CATEGORIES[f.category] || f.category}</div>
        <div class="text-xs text-slate-600 mt-1">${f.energy}kcal · P${f.protein}g · F${f.fat}g · C${f.carb}g</div>
      </button>`).join('');
    document.querySelectorAll('.food-pick').forEach(btn => {
      btn.onclick = () => {
        selectedFood = FOODS.find(f => f.id === btn.dataset.id);
        document.getElementById('food-selected-name').textContent = selectedFood.name;
        document.getElementById('food-nutrition').classList.remove('hidden');
        updateNutrition();
        container.innerHTML = '';
        searchEl.value = selectedFood.name;
      };
    });
  }

  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim();
    if (q.length < 1) { document.getElementById('food-search-results').innerHTML = ''; return; }
    showResults(searchFoods(q, 12));
  });

  amountEl.addEventListener('input', updateNutrition);
}

// ─────────────── 栄養素 → 食品 ───────────────
function renderNut2Food() {
  const nutOptions = Object.entries(NUTRIENT_LABELS).map(([k,v]) => `<option value="${k}">${v.label} (${v.unit})</option>`).join('');
  const catOptions = `<option value="">すべてのカテゴリ</option>` + Object.entries(FOOD_CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');

  return `<div class="card space-y-4">
    <h3 class="font-semibold text-slate-700">「1日○g摂るには？」— 食材に換算</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="label">栄養素</label>
        <select id="nut-select" class="input">${nutOptions}</select>
      </div>
      <div>
        <label class="label">目標量</label>
        <input id="nut-amount" class="input" type="number" step="0.1" placeholder="例: 60" value="60">
      </div>
      <div>
        <label class="label">食品カテゴリ（絞り込み）</label>
        <select id="nut-cat" class="input">${catOptions}</select>
      </div>
    </div>
    <button id="nut-calc-btn" class="btn-primary">換算する</button>
    <div id="nut-results"></div>
  </div>`;
}

function attachNut2FoodEvents() {
  document.getElementById('nut-calc-btn')?.addEventListener('click', () => {
    const nutrientKey = document.getElementById('nut-select').value;
    const targetAmount = parseFloat(document.getElementById('nut-amount').value);
    const cat = document.getElementById('nut-cat').value;
    if (!targetAmount) return;

    const nutrientMeta = NUTRIENT_LABELS[nutrientKey];
    let foods = cat ? FOODS.filter(f => f.category === cat) : FOODS;
    foods = foods.filter(f => (f[nutrientKey] || 0) > 0);
    foods.sort((a,b) => (b[nutrientKey]||0) - (a[nutrientKey]||0));
    const top = foods.slice(0, 20);

    document.getElementById('nut-results').innerHTML = `
      <div class="mt-2">
        <p class="text-sm text-slate-600 mb-3">
          <strong>${nutrientMeta.label} ${targetAmount}${nutrientMeta.unit}</strong>を摂るのに必要な食品量 (上位20品)
        </p>
        <div class="space-y-2">
          ${top.map(f => {
            const needed = gramsNeeded(f, nutrientKey, targetAmount);
            const per100 = f[nutrientKey];
            const barWidth = Math.min(100, (100 / (needed || 1)) * 60);
            return `<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-slate-800 text-sm truncate">${f.name}</span>
                  <span class="font-bold text-brand-700 text-sm flex-shrink-0 ml-2">${needed}g</span>
                </div>
                <div class="nutrient-bar">
                  <div class="nutrient-bar-fill" style="width:${100-barWidth}%;background:#16a34a"></div>
                </div>
                <div class="text-xs text-slate-400 mt-1">100gあたり ${per100}${nutrientMeta.unit} · ${FOOD_CATEGORIES[f.category]||''}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <p class="text-xs text-slate-400 mt-3">出典: 日本食品標準成分表</p>
      </div>`;
  });
}

// ─────────────── ランキング ───────────────
function renderRanking() {
  const nutOptions = Object.entries(NUTRIENT_LABELS).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
  const catOptions = `<option value="">すべて</option>` + Object.entries(FOOD_CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');

  return `<div class="card space-y-4">
    <h3 class="font-semibold text-slate-700">栄養素含有量ランキング</h3>
    <div class="flex gap-3 flex-wrap">
      <div class="flex-1 min-w-40">
        <label class="label">栄養素</label>
        <select id="rank-nut" class="input">${nutOptions}</select>
      </div>
      <div class="flex-1 min-w-40">
        <label class="label">カテゴリ</label>
        <select id="rank-cat" class="input">${catOptions}</select>
      </div>
      <div class="flex items-end">
        <button id="rank-btn" class="btn-primary">表示</button>
      </div>
    </div>
    <div id="rank-results"></div>
  </div>`;
}

function attachRankEvents() {
  document.getElementById('rank-btn')?.addEventListener('click', () => {
    const nutKey = document.getElementById('rank-nut').value;
    const cat = document.getElementById('rank-cat').value;
    const meta = NUTRIENT_LABELS[nutKey];
    const top = topFoodsByNutrient(nutKey, 15, cat || null);
    const maxVal = top[0]?.[nutKey] || 1;

    document.getElementById('rank-results').innerHTML = `
      <div class="space-y-2 mt-2">
        <p class="text-sm text-slate-500 mb-2">${meta.label}含有量 TOP15 (可食部100gあたり)</p>
        ${top.map((f, i) => {
          const val = f[nutKey] || 0;
          const bar = Math.round((val / maxVal) * 100);
          return `<div class="flex items-center gap-3">
            <div class="w-6 text-right text-sm font-bold text-slate-400">${i+1}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-slate-700 truncate">${f.name}</span>
                <span class="text-sm font-bold text-brand-700 ml-2">${val} ${meta.unit}</span>
              </div>
              <div class="nutrient-bar">
                <div class="nutrient-bar-fill" style="width:${bar}%;background:#16a34a"></div>
              </div>
              <div class="text-xs text-slate-400">${FOOD_CATEGORIES[f.category]||''}</div>
            </div>
          </div>`;
        }).join('')}
        <p class="text-xs text-slate-400 pt-2">出典: 日本食品標準成分表</p>
      </div>`;
  });
}
