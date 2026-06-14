/**
 * 栄養計算エンジン
 * 根拠: 日本人の食事摂取基準2025年版 (厚生労働省)
 * https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/syokuji_kijyun.html
 */

// ─────────────────────────────────────────────
// 基礎代謝基準値 (kcal/kg体重/日) - 食摂基準2025 表1
// ─────────────────────────────────────────────
const BMR_BASE = {
  // [ageMin, ageMax, male, female]
  ranges: [
    [1,  2,  61.0, 59.7],
    [3,  5,  54.8, 52.2],
    [6,  7,  44.3, 41.9],
    [8,  9,  40.8, 38.3],
    [10, 11, 37.4, 34.8],
    [12, 14, 31.0, 29.6],
    [15, 17, 27.0, 25.3],
    [18, 29, 23.7, 22.1],
    [30, 49, 22.5, 21.9],
    [50, 64, 21.8, 20.7],
    [65, 74, 21.6, 20.7],
    [75, 999,21.5, 20.7],
  ]
};

// 身体活動レベル (PAL)
export const PAL_LEVELS = {
  low:      { label: '低い (Ⅰ)',    value: 1.50, desc: '生活の大部分が座位・静的な活動' },
  moderate: { label: 'ふつう (Ⅱ)', value: 1.75, desc: '座位中心だが通勤・家事・軽い運動含む' },
  high:     { label: '高い (Ⅲ)',    value: 2.00, desc: '移動や立ち仕事が多い、または運動習慣あり' },
};

// 疾患係数 (stress factor)
export const DISEASE_FACTORS = {
  none:         { label: 'なし',         factor: 1.0 },
  diabetes:     { label: '糖尿病',        factor: 1.0 },
  hypertension: { label: '高血圧',        factor: 1.0 },
  ckd_g3a:      { label: 'CKD G3a',      factor: 1.0 },
  ckd_g3b:      { label: 'CKD G3b',      factor: 1.0 },
  ckd_g4:       { label: 'CKD G4',       factor: 1.0 },
  ckd_g5:       { label: 'CKD G5',       factor: 1.0 },
  liver:        { label: '肝疾患',        factor: 1.0 },
  dyslipidemia: { label: '脂質異常症',    factor: 1.0 },
  hyperuricemia:{ label: '高尿酸血症',    factor: 1.0 },
  obesity:      { label: '肥満（減量中）', factor: 0.95 },
};

// ─────────────────────────────────────────────
// BMR・エネルギー計算
// ─────────────────────────────────────────────
export function getBMRBase(age, sex) {
  const row = BMR_BASE.ranges.find(r => age >= r[0] && age <= r[1]);
  if (!row) return sex === 'male' ? 21.5 : 20.7;
  return sex === 'male' ? row[2] : row[3];
}

export function calcBMR(age, sex, weight) {
  return getBMRBase(age, sex) * weight;
}

export function calcEER(age, sex, weight, palKey = 'moderate', lifestage = 'normal') {
  const bmr = calcBMR(age, sex, weight);
  const pal = PAL_LEVELS[palKey]?.value ?? 1.75;
  let eer = Math.round(bmr * pal);

  // ライフステージ付加量 (食摂基準2025)
  const additions = {
    pregnant1: 50,   // 妊娠初期
    pregnant2: 250,  // 妊娠中期
    pregnant3: 450,  // 妊娠後期
    lactating: 350,  // 授乳期
  };
  eer += additions[lifestage] ?? 0;
  return eer;
}

// ─────────────────────────────────────────────
// BMI・体重評価
// ─────────────────────────────────────────────
export function calcBMI(weight, height) {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function classifyBMI(bmi) {
  if (bmi < 18.5) return { label: '低体重', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (bmi < 25.0) return { label: '普通体重', color: 'text-brand-600', bg: 'bg-brand-50' };
  if (bmi < 30.0) return { label: '肥満(1度)', color: 'text-amber-600', bg: 'bg-amber-50' };
  if (bmi < 35.0) return { label: '肥満(2度)', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (bmi < 40.0) return { label: '肥満(3度)', color: 'text-red-600', bg: 'bg-red-50' };
  return { label: '肥満(4度)', color: 'text-red-800', bg: 'bg-red-100' };
}

export function calcIBW(height) {
  // 標準体重 = 身長(m)² × 22
  const h = height / 100;
  return Math.round(h * h * 22 * 10) / 10;
}

// ─────────────────────────────────────────────
// 栄養素目標量 (食事摂取基準2025)
// ─────────────────────────────────────────────

// たんぱく質 (g/日) - 推奨量
const PROTEIN_RDA = {
  // [ageMin, ageMax, male, female]
  ranges: [
    [1,  2,  20, 20],
    [3,  5,  25, 25],
    [6,  7,  30, 30],
    [8,  9,  40, 40],
    [10, 11, 45, 50],
    [12, 14, 60, 55],
    [15, 17, 65, 55],
    [18, 64, 65, 50],
    [65, 74, 60, 50],
    [75, 999,60, 50],
  ]
};

const PROTEIN_EAR = {
  ranges: [
    [1,  2,  15, 15],
    [3,  5,  20, 20],
    [6,  7,  25, 25],
    [8,  9,  35, 35],
    [10, 11, 40, 40],
    [12, 14, 50, 45],
    [15, 17, 50, 45],
    [18, 64, 50, 40],
    [65, 74, 50, 40],
    [75, 999,50, 40],
  ]
};

// カルシウム RDA (mg/日)
const CALCIUM_RDA = {
  ranges: [
    [1,  2,  450, 400],
    [3,  5,  600, 550],
    [6,  7,  600, 550],
    [8,  9,  650, 750],
    [10, 11, 700, 750],
    [12, 14, 1000, 800],
    [15, 17, 800, 650],
    [18, 29, 800, 650],
    [30, 74, 750, 650],
    [75, 999,700, 600],
  ]
};

// 鉄 RDA (mg/日)
const IRON_RDA = {
  ranges: [
    [1,  2,  4.5, 4.5],
    [3,  5,  5.5, 5.0],
    [6,  7,  5.5, 5.5],
    [8,  9,  7.0, 7.5],
    [10, 11, 8.5, 8.5],
    [12, 14, 10.0, 10.0],  // 月経あり
    [15, 17, 10.0, 8.5],
    [18, 49, 7.5, 10.5],   // 月経あり
    [50, 64, 7.5, 6.5],
    [65, 999,7.0, 6.0],
  ]
};

// 鉄 (月経なし女性)
const IRON_RDA_NO_MENSES = {
  ranges: [
    [18, 49, 7.5, 6.5],
    [50, 64, 7.5, 6.5],
    [65, 999,7.0, 6.0],
  ]
};

// 亜鉛 RDA (mg/日)
const ZINC_RDA = {
  ranges: [
    [1,  2,  3, 3],
    [3,  5,  4, 3],
    [6,  7,  5, 4],
    [8,  9,  6, 5],
    [10, 11, 7, 6],
    [12, 14, 9, 8],
    [15, 17, 10, 8],
    [18, 64, 11, 8],
    [65, 999,10, 8],
  ]
};

// ビタミンA RDA (μg RAE/日)
const VITA_RDA = {
  ranges: [
    [1,  2,  400, 350],
    [3,  5,  450, 500],
    [6,  7,  400, 400],
    [8,  9,  500, 500],
    [10, 11, 600, 600],
    [12, 14, 800, 700],
    [15, 17, 900, 650],
    [18, 29, 850, 650],
    [30, 64, 900, 700],
    [65, 74, 850, 700],
    [75, 999,800, 650],
  ]
};

// ビタミンD AI (μg/日) - 全年齢共通8.5μg (2025)
const VITD_AI = 8.5;
const VITD_UL = 100;

// ビタミンB1 RDA (mg/日)
const VITB1_RDA = {
  ranges: [
    [1,  2,  0.5, 0.5],
    [3,  5,  0.7, 0.7],
    [6,  7,  0.8, 0.8],
    [8,  9,  1.0, 0.9],
    [10, 11, 1.2, 1.1],
    [12, 14, 1.4, 1.3],
    [15, 17, 1.5, 1.2],
    [18, 29, 1.4, 1.1],
    [30, 49, 1.4, 1.1],
    [50, 64, 1.3, 1.1],
    [65, 74, 1.3, 1.1],
    [75, 999,1.2, 1.0],
  ]
};

// ビタミンB2 RDA (mg/日)
const VITB2_RDA = {
  ranges: [
    [1,  2,  0.6, 0.5],
    [3,  5,  0.8, 0.8],
    [6,  7,  0.9, 0.9],
    [8,  9,  1.1, 1.0],
    [10, 11, 1.4, 1.3],
    [12, 14, 1.6, 1.4],
    [15, 17, 1.7, 1.4],
    [18, 29, 1.6, 1.2],
    [30, 49, 1.5, 1.2],
    [50, 64, 1.5, 1.2],
    [65, 74, 1.5, 1.2],
    [75, 999,1.3, 1.0],
  ]
};

// ビタミンC RDA (mg/日)
const VITC_RDA = {
  ranges: [
    [1,  2,  35, 35],
    [3,  5,  40, 40],
    [6,  7,  55, 55],
    [8,  9,  60, 60],
    [10, 11, 75, 75],
    [12, 17, 95, 95],
    [18, 999,100, 100],
  ]
};

// 葉酸 RDA (μg/日)
const FOLATE_RDA = {
  ranges: [
    [1,  2,  90, 90],
    [3,  5,  100, 100],
    [6,  7,  130, 130],
    [8,  9,  150, 150],
    [10, 11, 180, 180],
    [12, 14, 220, 220],
    [15, 17, 250, 250],
    [18, 999,240, 240],
  ]
};

// ビタミンB12 RDA (μg/日)
const VITB12_RDA = {
  ranges: [
    [1,  2,  0.9, 0.9],
    [3,  5,  1.1, 1.1],
    [6,  7,  1.3, 1.3],
    [8,  9,  1.6, 1.6],
    [10, 11, 2.0, 2.0],
    [12, 14, 2.4, 2.4],
    [15, 999,2.4, 2.4],
  ]
};

// カリウム AI (mg/日)
const POTASSIUM_AI = {
  ranges: [
    [1,  2,  900, 900],
    [3,  5,  1100, 1000],
    [6,  7,  1300, 1200],
    [8,  9,  1600, 1500],
    [10, 11, 1900, 1800],
    [12, 14, 2400, 2200],
    [15, 17, 2800, 2100],
    [18, 64, 2500, 2000],
    [65, 999,2500, 2000],
  ]
};

// 食物繊維 目標量 (g/日)
const FIBER_DG = {
  ranges: [
    [3,  5,  8, 8],
    [6,  7,  10, 10],
    [8,  9,  11, 11],
    [10, 11, 13, 13],
    [12, 14, 17, 17],
    [15, 17, 19, 18],
    [18, 64, 21, 18],
    [65, 999,20, 17],
  ]
};

// 食塩 目標量 (g/日) 2025年版
const SALT_DG = {
  ranges: [
    [1,  2,  3.0, 3.0],
    [3,  5,  3.5, 3.5],
    [6,  7,  4.5, 4.5],
    [8,  9,  5.0, 5.0],
    [10, 11, 6.0, 6.0],
    [12, 14, 7.0, 6.5],
    [15, 17, 7.0, 6.5],
    [18, 999,7.0, 6.0],
  ]
};

// ─────────────────────────────────────────────
// ルックアップ関数
// ─────────────────────────────────────────────
function lookup(table, age, sex) {
  const row = table.ranges.find(r => age >= r[0] && age <= r[1]);
  if (!row) return null;
  return sex === 'male' ? row[2] : row[3];
}

// ─────────────────────────────────────────────
// メイン: 栄養素目標一括計算
// ─────────────────────────────────────────────
export function calcTargets(profile) {
  const { age, sex, weight, height, pal = 'moderate', lifestage = 'normal', conditions = [] } = profile;
  const isMale = sex === 'male';
  const hasMenses = sex === 'female' && age >= 12 && age <= 49 && !conditions.includes('no_menses');
  const isPregnant = ['pregnant1','pregnant2','pregnant3'].includes(lifestage);
  const isLactating = lifestage === 'lactating';

  const bmi = calcBMI(weight, height);
  const ibw = calcIBW(height);
  const bmr = calcBMR(age, sex, weight);
  const eer = calcEER(age, sex, weight, pal, lifestage);

  // たんぱく質
  let protein = lookup(PROTEIN_RDA, age, sex);
  let proteinEAR = lookup(PROTEIN_EAR, age, sex);
  // 妊娠・授乳付加
  if (lifestage === 'pregnant1') { protein += 0; proteinEAR += 0; }
  if (lifestage === 'pregnant2') { protein += 5; proteinEAR += 5; }
  if (lifestage === 'pregnant3') { protein += 25; proteinEAR += 20; }
  if (isLactating) { protein += 20; proteinEAR += 15; }
  // DG範囲 (13-20% of EER for adults; 15-20% for 65+)
  const proteinDGmin = Math.round(eer * (age >= 65 ? 0.15 : 0.13) / 4);
  const proteinDGmax = Math.round(eer * 0.20 / 4);

  // 脂質
  const fatDGmin = Math.round(eer * 0.20 / 9);
  const fatDGmax = Math.round(eer * 0.30 / 9);
  const satFatUL = Math.round(eer * 0.07 / 9);

  // 炭水化物
  const carbDGmin = Math.round(eer * 0.50 / 4);
  const carbDGmax = Math.round(eer * 0.65 / 4);

  // 微量栄養素
  let calcium = lookup(CALCIUM_RDA, age, sex);
  if (isPregnant) calcium += 0; // 付加なし (2025)
  if (isLactating) calcium += 0;

  let iron = hasMenses ? lookup(IRON_RDA, age, sex) : lookup(IRON_RDA_NO_MENSES, age, sex) ?? lookup(IRON_RDA, age, sex);
  if (lifestage === 'pregnant1') iron = 8.5;
  if (['pregnant2','pregnant3'].includes(lifestage)) iron = 16.0;
  if (isLactating) iron = 9.0;

  let zinc = lookup(ZINC_RDA, age, sex);
  if (isPregnant) zinc += 2;
  if (isLactating) zinc += 4;

  let vitA = lookup(VITA_RDA, age, sex);
  if (isPregnant) vitA += 80;
  if (isLactating) vitA += 450;

  let vitD = VITD_AI;
  let vitB1 = lookup(VITB1_RDA, age, sex);
  if (isPregnant) vitB1 += 0.2;
  if (isLactating) vitB1 += 0.2;

  let vitB2 = lookup(VITB2_RDA, age, sex);
  if (isPregnant) vitB2 += 0.3;
  if (isLactating) vitB2 += 0.6;

  let vitC = lookup(VITC_RDA, age, sex);
  if (isPregnant) vitC += 10;
  if (isLactating) vitC += 45;

  let folate = lookup(FOLATE_RDA, age, sex);
  if (isPregnant) folate += 240; // (+サプリ形態400μgとは別)
  if (isLactating) folate += 100;

  let vitB12 = lookup(VITB12_RDA, age, sex);
  if (isPregnant) vitB12 += 0.4;
  if (isLactating) vitB12 += 0.8;

  const potassium = lookup(POTASSIUM_AI, age, sex);
  // カリウム目標量 (DG)
  const potassiumDG = isMale ? 3000 : 2600;

  const fiber = lookup(FIBER_DG, age, sex) ?? 18;

  // 食塩 疾患別目標
  let salt = lookup(SALT_DG, age, sex);
  if (conditions.includes('hypertension') || conditions.includes('ckd_g3a') || conditions.includes('ckd_g3b') || conditions.includes('ckd_g4') || conditions.includes('ckd_g5')) {
    salt = 6.0; // 高血圧・CKDは6g未満
  }

  // CKD たんぱく質制限
  let proteinUpperCKD = null;
  if (conditions.includes('ckd_g3a')) proteinUpperCKD = Math.round(weight * 1.3);
  if (conditions.includes('ckd_g3b')) proteinUpperCKD = Math.round(weight * 1.0);
  if (conditions.includes('ckd_g4')) proteinUpperCKD = Math.round(weight * 0.8);
  if (conditions.includes('ckd_g5')) proteinUpperCKD = Math.round(weight * 0.6);

  return {
    bmi, ibw, bmr: Math.round(bmr), eer,
    protein, proteinEAR, proteinDGmin, proteinDGmax, proteinUpperCKD,
    fatDGmin, fatDGmax, satFatUL,
    carbDGmin, carbDGmax,
    calcium, iron, zinc,
    vitA, vitD, vitB1: Math.round(vitB1 * 10) / 10, vitB2: Math.round(vitB2 * 10) / 10, vitC, folate, vitB12: Math.round(vitB12 * 10) / 10,
    potassium, potassiumDG, fiber, salt,
    vitD_UL: VITD_UL,
    // 付加情報
    hasMenses, isPregnant, isLactating,
    pal: PAL_LEVELS[pal],
  };
}

// ─────────────────────────────────────────────
// 食事記録から栄養素合計を計算
// ─────────────────────────────────────────────
export function sumMealNutrition(items) {
  const zero = {
    energy:0, protein:0, fat:0, satFat:0, carb:0, fiber:0, sugar:0,
    salt:0, potassium:0, calcium:0, iron:0, zinc:0,
    vitA:0, vitD:0, vitB1:0, vitB2:0, vitB6:0, vitB12:0, vitC:0, folate:0, niacin:0,
  };
  return items.reduce((acc, item) => {
    const r = item.ratio ?? 1;
    Object.keys(zero).forEach(k => { acc[k] = Math.round(((acc[k] || 0) + (item[k] || 0) * r) * 100) / 100; });
    return acc;
  }, { ...zero });
}

// 達成率計算 (0-999%)
export function calcAchievement(intake, target) {
  if (!target || target <= 0) return null;
  return Math.round((intake / target) * 100);
}

// 達成率の色分け (lower-is-better = 食塩など)
export function rateColor(pct, lowerIsBetter = false) {
  if (pct === null) return 'text-slate-400';
  if (lowerIsBetter) {
    if (pct <= 100) return 'text-brand-600';
    if (pct <= 120) return 'text-amber-600';
    return 'text-red-600';
  }
  if (pct >= 100) return 'text-brand-600';
  if (pct >= 75)  return 'text-amber-600';
  return 'text-red-600';
}

export function rateBarColor(pct, lowerIsBetter = false) {
  if (lowerIsBetter) {
    if (pct <= 100) return '#16a34a';
    if (pct <= 120) return '#d97706';
    return '#dc2626';
  }
  if (pct >= 100) return '#16a34a';
  if (pct >= 75)  return '#d97706';
  return '#dc2626';
}

// ─────────────────────────────────────────────
// 年齢計算
// ─────────────────────────────────────────────
export function calcAge(birthdate) {
  if (!birthdate) return null;
  const today = new Date();
  const bd = new Date(birthdate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

// ─────────────────────────────────────────────
// Claudeへのプロンプト生成
// ─────────────────────────────────────────────
export function buildClaudePrompt(client, targets, meals, obsidianNotes = '') {
  const age = calcAge(client.birthdate);
  const bmiClass = classifyBMI(targets.bmi);

  const mealSection = meals.length > 0
    ? meals.slice(0, 7).map(m => {
        const items = m.items.map(i => `  - ${i.name} ${i.amount}g`).join('\n');
        return `【${m.date} ${m.mealType}】\n${items || m.freeText || '(記録なし)'}`;
      }).join('\n\n')
    : '（食事記録なし）';

  return `# クライアント栄養評価依頼

## クライアント基本情報
- 年齢: ${age}歳 / 性別: ${client.sex === 'male' ? '男性' : '女性'}
- 身長: ${client.height}cm / 体重: ${client.weight}kg
- BMI: ${targets.bmi} (${bmiClass.label})
- 標準体重: ${targets.ibw}kg
- 身体活動レベル: ${targets.pal?.label ?? ''}
- ライフステージ: ${client.lifestage ?? '通常'}
- 疾患・特記事項: ${client.conditions?.join(', ') || 'なし'}

## エネルギー・栄養素目標 (食事摂取基準2025)
- 推定エネルギー必要量: ${targets.eer} kcal/日
- たんぱく質: ${targets.proteinEAR}〜${targets.protein}g/日 (DG: ${targets.proteinDGmin}〜${targets.proteinDGmax}g)
- 脂質: ${targets.fatDGmin}〜${targets.fatDGmax}g/日
- 炭水化物: ${targets.carbDGmin}〜${targets.carbDGmax}g/日
- 食物繊維: ${targets.fiber}g以上
- カルシウム: ${targets.calcium}mg / 鉄: ${targets.iron}mg / 亜鉛: ${targets.zinc}mg
- ビタミンA: ${targets.vitA}μgRAE / D: ${targets.vitD}μg / B1: ${targets.vitB1}mg / B2: ${targets.vitB2}mg
- ビタミンC: ${targets.vitC}mg / 葉酸: ${targets.folate}μg / B12: ${targets.vitB12}μg
- 食塩相当量: ${targets.salt}g未満

## 直近の食事記録
${mealSection}

${obsidianNotes ? `## 関連する知識・ノート\n${obsidianNotes}\n` : ''}
## 依頼事項
上記の情報を踏まえ、以下を日本語で回答してください。
1. 食事内容の栄養バランス評価（不足・過剰な栄養素）
2. 疾患・状態に応じた具体的な改善提案
3. クライアントへの声かけ例（共感的・前向きなトーン）
4. 注意点・禁忌事項

※ 科学的根拠がある場合はPubMed等のURLまたはDOIを記載してください。
※ 根拠が不明確な内容は「エビデンスは限定的」と明記してください。`;
}
