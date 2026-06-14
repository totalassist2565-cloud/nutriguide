import { calcTargets, calcAge, classifyBMI, PAL_LEVELS } from '../js/nutrition.js';
import { registerChart, destroyChart } from '../js/app.js';

const CONDITIONS_LIST = [
  { key: 'diabetes',     label: '糖尿病' },
  { key: 'hypertension', label: '高血圧' },
  { key: 'dyslipidemia', label: '脂質異常症' },
  { key: 'ckd_g3a',     label: 'CKD G3a' },
  { key: 'ckd_g3b',     label: 'CKD G3b' },
  { key: 'ckd_g4',      label: 'CKD G4' },
  { key: 'ckd_g5',      label: 'CKD G5' },
  { key: 'liver',       label: '肝疾患' },
  { key: 'hyperuricemia',label: '高尿酸血症' },
  { key: 'no_menses',   label: '月経なし（女性）' },
];

export function renderCalculator() {
  document.getElementById('page-content').innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <div class="card">
        <h3 class="font-semibold text-slate-700 mb-4">基本情報を入力</h3>
        <form id="calc-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">年齢 (歳)</label>
              <input class="input" id="age" type="number" min="1" max="120" placeholder="35">
            </div>
            <div>
              <label class="label">性別</label>
              <select class="input" id="sex">
                <option value="female">女性</option>
                <option value="male">男性</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">身長 (cm)</label>
              <input class="input" id="height" type="number" step="0.1" placeholder="160">
            </div>
            <div>
              <label class="label">体重 (kg)</label>
              <input class="input" id="weight" type="number" step="0.1" placeholder="55">
            </div>
          </div>
          <div>
            <label class="label">身体活動レベル</label>
            <select class="input" id="pal">
              ${Object.entries(PAL_LEVELS).map(([k,v]) => `<option value="${k}">${v.label} — ${v.desc}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">ライフステージ</label>
            <select class="input" id="lifestage">
              <option value="normal">通常</option>
              <option value="pregnant1">妊娠初期</option>
              <option value="pregnant2">妊娠中期</option>
              <option value="pregnant3">妊娠後期</option>
              <option value="lactating">授乳期</option>
            </select>
          </div>
          <div>
            <label class="label">疾患（複数選択可）</label>
            <div class="grid grid-cols-2 gap-1 mt-1">
              ${CONDITIONS_LIST.map(c => `
                <label class="flex items-center gap-2 cursor-pointer py-1">
                  <input type="checkbox" class="cond-check" value="${c.key}" class="rounded">
                  <span class="text-sm text-slate-700">${c.label}</span>
                </label>`).join('')}
            </div>
          </div>
          <button type="submit" class="btn-primary w-full">計算する</button>
        </form>
      </div>

      <div id="calc-results">
        <div class="card text-center py-12 text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <p>左の情報を入力して「計算する」を押してください</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('calc-form').addEventListener('submit', e => {
    e.preventDefault();
    const age = parseInt(document.getElementById('age').value);
    const sex = document.getElementById('sex').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const pal = document.getElementById('pal').value;
    const lifestage = document.getElementById('lifestage').value;
    const conditions = Array.from(document.querySelectorAll('.cond-check:checked')).map(el => el.value);

    if (!age || !height || !weight) { alert('年齢・身長・体重を入力してください'); return; }

    const t = calcTargets({ age, sex, height, weight, pal, lifestage, conditions });
    const bmiClass = classifyBMI(t.bmi);

    document.getElementById('calc-results').innerHTML = `
      <div class="space-y-4">
        <div class="card">
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="${bmiClass.bg} rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500 mb-1">BMI</div>
              <div class="text-xl font-bold ${bmiClass.color}">${t.bmi}</div>
              <div class="text-xs ${bmiClass.color}">${bmiClass.label}</div>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500 mb-1">標準体重</div>
              <div class="text-xl font-bold text-slate-700">${t.ibw}<span class="text-sm font-normal">kg</span></div>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500 mb-1">基礎代謝量</div>
              <div class="text-xl font-bold text-slate-700">${t.bmr.toLocaleString()}<span class="text-sm font-normal">kcal</span></div>
            </div>
          </div>
          <div class="bg-brand-50 rounded-xl p-4 text-center">
            <div class="text-sm text-brand-600 font-medium mb-1">推定エネルギー必要量</div>
            <div class="text-3xl font-bold text-brand-700">${t.eer.toLocaleString()} <span class="text-lg font-normal">kcal/日</span></div>
            <div class="text-xs text-brand-400 mt-1">PAL: ${t.pal?.label}</div>
          </div>
        </div>

        <div class="card">
          <h4 class="font-semibold text-slate-700 mb-3">三大栄養素 目標量</h4>
          ${pfc(t)}
        </div>

        <div class="card">
          <h4 class="font-semibold text-slate-700 mb-3">ビタミン・ミネラル</h4>
          <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            ${[
              ['カルシウム', t.calcium, 'mg'],
              ['鉄', t.iron, 'mg'],
              ['亜鉛', t.zinc, 'mg'],
              ['ビタミンA', t.vitA, 'μgRAE'],
              ['ビタミンD', t.vitD, 'μg'],
              ['ビタミンB1', t.vitB1, 'mg'],
              ['ビタミンB2', t.vitB2, 'mg'],
              ['ビタミンC', t.vitC, 'mg'],
              ['葉酸', t.folate, 'μg'],
              ['B12', t.vitB12, 'μg'],
              ['カリウム AI', t.potassium, 'mg'],
              ['食塩', t.salt + '未満', 'g'],
            ].map(([l,v,u]) => `<div class="flex justify-between py-1 border-b border-slate-50">
              <span class="text-slate-600">${l}</span>
              <span class="font-semibold text-slate-800">${v} ${u}</span>
            </div>`).join('')}
          </div>
          <p class="text-xs text-slate-400 mt-3">根拠: 日本人の食事摂取基準2025年版</p>
        </div>

        <button id="copy-calc" class="btn-secondary w-full">結果をコピー（Claudeに貼り付け用）</button>
      </div>
    `;

    document.getElementById('copy-calc').onclick = () => {
      const txt = `栄養量計算結果（食事摂取基準2025）
年齢${age}歳 ${sex==='male'?'男性':'女性'} ${height}cm ${weight}kg PAL:${pal}
EER: ${t.eer}kcal / BMR: ${t.bmr}kcal / BMI: ${t.bmi}(${bmiClass.label})
たんぱく質: ${t.protein}g / 脂質: ${t.fatDGmin}〜${t.fatDGmax}g / 炭水化物: ${t.carbDGmin}〜${t.carbDGmax}g
食物繊維: ${t.fiber}g以上 / 食塩: ${t.salt}g未満
カルシウム:${t.calcium}mg 鉄:${t.iron}mg 亜鉛:${t.zinc}mg
VitA:${t.vitA}μg VitD:${t.vitD}μg VitC:${t.vitC}mg 葉酸:${t.folate}μg`;
      navigator.clipboard.writeText(txt).then(() => alert('コピーしました！Claudeに貼り付けてください'));
    };
  });
}

function pfc(t) {
  return `<div class="space-y-3">
    ${pfcBar('たんぱく質', t.protein, t.proteinDGmin, t.proteinDGmax, 'g', '#16a34a')}
    ${pfcBar('脂質', null, t.fatDGmin, t.fatDGmax, 'g', '#0d9488')}
    ${pfcBar('炭水化物', null, t.carbDGmin, t.carbDGmax, 'g', '#f59e0b')}
    <div class="flex justify-between text-sm py-1">
      <span class="text-slate-600">食物繊維</span>
      <span class="font-semibold text-brand-600">${t.fiber}g 以上</span>
    </div>
    <div class="flex justify-between text-sm py-1">
      <span class="text-slate-600">食塩相当量</span>
      <span class="font-semibold text-red-600">${t.salt}g 未満</span>
    </div>
    ${t.proteinUpperCKD ? `<div class="bg-amber-50 rounded-lg p-2 text-sm text-amber-700">⚠ CKD制限: たんぱく質 ${t.proteinUpperCKD}g 以下</div>` : ''}
  </div>`;
}

function pfcBar(label, rda, min, max, unit, color) {
  return `<div>
    <div class="flex justify-between text-sm mb-1">
      <span class="text-slate-600">${label}</span>
      <span class="font-semibold text-slate-700">${rda ? rda+'g · ' : ''}目標 ${min}〜${max}${unit}</span>
    </div>
    <div class="nutrient-bar">
      <div class="nutrient-bar-fill" style="width:70%;background:${color}"></div>
    </div>
  </div>`;
}
