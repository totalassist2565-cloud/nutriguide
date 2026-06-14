import { getClients, getMeals, getClient } from '../js/store.js';
import { calcTargets, calcAge, sumMealNutrition, calcAchievement, rateBarColor, buildClaudePrompt } from '../js/nutrition.js';
import { NUTRIENT_LABELS } from '../js/foods.js';
import { toast, registerChart, destroyChart } from '../js/app.js';

export function renderReports(params) {
  const clients = getClients();
  const preselect = (new URLSearchParams(location.hash.includes('?') ? location.hash.split('?')[1] : '')).get('client') || '';

  document.getElementById('page-content').innerHTML = `
    <div class="max-w-5xl space-y-4">
      <div class="card flex items-center gap-4">
        <label class="label mb-0 whitespace-nowrap">クライアント</label>
        <select id="rep-client" class="input max-w-64">
          <option value="">選択してください</option>
          ${clients.map(c => `<option value="${c.id}" ${c.id===preselect?'selected':''}>${c.name}</option>`).join('')}
        </select>
        <select id="rep-period" class="input w-36">
          <option value="7">直近7日間</option>
          <option value="14">直近14日間</option>
          <option value="30">直近30日間</option>
        </select>
        <button id="gen-report-btn" class="btn-primary ml-auto">レポート生成</button>
      </div>
      <div id="report-content"></div>
    </div>
  `;

  if (preselect) document.getElementById('rep-client').value = preselect;

  document.getElementById('gen-report-btn').onclick = () => {
    const cid = document.getElementById('rep-client').value;
    const days = parseInt(document.getElementById('rep-period').value);
    if (!cid) { alert('クライアントを選択してください'); return; }
    generateReport(cid, days);
  };
}

function generateReport(clientId, days) {
  const client = getClient(clientId);
  if (!client) return;

  const age = calcAge(client.birthdate);
  if (!age || !client.weight || !client.height) {
    document.getElementById('report-content').innerHTML = `<div class="card text-amber-700 bg-amber-50">基本情報（生年月日・身長・体重）が未入力です。クライアント編集から設定してください。</div>`;
    return;
  }

  const targets = calcTargets({
    age, sex: client.sex, weight: client.weight, height: client.height,
    pal: client.pal, lifestage: client.lifestage, conditions: client.conditions || []
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const allMeals = getMeals(clientId).filter(m => m.date >= cutoffStr);

  // 期間中の1日平均を計算
  const dayMap = {};
  allMeals.forEach(m => {
    if (!dayMap[m.date]) dayMap[m.date] = [];
    dayMap[m.date].push(...(m.items || []));
  });
  const recordedDays = Object.keys(dayMap).length;
  const dayTotals = Object.values(dayMap).map(items => sumMealNutrition(items));
  const avg = averageNutrition(dayTotals);

  destroyChart();

  document.getElementById('report-content').innerHTML = `
    <div id="printable-report" class="space-y-4">
      <!-- Header -->
      <div class="card bg-gradient-to-r from-brand-600 to-teal-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xl font-bold">${client.name} 様</div>
            <div class="text-brand-100 text-sm">${age}歳 · ${client.sex==='male'?'男性':'女性'} · ${client.height}cm · ${client.weight}kg</div>
            <div class="text-brand-100 text-xs mt-1">記録期間: 直近${days}日間 · ${recordedDays}日分の記録</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold">${targets.eer.toLocaleString()}</div>
            <div class="text-brand-100 text-xs">kcal/日 (目標)</div>
          </div>
        </div>
      </div>

      ${recordedDays === 0 ? `<div class="card text-slate-500">この期間の食事記録がありません</div>` : ''}

      ${recordedDays > 0 ? `
      <!-- Average achievement -->
      <div class="card">
        <h3 class="font-semibold text-slate-700 mb-4">平均摂取量 vs 目標 (${recordedDays}日間平均)</h3>
        ${renderAchievementGrid(avg, targets)}
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card">
          <h4 class="font-semibold text-slate-700 mb-3">PFCバランス</h4>
          <canvas id="pfc-chart" height="200"></canvas>
        </div>
        <div class="card">
          <h4 class="font-semibold text-slate-700 mb-3">主要栄養素 達成率</h4>
          <canvas id="achieve-chart" height="200"></canvas>
        </div>
      </div>

      <!-- Nutrient detail table -->
      <div class="card">
        <h3 class="font-semibold text-slate-700 mb-4">栄養素詳細 (平均摂取量)</h3>
        ${renderNutrientTable(avg, targets)}
      </div>
      ` : ''}

      <!-- Claude copy section -->
      <div class="card border-2 border-brand-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 font-bold text-sm">AI</div>
          <h3 class="font-semibold text-slate-700">Claudeで栄養指導コメントを生成</h3>
        </div>
        <p class="text-sm text-slate-500 mb-4">下のボタンでプロンプトをコピーし、<a href="https://claude.ai" target="_blank" class="text-brand-600 underline">claude.ai</a> または <a href="https://claude.ai/code" target="_blank" class="text-brand-600 underline">Claude Code</a> に貼り付けてください。</p>
        <div class="flex gap-2 flex-wrap">
          <button id="copy-claude-btn" class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            プロンプトをコピー
          </button>
          <button id="print-btn" class="btn-secondary no-print">🖨 印刷/PDF保存</button>
        </div>
      </div>
    </div>
  `;

  // Draw charts
  if (recordedDays > 0) {
    drawPFCChart(avg);
    drawAchievementChart(avg, targets);
  }

  // Copy Claude prompt
  document.getElementById('copy-claude-btn').onclick = () => {
    const prompt = buildClaudePrompt(client, targets, allMeals);
    navigator.clipboard.writeText(prompt).then(() => {
      toast('プロンプトをコピーしました！claude.aiに貼り付けてください');
    });
  };

  document.getElementById('print-btn').onclick = () => window.print();
}

function averageNutrition(dayTotals) {
  if (dayTotals.length === 0) return {};
  const keys = Object.keys(NUTRIENT_LABELS);
  const result = {};
  keys.forEach(k => {
    const sum = dayTotals.reduce((acc, d) => acc + (d[k] || 0), 0);
    result[k] = Math.round((sum / dayTotals.length) * 10) / 10;
  });
  return result;
}

function renderAchievementGrid(avg, targets) {
  const items = [
    { key: 'energy', label: 'エネルギー', target: targets.eer, unit: 'kcal', lower: false },
    { key: 'protein', label: 'たんぱく質', target: targets.protein, unit: 'g', lower: false },
    { key: 'fat', label: '脂質', target: targets.fatDGmax, unit: 'g', lower: true },
    { key: 'carb', label: '炭水化物', target: targets.carbDGmax, unit: 'g', lower: true },
    { key: 'fiber', label: '食物繊維', target: targets.fiber, unit: 'g', lower: false },
    { key: 'calcium', label: 'カルシウム', target: targets.calcium, unit: 'mg', lower: false },
    { key: 'iron', label: '鉄', target: targets.iron, unit: 'mg', lower: false },
    { key: 'vitC', label: 'ビタミンC', target: targets.vitC, unit: 'mg', lower: false },
    { key: 'salt', label: '食塩', target: targets.salt, unit: 'g', lower: true },
  ];

  return `<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    ${items.map(item => {
      const intake = avg[item.key] || 0;
      const pct = calcAchievement(intake, item.target);
      const color = rateBarColor(pct, item.lower);
      const barWidth = item.lower
        ? Math.min(100, pct)
        : Math.min(100, pct);
      return `<div class="bg-slate-50 rounded-xl p-3">
        <div class="flex justify-between text-xs text-slate-500 mb-1">
          <span>${item.label}</span>
          <span>${pct !== null ? pct + '%' : '-'}</span>
        </div>
        <div class="flex items-baseline gap-1 mb-1">
          <span class="text-lg font-bold text-slate-800">${intake}</span>
          <span class="text-xs text-slate-400">${item.unit}</span>
        </div>
        <div class="nutrient-bar">
          <div class="nutrient-bar-fill" style="width:${Math.min(barWidth,100)}%;background:${color}"></div>
        </div>
        <div class="text-xs text-slate-400 mt-1">目標: ${item.target}${item.unit}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderNutrientTable(avg, targets) {
  const rows = [
    ['エネルギー', avg.energy, targets.eer, 'kcal', false],
    ['たんぱく質', avg.protein, targets.protein, 'g', false],
    ['脂質', avg.fat, targets.fatDGmax, 'g', true],
    ['飽和脂肪酸', avg.satFat, targets.satFatUL, 'g', true],
    ['炭水化物', avg.carb, targets.carbDGmax, 'g', true],
    ['食物繊維', avg.fiber, targets.fiber, 'g', false],
    ['食塩相当量', avg.salt, targets.salt, 'g', true],
    ['カリウム', avg.potassium, targets.potassium, 'mg', false],
    ['カルシウム', avg.calcium, targets.calcium, 'mg', false],
    ['鉄', avg.iron, targets.iron, 'mg', false],
    ['亜鉛', avg.zinc, targets.zinc, 'mg', false],
    ['ビタミンA', avg.vitA, targets.vitA, 'μgRAE', false],
    ['ビタミンD', avg.vitD, targets.vitD, 'μg', false],
    ['ビタミンB1', avg.vitB1, targets.vitB1, 'mg', false],
    ['ビタミンB2', avg.vitB2, targets.vitB2, 'mg', false],
    ['ビタミンC', avg.vitC, targets.vitC, 'mg', false],
    ['葉酸', avg.folate, targets.folate, 'μg', false],
    ['ビタミンB12', avg.vitB12, targets.vitB12, 'μg', false],
  ];

  return `<div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-slate-200">
          <th class="text-left py-2 text-slate-500 font-medium">栄養素</th>
          <th class="text-right py-2 text-slate-500 font-medium">平均摂取</th>
          <th class="text-right py-2 text-slate-500 font-medium">目標</th>
          <th class="text-right py-2 text-slate-500 font-medium">達成率</th>
          <th class="text-left py-2 text-slate-500 font-medium w-32"></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(([label, intake, target, unit, lower]) => {
          const pct = calcAchievement(intake, target);
          const color = rateBarColor(pct, lower);
          const barWidth = Math.min(pct || 0, 100);
          return `<tr class="border-b border-slate-50 hover:bg-slate-50">
            <td class="py-2 text-slate-700">${label}</td>
            <td class="py-2 text-right font-semibold text-slate-800">${intake ?? '-'} ${unit}</td>
            <td class="py-2 text-right text-slate-500">${target ?? '-'} ${unit}</td>
            <td class="py-2 text-right font-semibold" style="color:${color}">${pct !== null ? pct + '%' : '-'}</td>
            <td class="py-2 pl-2">
              <div class="nutrient-bar w-24">
                <div class="nutrient-bar-fill" style="width:${barWidth}%;background:${color}"></div>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="text-xs text-slate-400 mt-2">根拠: 日本人の食事摂取基準2025年版（厚生労働省）· 日本食品標準成分表（文部科学省）</p>
  </div>`;
}

function drawPFCChart(avg) {
  const canvas = document.getElementById('pfc-chart');
  if (!canvas) return;
  const p = (avg.protein || 0) * 4;
  const f = (avg.fat || 0) * 9;
  const c = (avg.carb || 0) * 4;
  const total = p + f + c || 1;
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['たんぱく質', '脂質', '炭水化物'],
      datasets: [{
        data: [Math.round(p/total*100), Math.round(f/total*100), Math.round(c/total*100)],
        backgroundColor: ['#16a34a', '#0d9488', '#f59e0b'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
      }
    }
  });
  registerChart(chart);
}

function drawAchievementChart(avg, targets) {
  const canvas = document.getElementById('achieve-chart');
  if (!canvas) return;
  const data = [
    { label: 'エネルギー', pct: calcAchievement(avg.energy, targets.eer) },
    { label: 'たんぱく質', pct: calcAchievement(avg.protein, targets.protein) },
    { label: 'カルシウム', pct: calcAchievement(avg.calcium, targets.calcium) },
    { label: '鉄', pct: calcAchievement(avg.iron, targets.iron) },
    { label: 'ビタミンC', pct: calcAchievement(avg.vitC, targets.vitC) },
    { label: '食物繊維', pct: calcAchievement(avg.fiber, targets.fiber) },
  ].filter(d => d.pct !== null);

  const chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: '達成率 (%)',
        data: data.map(d => Math.min(d.pct, 150)),
        backgroundColor: data.map(d => d.pct >= 100 ? '#16a34a' : d.pct >= 75 ? '#f59e0b' : '#dc2626'),
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 150, ticks: { callback: v => v + '%' } },
        x: { ticks: { font: { size: 11 } } }
      }
    }
  });
  // Note: for multiple charts, need different management
}
