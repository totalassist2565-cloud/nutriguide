import { getClient, saveClient, newId, today } from '../js/store.js';
import { calcTargets, calcAge, calcBMI, calcIBW, classifyBMI, PAL_LEVELS } from '../js/nutrition.js';
import { navigate, toast, registerChart, destroyChart } from '../js/app.js';

const CONDITIONS_LIST = [
  { key: 'diabetes',     label: '糖尿病' },
  { key: 'hypertension', label: '高血圧' },
  { key: 'dyslipidemia', label: '脂質異常症' },
  { key: 'ckd_g3a',     label: 'CKD G3a (eGFR 45-59)' },
  { key: 'ckd_g3b',     label: 'CKD G3b (eGFR 30-44)' },
  { key: 'ckd_g4',      label: 'CKD G4 (eGFR 15-29)' },
  { key: 'ckd_g5',      label: 'CKD G5 (eGFR <15)' },
  { key: 'liver',       label: '肝疾患' },
  { key: 'hyperuricemia',label: '高尿酸血症' },
  { key: 'no_menses',   label: '月経なし（女性）' },
];

const LIFESTAGE_OPTIONS = [
  { value: 'normal',    label: '通常' },
  { value: 'pregnant1', label: '妊娠初期（〜16週）' },
  { value: 'pregnant2', label: '妊娠中期（17〜27週）' },
  { value: 'pregnant3', label: '妊娠後期（28週〜）' },
  { value: 'lactating', label: '授乳期' },
];

export function renderClientDetail(params) {
  const isNew = params.id === undefined || params.id === 'new';
  const client = isNew ? null : getClient(params.id);

  document.getElementById('page-title').textContent = isNew ? '新規クライアント' : (client?.name || 'クライアント詳細');

  if (!isNew && !client) {
    document.getElementById('page-content').innerHTML = `<div class="card"><p class="text-slate-600">クライアントが見つかりません。</p></div>`;
    return;
  }

  document.getElementById('header-actions').innerHTML = `
    <div class="flex gap-2">
      ${!isNew ? `<a href="#/meals?client=${client.id}" class="btn-secondary">食事記録</a>` : ''}
      ${!isNew ? `<a href="#/reports?client=${client.id}" class="btn-secondary">レポート</a>` : ''}
    </div>`;

  const data = client || {
    id: newId(), name: '', birthdate: '', sex: 'female', height: '', weight: '',
    pal: 'moderate', lifestage: 'normal', conditions: [], memo: ''
  };

  document.getElementById('page-content').innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl">
      <!-- Form -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card">
          <h3 class="font-semibold text-slate-700 mb-4">基本情報</h3>
          <form id="client-form" class="space-y-4">
            <div>
              <label class="label">氏名</label>
              <input class="input" name="name" type="text" placeholder="山田 花子" value="${esc(data.name)}" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">生年月日</label>
                <input class="input" name="birthdate" type="date" value="${esc(data.birthdate)}">
              </div>
              <div>
                <label class="label">性別</label>
                <select class="input" name="sex">
                  <option value="female" ${data.sex==='female'?'selected':''}>女性</option>
                  <option value="male"   ${data.sex==='male'  ?'selected':''}>男性</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">身長 (cm)</label>
                <input class="input" name="height" type="number" step="0.1" placeholder="160" value="${esc(data.height)}">
              </div>
              <div>
                <label class="label">体重 (kg)</label>
                <input class="input" name="weight" type="number" step="0.1" placeholder="55" value="${esc(data.weight)}">
              </div>
            </div>
            <div>
              <label class="label">身体活動レベル (PAL)</label>
              <select class="input" name="pal">
                ${Object.entries(PAL_LEVELS).map(([k,v]) => `<option value="${k}" ${data.pal===k?'selected':''}>${v.label} — ${v.desc}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="label">ライフステージ</label>
              <select class="input" name="lifestage">
                ${LIFESTAGE_OPTIONS.map(o => `<option value="${o.value}" ${data.lifestage===o.value?'selected':''}>${o.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="label">疾患・特記事項（複数選択可）</label>
              <div class="space-y-2 mt-1">
                ${CONDITIONS_LIST.map(c => `
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="conditions" value="${c.key}" class="rounded border-slate-300 text-brand-600"
                      ${(data.conditions||[]).includes(c.key) ? 'checked' : ''}>
                    <span class="text-sm text-slate-700">${c.label}</span>
                  </label>`).join('')}
              </div>
            </div>
            <div>
              <label class="label">メモ</label>
              <textarea class="input" name="memo" rows="3" placeholder="指導上の注意事項など...">${esc(data.memo || '')}</textarea>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="submit" class="btn-primary flex-1">保存する</button>
              <button type="button" id="calc-btn" class="btn-secondary flex-1">栄養量を計算</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Results -->
      <div class="lg:col-span-3 space-y-4" id="results-panel">
        ${!isNew && client ? renderTargetsPanel(client) : renderEmptyResults()}
      </div>
    </div>
  `;

  // Form submit
  document.getElementById('client-form').addEventListener('submit', e => {
    e.preventDefault();
    const saved = saveForm(e.target, data.id);
    if (!isNew) {
      updateResults(saved);
    } else {
      navigate(`/clients/${saved.id}`);
    }
    toast('保存しました');
    document.getElementById('page-title').textContent = saved.name;
  });

  // Calc button — live preview
  document.getElementById('calc-btn').addEventListener('click', () => {
    const form = document.getElementById('client-form');
    const tmp = readForm(form, data.id);
    updateResults(tmp);
  });
}

function readForm(form, id) {
  const fd = new FormData(form);
  const conditions = Array.from(form.querySelectorAll('input[name="conditions"]:checked')).map(el => el.value);
  return {
    id,
    name: fd.get('name') || '',
    birthdate: fd.get('birthdate') || '',
    sex: fd.get('sex') || 'female',
    height: parseFloat(fd.get('height')) || null,
    weight: parseFloat(fd.get('weight')) || null,
    pal: fd.get('pal') || 'moderate',
    lifestage: fd.get('lifestage') || 'normal',
    conditions,
    memo: fd.get('memo') || '',
  };
}

function saveForm(form, id) {
  const client = readForm(form, id);
  return saveClient(client);
}

function updateResults(client) {
  document.getElementById('results-panel').innerHTML = renderTargetsPanel(client);
  drawRadarChart(client);
}

function renderTargetsPanel(client) {
  const age = calcAge(client.birthdate);
  if (!age || !client.weight || !client.height) {
    return `<div class="card text-center py-8 text-slate-500">
      <p>生年月日・身長・体重を入力して「栄養量を計算」を押してください</p>
    </div>`;
  }

  const t = calcTargets({
    age, sex: client.sex, weight: client.weight, height: client.height,
    pal: client.pal, lifestage: client.lifestage, conditions: client.conditions || []
  });
  const bmiClass = classifyBMI(t.bmi);

  return `
    <!-- 基本指標 -->
    <div class="card">
      <h3 class="font-semibold text-slate-700 mb-4">基本指標</h3>
      <div class="grid grid-cols-3 gap-4 mb-4">
        ${metricBox('BMI', t.bmi, '', bmiClass.label, bmiClass.bg, bmiClass.color)}
        ${metricBox('標準体重', t.ibw, 'kg', '', 'bg-slate-50', 'text-slate-700')}
        ${metricBox('基礎代謝量', t.bmr, 'kcal/日', '', 'bg-slate-50', 'text-slate-700')}
      </div>
      <div class="bg-brand-50 rounded-xl p-4 text-center">
        <div class="text-sm text-brand-600 font-medium mb-1">推定エネルギー必要量 (EER)</div>
        <div class="text-3xl font-bold text-brand-700">${t.eer.toLocaleString()}</div>
        <div class="text-sm text-brand-500">kcal/日 · PAL: ${t.pal?.label || ''}</div>
      </div>
    </div>

    <!-- マクロ栄養素 -->
    <div class="card">
      <h3 class="font-semibold text-slate-700 mb-4">三大栄養素 目標範囲</h3>
      <div class="space-y-3">
        ${macroRow('たんぱく質', t.proteinEAR, t.protein, 'g', t.proteinDGmin, t.proteinDGmax, '#16a34a', t.proteinUpperCKD ? `⚠ CKD制限: ${t.proteinUpperCKD}g以下` : '')}
        ${macroRow('脂質',       null, null, 'g', t.fatDGmin, t.fatDGmax, '#0d9488', `飽和脂肪酸: ${t.satFatUL}g以下`)}
        ${macroRow('炭水化物',   null, null, 'g', t.carbDGmin, t.carbDGmax, '#f59e0b', '')}
        <div class="flex items-center justify-between py-2 border-t border-slate-100">
          <span class="text-sm font-medium text-slate-700">食物繊維</span>
          <span class="text-sm font-semibold text-slate-700">${t.fiber}g 以上/日</span>
        </div>
        <div class="flex items-center justify-between py-2 border-t border-slate-100">
          <span class="text-sm font-medium text-slate-700">食塩相当量</span>
          <span class="text-sm font-semibold text-red-600">${t.salt}g 未満/日</span>
        </div>
      </div>
    </div>

    <!-- ビタミン・ミネラル -->
    <div class="card">
      <h3 class="font-semibold text-slate-700 mb-4">ビタミン・ミネラル 推奨量</h3>
      <div id="radar-container" class="mb-4 flex justify-center">
        <canvas id="nutrient-radar" width="280" height="280"></canvas>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        ${microRow('カルシウム', t.calcium, 'mg')}
        ${microRow('鉄', t.iron, 'mg')}
        ${microRow('亜鉛', t.zinc, 'mg')}
        ${microRow('ビタミンA', t.vitA, 'μgRAE')}
        ${microRow('ビタミンD', t.vitD, 'μg (AI)')}
        ${microRow('ビタミンB1', t.vitB1, 'mg')}
        ${microRow('ビタミンB2', t.vitB2, 'mg')}
        ${microRow('ビタミンC', t.vitC, 'mg')}
        ${microRow('葉酸', t.folate, 'μg')}
        ${microRow('ビタミンB12', t.vitB12, 'μg')}
        ${microRow('カリウム (AI)', t.potassium, 'mg')}
        ${microRow('カリウム (目標)', t.potassiumDG, 'mg以上')}
      </div>
      ${t.hasMenses ? `<p class="text-xs text-rose-600 mt-3">※ 鉄は月経ありの値です。月経なしの場合は「月経なし」を疾患欄でチェックしてください。</p>` : ''}
      ${t.isPregnant ? `<p class="text-xs text-purple-600 mt-3">※ 妊娠中の付加量を加算しています。</p>` : ''}
      ${t.isLactating ? `<p class="text-xs text-blue-600 mt-3">※ 授乳期の付加量を加算しています。</p>` : ''}
    </div>

    <!-- Source note -->
    <div class="text-xs text-slate-400 px-1">
      根拠: 日本人の食事摂取基準2025年版 (厚生労働省)
    </div>
  `;
}

function renderEmptyResults() {
  return `<div class="card text-center py-12">
    <div class="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>
    <p class="text-slate-600 font-medium mb-2">左フォームを入力して</p>
    <p class="text-slate-400 text-sm">「栄養量を計算」または「保存する」を押すと<br>個別の栄養素目標が表示されます</p>
  </div>`;
}

function metricBox(label, value, unit, sub, bg, textColor) {
  return `<div class="${bg} rounded-xl p-3 text-center">
    <div class="text-xs text-slate-500 mb-1">${label}</div>
    <div class="text-xl font-bold ${textColor}">${value}${unit ? '<span class="text-sm font-normal ml-0.5">'+unit+'</span>' : ''}</div>
    ${sub ? `<div class="text-xs ${textColor} mt-0.5">${sub}</div>` : ''}
  </div>`;
}

function macroRow(label, ear, rda, unit, dgMin, dgMax, color, note) {
  return `<div class="py-2 border-b border-slate-50">
    <div class="flex items-center justify-between mb-1">
      <span class="text-sm font-medium text-slate-700">${label}</span>
      <div class="text-right">
        ${rda ? `<span class="text-sm font-semibold" style="color:${color}">推奨: ${rda}${unit}</span>` : ''}
        ${ear ? `<span class="text-xs text-slate-400 ml-1">(EAR: ${ear}${unit})</span>` : ''}
        <span class="text-xs text-slate-500 ml-2">目標: ${dgMin}〜${dgMax}${unit}</span>
      </div>
    </div>
    ${note ? `<p class="text-xs text-amber-600">${note}</p>` : ''}
  </div>`;
}

function microRow(label, value, unit) {
  return `<div class="flex items-center justify-between py-1.5 border-b border-slate-50">
    <span class="text-slate-600">${label}</span>
    <span class="font-semibold text-slate-800">${value} ${unit}</span>
  </div>`;
}

function drawRadarChart(client) {
  const age = calcAge(client.birthdate);
  if (!age || !client.weight || !client.height) return;
  const canvas = document.getElementById('nutrient-radar');
  if (!canvas) return;

  destroyChart();
  const t = calcTargets({
    age, sex: client.sex, weight: client.weight, height: client.height,
    pal: client.pal, lifestage: client.lifestage, conditions: client.conditions || []
  });

  const chart = new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Ca', 'Fe', 'Zn', 'VitA', 'VitD', 'B1', 'B2', 'VitC', '葉酸', 'B12'],
      datasets: [{
        label: '推奨量',
        data: [t.calcium/10, t.iron*10, t.zinc*10, t.vitA/10, t.vitD*10, t.vitB1*100, t.vitB2*100, t.vitC, t.folate/3, t.vitB12*50],
        backgroundColor: 'rgba(22,163,74,0.1)',
        borderColor: '#16a34a',
        pointBackgroundColor: '#16a34a',
        pointRadius: 3,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true,
          ticks: { display: false },
          grid: { color: '#e2e8f0' },
          pointLabels: { font: { size: 11 } }
        }
      }
    }
  });
  registerChart(chart);
}

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
