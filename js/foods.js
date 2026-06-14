/**
 * 食品データベース
 * 出典: 日本食品標準成分表（文部科学省）
 * 数値は可食部100gあたり
 * フィールド: id, name, category, energy(kcal), protein(g), fat(g), satFat(g),
 *   carb(g), fiber(g), sugar(g), salt(g), potassium(mg), calcium(mg), iron(mg),
 *   zinc(mg), vitA(μgRAE), vitD(μg), vitB1(mg), vitB2(mg), vitB6(mg),
 *   vitB12(μg), vitC(mg), folate(μg), niacin(mg)
 */

export const FOOD_CATEGORIES = {
  grains:     '穀類',
  potato:     'いも・でんぷん類',
  legume:     '豆類・大豆製品',
  vegetable:  '野菜類',
  mushroom:   'きのこ類',
  seaweed:    '藻類',
  fruit:      '果実類',
  fish:       '魚介類',
  meat:       '肉類',
  egg:        '卵類',
  dairy:      '乳類',
  fat:        '油脂類',
  sweet:      '菓子・嗜好品',
  beverage:   '飲料類',
  seasoning:  '調味料・香辛料',
  processed:  '加工食品',
};

export const FOODS = [
  // ─── 穀類 ───
  { id:'f001', name:'精白米（炊飯）',    category:'grains',    energy:156, protein:2.5, fat:0.3, satFat:0.1, carb:37.1, fiber:0.3, sugar:0.1, salt:0.0, potassium:29, calcium:3, iron:0.1, zinc:0.6, vitA:0, vitD:0, vitB1:0.02, vitB2:0.01, vitB6:0.02, vitB12:0, vitC:0, folate:3, niacin:0.2 },
  { id:'f002', name:'玄米（炊飯）',       category:'grains',    energy:152, protein:2.8, fat:1.0, satFat:0.2, carb:35.6, fiber:1.4, sugar:0.2, salt:0.0, potassium:95, calcium:7, iron:0.6, zinc:0.8, vitA:0, vitD:0, vitB1:0.16, vitB2:0.02, vitB6:0.21, vitB12:0, vitC:0, folate:10, niacin:2.9 },
  { id:'f003', name:'食パン（市販）',     category:'grains',    energy:248, protein:8.9, fat:4.1, satFat:2.0, carb:46.7, fiber:2.3, sugar:4.4, salt:1.2, potassium:86, calcium:22, iron:0.5, zinc:0.6, vitA:0, vitD:0, vitB1:0.07, vitB2:0.05, vitB6:0.03, vitB12:0, vitC:0, folate:27, niacin:0.9 },
  { id:'f004', name:'うどん（ゆで）',     category:'grains',    energy:95,  protein:2.6, fat:0.4, satFat:0.1, carb:21.6, fiber:0.8, sugar:0.3, salt:0.3, potassium:9, calcium:6, iron:0.2, zinc:0.2, vitA:0, vitD:0, vitB1:0.02, vitB2:0.01, vitB6:0.01, vitB12:0, vitC:0, folate:5, niacin:0.4 },
  { id:'f005', name:'そば（ゆで）',       category:'grains',    energy:130, protein:4.8, fat:1.0, satFat:0.2, carb:26.0, fiber:2.0, sugar:0.5, salt:0.0, potassium:34, calcium:9, iron:0.8, zinc:0.4, vitA:0, vitD:0, vitB1:0.05, vitB2:0.03, vitB6:0.05, vitB12:0, vitC:0, folate:13, niacin:1.1 },
  { id:'f006', name:'スパゲッティ（ゆで）',category:'grains',   energy:149, protein:5.8, fat:0.9, satFat:0.2, carb:30.3, fiber:1.5, sugar:1.2, salt:0.0, potassium:14, calcium:7, iron:0.7, zinc:0.5, vitA:0, vitD:0, vitB1:0.02, vitB2:0.01, vitB6:0.04, vitB12:0, vitC:0, folate:5, niacin:1.2 },
  { id:'f007', name:'オートミール',       category:'grains',    energy:380, protein:13.7,fat:5.7, satFat:1.1, carb:69.1, fiber:9.4, sugar:0, salt:0.0, potassium:260, calcium:47, iron:3.9, zinc:2.1, vitA:0, vitD:0, vitB1:0.20, vitB2:0.08, vitB6:0.11, vitB12:0, vitC:0, folate:30, niacin:1.0 },

  // ─── いも類 ───
  { id:'f010', name:'じゃがいも（蒸し）', category:'potato',    energy:76,  protein:1.9, fat:0.1, satFat:0.0, carb:17.9, fiber:1.6, sugar:1.4, salt:0.0, potassium:420, calcium:3, iron:0.4, zinc:0.3, vitA:0, vitD:0, vitB1:0.09, vitB2:0.03, vitB6:0.22, vitB12:0, vitC:28, folate:18, niacin:1.3 },
  { id:'f011', name:'さつまいも（蒸し）', category:'potato',    energy:131, protein:1.2, fat:0.2, satFat:0.1, carb:31.9, fiber:2.2, sugar:13.0,salt:0.0, potassium:480, calcium:40, iron:0.7, zinc:0.3, vitA:1, vitD:0, vitB1:0.12, vitB2:0.04, vitB6:0.29, vitB12:0, vitC:29, folate:47, niacin:1.0 },

  // ─── 豆類・大豆製品 ───
  { id:'f020', name:'木綿豆腐',           category:'legume',    energy:73,  protein:6.6, fat:4.2, satFat:0.6, carb:1.6,  fiber:0.4, sugar:0.1, salt:0.0, potassium:150, calcium:93, iron:1.5, zinc:0.7, vitA:0, vitD:0, vitB1:0.09, vitB2:0.04, vitB6:0.06, vitB12:0, vitC:0, folate:12, niacin:0.2 },
  { id:'f021', name:'絹ごし豆腐',         category:'legume',    energy:56,  protein:5.3, fat:3.5, satFat:0.5, carb:2.0,  fiber:0.3, sugar:0.4, salt:0.0, potassium:150, calcium:75, iron:1.2, zinc:0.5, vitA:0, vitD:0, vitB1:0.10, vitB2:0.04, vitB6:0.06, vitB12:0, vitC:0, folate:14, niacin:0.2 },
  { id:'f022', name:'納豆（糸引き）',     category:'legume',    energy:184, protein:16.5,fat:10.0,satFat:1.5, carb:12.1, fiber:6.7, sugar:2.6, salt:0.0, potassium:660, calcium:90, iron:3.3, zinc:1.9, vitA:0, vitD:0, vitB1:0.07, vitB2:0.56, vitB6:0.24, vitB12:0.1, vitC:0, folate:120, niacin:1.1 },
  { id:'f023', name:'豆乳（無調整）',     category:'legume',    energy:44,  protein:3.6, fat:2.0, satFat:0.3, carb:3.1,  fiber:0.2, sugar:2.9, salt:0.0, potassium:190, calcium:15, iron:1.2, zinc:0.3, vitA:0, vitD:0, vitB1:0.06, vitB2:0.02, vitB6:0.06, vitB12:0, vitC:0, folate:22, niacin:0.2 },
  { id:'f024', name:'枝豆（冷凍解凍）',   category:'legume',    energy:118, protein:11.5,fat:6.1, satFat:0.7, carb:8.8,  fiber:4.6, sugar:1.4, salt:0.0, potassium:590, calcium:76, iron:2.5, zinc:1.4, vitA:30, vitD:0, vitB1:0.24, vitB2:0.13, vitB6:0.10, vitB12:0, vitC:15, folate:260, niacin:1.6 },
  { id:'f025', name:'レンズ豆（乾燥）',   category:'legume',    energy:340, protein:23.2,fat:1.5, satFat:0.2, carb:60.2, fiber:16.0,sugar:2.3, salt:0.0, potassium:840, calcium:55, iron:9.0, zinc:4.8, vitA:1, vitD:0, vitB1:0.55, vitB2:0.21, vitB6:0.56, vitB12:0, vitC:5, folate:230, niacin:2.5 },
  { id:'f026', name:'油揚げ',             category:'legume',    energy:377, protein:15.3,fat:34.4,satFat:4.9, carb:0.4,  fiber:1.3, sugar:0, salt:0.0, potassium:89, calcium:240, iron:3.2, zinc:1.3, vitA:0, vitD:0, vitB1:0.06, vitB2:0.03, vitB6:0.04, vitB12:0, vitC:0, folate:22, niacin:0.1 },

  // ─── 野菜類 ───
  { id:'f030', name:'キャベツ（生）',     category:'vegetable', energy:23,  protein:1.3, fat:0.2, satFat:0.0, carb:5.2,  fiber:1.8, sugar:3.4, salt:0.0, potassium:200, calcium:43, iron:0.3, zinc:0.2, vitA:4, vitD:0, vitB1:0.04, vitB2:0.03, vitB6:0.10, vitB12:0, vitC:41, folate:78, niacin:0.2 },
  { id:'f031', name:'ほうれん草（茹で）', category:'vegetable', energy:25,  protein:2.6, fat:0.5, satFat:0.1, carb:4.0,  fiber:3.6, sugar:0.4, salt:0.0, potassium:490, calcium:69, iron:0.9, zinc:0.7, vitA:450, vitD:0, vitB1:0.05, vitB2:0.11, vitB6:0.08, vitB12:0, vitC:19, folate:110, niacin:0.5 },
  { id:'f032', name:'小松菜（茹で）',     category:'vegetable', energy:14,  protein:1.5, fat:0.2, satFat:0.0, carb:2.4,  fiber:2.4, sugar:0.4, salt:0.0, potassium:140, calcium:150, iron:2.1, zinc:0.2, vitA:250, vitD:0, vitB1:0.05, vitB2:0.09, vitB6:0.09, vitB12:0, vitC:21, folate:68, niacin:0.5 },
  { id:'f033', name:'ブロッコリー（茹で）',category:'vegetable',energy:33,  protein:3.5, fat:0.4, satFat:0.1, carb:6.4,  fiber:3.7, sugar:0.9, salt:0.0, potassium:210, calcium:38, iron:0.9, zinc:0.6, vitA:75, vitD:0, vitB1:0.06, vitB2:0.09, vitB6:0.17, vitB12:0, vitC:55, folate:120, niacin:0.8 },
  { id:'f034', name:'にんじん（茹で）',   category:'vegetable', energy:36,  protein:0.7, fat:0.1, satFat:0.0, carb:9.3,  fiber:2.8, sugar:5.6, salt:0.1, potassium:240, calcium:34, iron:0.3, zinc:0.2, vitA:680, vitD:0, vitB1:0.04, vitB2:0.04, vitB6:0.08, vitB12:0, vitC:2, folate:21, niacin:0.6 },
  { id:'f035', name:'玉ねぎ（生）',       category:'vegetable', energy:33,  protein:1.0, fat:0.1, satFat:0.0, carb:8.4,  fiber:1.5, sugar:6.6, salt:0.0, potassium:150, calcium:17, iron:0.2, zinc:0.2, vitA:0, vitD:0, vitB1:0.03, vitB2:0.01, vitB6:0.14, vitB12:0, vitC:8, folate:15, niacin:0.1 },
  { id:'f036', name:'トマト（生）',       category:'vegetable', energy:20,  protein:0.7, fat:0.1, satFat:0.0, carb:4.7,  fiber:1.0, sugar:3.7, salt:0.0, potassium:210, calcium:7, iron:0.2, zinc:0.1, vitA:45, vitD:0, vitB1:0.05, vitB2:0.02, vitB6:0.08, vitB12:0, vitC:15, folate:22, niacin:0.7 },
  { id:'f037', name:'なす（焼き）',       category:'vegetable', energy:31,  protein:1.3, fat:0.2, satFat:0.0, carb:7.5,  fiber:2.9, sugar:3.0, salt:0.0, potassium:220, calcium:15, iron:0.5, zinc:0.2, vitA:6, vitD:0, vitB1:0.05, vitB2:0.05, vitB6:0.08, vitB12:0, vitC:5, folate:28, niacin:0.7 },
  { id:'f038', name:'きゅうり（生）',     category:'vegetable', energy:14,  protein:1.0, fat:0.1, satFat:0.0, carb:3.0,  fiber:1.1, sugar:1.9, salt:0.0, potassium:200, calcium:26, iron:0.3, zinc:0.2, vitA:28, vitD:0, vitB1:0.03, vitB2:0.03, vitB6:0.05, vitB12:0, vitC:14, folate:25, niacin:0.2 },
  { id:'f039', name:'ごぼう（茹で）',     category:'vegetable', energy:58,  protein:1.5, fat:0.2, satFat:0.0, carb:15.7, fiber:6.1, sugar:1.3, salt:0.0, potassium:210, calcium:46, iron:0.7, zinc:0.5, vitA:0, vitD:0, vitB1:0.03, vitB2:0.03, vitB6:0.07, vitB12:0, vitC:2, folate:68, niacin:0.5 },
  { id:'f040', name:'れんこん（茹で）',   category:'vegetable', energy:66,  protein:1.9, fat:0.1, satFat:0.0, carb:16.1, fiber:2.4, sugar:0.5, salt:0.0, potassium:240, calcium:26, iron:0.7, zinc:0.3, vitA:0, vitD:0, vitB1:0.08, vitB2:0.01, vitB6:0.09, vitB12:0, vitC:30, folate:14, niacin:0.5 },
  { id:'f041', name:'もやし（茹で）',     category:'vegetable', energy:15,  protein:1.6, fat:0.1, satFat:0.0, carb:2.8,  fiber:1.4, sugar:1.0, salt:0.0, potassium:51, calcium:8, iron:0.3, zinc:0.3, vitA:0, vitD:0, vitB1:0.04, vitB2:0.04, vitB6:0.04, vitB12:0, vitC:5, folate:55, niacin:0.4 },
  { id:'f042', name:'かぼちゃ（蒸し）',   category:'vegetable', energy:91,  protein:1.6, fat:0.3, satFat:0.1, carb:23.1, fiber:3.5, sugar:8.1, salt:0.0, potassium:380, calcium:15, iron:0.5, zinc:0.2, vitA:290, vitD:0, vitB1:0.07, vitB2:0.06, vitB6:0.18, vitB12:0, vitC:32, folate:42, niacin:1.2 },
  { id:'f043', name:'アスパラガス（茹で）',category:'vegetable',energy:22,  protein:2.6, fat:0.2, satFat:0.0, carb:3.5,  fiber:1.8, sugar:1.2, salt:0.0, potassium:230, calcium:23, iron:0.7, zinc:0.5, vitA:38, vitD:0, vitB1:0.14, vitB2:0.10, vitB6:0.07, vitB12:0, vitC:13, folate:160, niacin:1.2 },
  { id:'f044', name:'セロリ（生）',       category:'vegetable', energy:15,  protein:0.4, fat:0.1, satFat:0.0, carb:3.6,  fiber:1.5, sugar:2.1, salt:0.1, potassium:410, calcium:39, iron:0.2, zinc:0.2, vitA:4, vitD:0, vitB1:0.03, vitB2:0.03, vitB6:0.08, vitB12:0, vitC:7, folate:22, niacin:0.3 },
  { id:'f045', name:'パプリカ（赤・生）', category:'vegetable', energy:30,  protein:1.0, fat:0.2, satFat:0.0, carb:7.2,  fiber:1.6, sugar:5.6, salt:0.0, potassium:210, calcium:7, iron:0.4, zinc:0.2, vitA:88, vitD:0, vitB1:0.06, vitB2:0.14, vitB6:0.37, vitB12:0, vitC:170, folate:68, niacin:1.2 },

  // ─── きのこ類 ───
  { id:'f050', name:'しいたけ（茹で）',   category:'mushroom',  energy:22,  protein:2.0, fat:0.3, satFat:0.1, carb:7.0,  fiber:4.4, sugar:1.0, salt:0.0, potassium:240, calcium:3, iron:0.4, zinc:0.7, vitA:0, vitD:1.7, vitB1:0.08, vitB2:0.20, vitB6:0.12, vitB12:0, vitC:7, folate:44, niacin:3.8 },
  { id:'f051', name:'えのき（茹で）',     category:'mushroom',  energy:34,  protein:2.7, fat:0.2, satFat:0.1, carb:9.0,  fiber:3.5, sugar:0.5, salt:0.0, potassium:340, calcium:1, iron:1.1, zinc:0.7, vitA:0, vitD:0.6, vitB1:0.24, vitB2:0.17, vitB6:0.09, vitB12:0, vitC:0, folate:55, niacin:7.4 },
  { id:'f052', name:'しめじ（茹で）',     category:'mushroom',  energy:18,  protein:2.0, fat:0.3, satFat:0.1, carb:4.2,  fiber:3.5, sugar:0.6, salt:0.0, potassium:310, calcium:1, iron:0.3, zinc:0.5, vitA:0, vitD:0.4, vitB1:0.11, vitB2:0.20, vitB6:0.07, vitB12:0, vitC:0, folate:30, niacin:5.5 },

  // ─── 藻類 ───
  { id:'f055', name:'わかめ（塩蔵・塩抜き）',category:'seaweed',energy:15, protein:1.9, fat:0.2, satFat:0.1, carb:2.0,  fiber:3.6, sugar:0.3, salt:1.5, potassium:260, calcium:78, iron:0.6, zinc:0.3, vitA:39, vitD:0, vitB1:0.04, vitB2:0.08, vitB6:0.02, vitB12:0, vitC:15, folate:49, niacin:1.2 },
  { id:'f056', name:'ひじき（乾燥）',     category:'seaweed',   energy:180, protein:10.6,fat:1.5, satFat:0.4, carb:58.4, fiber:51.8,sugar:0.1, salt:1.2, potassium:4400, calcium:1000,iron:6.2,zinc:1.0, vitA:360, vitD:0, vitB1:0.09, vitB2:0.42, vitB6:0.25, vitB12:0, vitC:0, folate:93, niacin:1.8 },
  { id:'f057', name:'めかぶ（生）',       category:'seaweed',   energy:14,  protein:0.9, fat:0.6, satFat:0.2, carb:3.4,  fiber:3.4, sugar:0.1, salt:0.9, potassium:170, calcium:50, iron:0.6, zinc:0.2, vitA:26, vitD:0, vitB1:0.02, vitB2:0.07, vitB6:0.02, vitB12:0, vitC:0, folate:17, niacin:0.3 },

  // ─── 果実類 ───
  { id:'f060', name:'バナナ（生）',       category:'fruit',     energy:93,  protein:1.1, fat:0.2, satFat:0.1, carb:22.5, fiber:1.1, sugar:15.5,salt:0.0, potassium:360, calcium:6, iron:0.3, zinc:0.2, vitA:3, vitD:0, vitB1:0.05, vitB2:0.04, vitB6:0.38, vitB12:0, vitC:16, folate:26, niacin:0.7 },
  { id:'f061', name:'みかん（生）',       category:'fruit',     energy:49,  protein:0.7, fat:0.1, satFat:0.0, carb:12.0, fiber:1.0, sugar:10.3,salt:0.0, potassium:150, calcium:17, iron:0.2, zinc:0.1, vitA:84, vitD:0, vitB1:0.10, vitB2:0.03, vitB6:0.06, vitB12:0, vitC:35, folate:22, niacin:0.3 },
  { id:'f062', name:'りんご（生・皮なし）',category:'fruit',    energy:57,  protein:0.2, fat:0.1, satFat:0.0, carb:15.5, fiber:1.4, sugar:13.1,salt:0.0, potassium:120, calcium:4, iron:0.1, zinc:0.0, vitA:1, vitD:0, vitB1:0.02, vitB2:0.01, vitB6:0.04, vitB12:0, vitC:4, folate:2, niacin:0.1 },
  { id:'f063', name:'いちご（生）',       category:'fruit',     energy:31,  protein:0.9, fat:0.1, satFat:0.0, carb:8.5,  fiber:1.4, sugar:6.1, salt:0.0, potassium:170, calcium:17, iron:0.3, zinc:0.2, vitA:1, vitD:0, vitB1:0.03, vitB2:0.05, vitB6:0.05, vitB12:0, vitC:62, folate:90, niacin:0.4 },
  { id:'f064', name:'ブルーベリー（生）', category:'fruit',     energy:49,  protein:0.5, fat:0.1, satFat:0.0, carb:13.0, fiber:3.3, sugar:9.6, salt:0.0, potassium:70, calcium:8, iron:0.2, zinc:0.1, vitA:5, vitD:0, vitB1:0.03, vitB2:0.03, vitB6:0.05, vitB12:0, vitC:9, folate:12, niacin:0.3 },
  { id:'f065', name:'アボカド（生）',     category:'fruit',     energy:178, protein:2.1, fat:17.5,satFat:2.5, carb:7.9,  fiber:5.6, sugar:0.8, salt:0.0, potassium:590, calcium:8, iron:0.6, zinc:0.7, vitA:6, vitD:0, vitB1:0.10, vitB2:0.21, vitB6:0.32, vitB12:0, vitC:12, folate:83, niacin:2.0 },
  { id:'f066', name:'キウイフルーツ（生）',category:'fruit',    energy:51,  protein:1.0, fat:0.2, satFat:0.0, carb:13.2, fiber:2.6, sugar:10.2,salt:0.0, potassium:290, calcium:25, iron:0.3, zinc:0.1, vitA:3, vitD:0, vitB1:0.01, vitB2:0.02, vitB6:0.12, vitB12:0, vitC:71, folate:36, niacin:0.3 },

  // ─── 魚介類 ───
  { id:'f070', name:'さけ（生）',         category:'fish',      energy:133, protein:22.3,fat:4.1, satFat:1.0, carb:0.1,  fiber:0, sugar:0.1, salt:0.2, potassium:350, calcium:14, iron:0.5, zinc:0.7, vitA:11, vitD:32.0, vitB1:0.26, vitB2:0.11, vitB6:0.64, vitB12:5.2, vitC:1, folate:16, niacin:7.4 },
  { id:'f071', name:'さば（生）',         category:'fish',      energy:211, protein:20.6,fat:16.8,satFat:4.2, carb:0.3,  fiber:0, sugar:0.1, salt:0.3, potassium:330, calcium:6, iron:1.2, zinc:1.1, vitA:37, vitD:4.0, vitB1:0.21, vitB2:0.31, vitB6:0.51, vitB12:12.0,vitC:1, folate:13, niacin:11.5 },
  { id:'f072', name:'まぐろ（赤身・生）', category:'fish',      energy:115, protein:26.4,fat:1.0, satFat:0.3, carb:0.1,  fiber:0, sugar:0.1, salt:0.1, potassium:380, calcium:5, iron:1.1, zinc:0.9, vitA:5, vitD:5.0, vitB1:0.10, vitB2:0.09, vitB6:0.85, vitB12:1.3, vitC:2, folate:8, niacin:14.2 },
  { id:'f073', name:'さんま（生）',       category:'fish',      energy:287, protein:17.6,fat:25.6,satFat:5.7, carb:0.1,  fiber:0, sugar:0.1, salt:0.2, potassium:200, calcium:26, iron:1.4, zinc:1.1, vitA:13, vitD:15.7, vitB1:0.01, vitB2:0.26, vitB6:0.40, vitB12:16.0,vitC:0, folate:15, niacin:7.0 },
  { id:'f074', name:'あじ（生）',         category:'fish',      energy:112, protein:20.7,fat:4.5, satFat:1.3, carb:0.1,  fiber:0, sugar:0.1, salt:0.4, potassium:370, calcium:66, iron:0.6, zinc:1.1, vitA:7, vitD:8.9, vitB1:0.10, vitB2:0.12, vitB6:0.40, vitB12:7.1, vitC:2, folate:8, niacin:5.7 },
  { id:'f075', name:'たら（生）',         category:'fish',      energy:77,  protein:17.6,fat:0.2, satFat:0.1, carb:0.1,  fiber:0, sugar:0.1, salt:0.3, potassium:350, calcium:32, iron:0.2, zinc:0.4, vitA:10, vitD:1.0, vitB1:0.10, vitB2:0.10, vitB6:0.36, vitB12:1.0, vitC:1, folate:9, niacin:2.7 },
  { id:'f076', name:'えび（ブラックタイガー・生）',category:'fish',energy:91,protein:19.6,fat:0.6,satFat:0.1,carb:0.3,fiber:0,sugar:0.3,salt:0.3,potassium:230,calcium:62,iron:0.1,zinc:1.1,vitA:3,vitD:0,vitB1:0.03,vitB2:0.05,vitB6:0.20,vitB12:1.5,vitC:1,folate:23,niacin:3.3 },
  { id:'f077', name:'いわし（丸干し）',   category:'fish',      energy:238, protein:27.7,fat:14.1,satFat:3.4, carb:0.3,  fiber:0, sugar:0.1, salt:3.7, potassium:300, calcium:490, iron:3.5, zinc:3.2, vitA:13, vitD:50.0, vitB1:0.09, vitB2:0.37, vitB6:0.30, vitB12:8.3, vitC:0, folate:14, niacin:8.5 },
  { id:'f078', name:'まぐろ缶（水煮）',   category:'fish',      energy:71,  protein:16.0,fat:0.7, satFat:0.2, carb:0.4,  fiber:0, sugar:0.1, salt:0.4, potassium:230, calcium:4, iron:1.0, zinc:0.6, vitA:6, vitD:2.0, vitB1:0.03, vitB2:0.08, vitB6:0.23, vitB12:0.9, vitC:0, folate:5, niacin:10.3 },
  { id:'f079', name:'さば缶（みそ煮）',   category:'fish',      energy:210, protein:16.3,fat:13.9,satFat:3.5, carb:6.6,  fiber:0.3, sugar:3.3, salt:1.1, potassium:290, calcium:210, iron:1.6, zinc:1.2, vitA:13, vitD:3.7, vitB1:0.11, vitB2:0.26, vitB6:0.24, vitB12:10.0,vitC:0, folate:9, niacin:8.4 },

  // ─── 肉類 ───
  { id:'f080', name:'鶏むね肉（皮なし・生）',category:'meat',  energy:108, protein:23.3,fat:1.9, satFat:0.5, carb:0.0,  fiber:0, sugar:0.0, salt:0.1, potassium:370, calcium:3, iron:0.3, zinc:0.7, vitA:7, vitD:0.1, vitB1:0.10, vitB2:0.10, vitB6:0.64, vitB12:0.3, vitC:3, folate:12, niacin:11.5 },
  { id:'f081', name:'鶏もも肉（皮なし・生）',category:'meat',  energy:127, protein:19.0,fat:5.0, satFat:1.3, carb:0.0,  fiber:0, sugar:0.0, salt:0.2, potassium:340, calcium:4, iron:0.6, zinc:1.6, vitA:16, vitD:0.1, vitB1:0.10, vitB2:0.15, vitB6:0.34, vitB12:0.3, vitC:3, folate:13, niacin:5.3 },
  { id:'f082', name:'豚ロース（脂身つき・生）',category:'meat',energy:263, protein:19.3,fat:19.2,satFat:7.0, carb:0.2,  fiber:0, sugar:0.2, salt:0.1, potassium:310, calcium:3, iron:0.3, zinc:1.9, vitA:4, vitD:0.3, vitB1:0.63, vitB2:0.23, vitB6:0.32, vitB12:0.5, vitC:1, folate:4, niacin:5.5 },
  { id:'f083', name:'豚ももうす切り（生）',category:'meat',    energy:183, protein:20.5,fat:10.6,satFat:3.7, carb:0.3,  fiber:0, sugar:0.3, salt:0.1, potassium:350, calcium:3, iron:0.7, zinc:2.2, vitA:6, vitD:0.3, vitB1:0.96, vitB2:0.23, vitB6:0.37, vitB12:0.5, vitC:1, folate:5, niacin:7.1 },
  { id:'f084', name:'牛もも（赤身・生）', category:'meat',     energy:182, protein:21.3,fat:10.7,satFat:4.0, carb:0.5,  fiber:0, sugar:0.1, salt:0.1, potassium:340, calcium:3, iron:2.7, zinc:4.2, vitA:5, vitD:0.1, vitB1:0.09, vitB2:0.22, vitB6:0.35, vitB12:1.7, vitC:1, folate:11, niacin:5.4 },
  { id:'f085', name:'牛ひき肉（生）',     category:'meat',     energy:272, protein:17.1,fat:21.1,satFat:8.6, carb:0.3,  fiber:0, sugar:0.1, salt:0.2, potassium:280, calcium:6, iron:2.3, zinc:3.9, vitA:14, vitD:0.1, vitB1:0.06, vitB2:0.14, vitB6:0.25, vitB12:2.4, vitC:1, folate:9, niacin:4.3 },
  { id:'f086', name:'鶏レバー（生）',     category:'meat',     energy:111, protein:18.9,fat:3.1, satFat:0.9, carb:0.6,  fiber:0, sugar:0.5, salt:0.2, potassium:330, calcium:5, iron:9.0, zinc:3.3, vitA:14000,vitD:0.2, vitB1:0.38, vitB2:1.80, vitB6:0.65, vitB12:44.4,vitC:20, folate:1300,niacin:11.6 },
  { id:'f087', name:'豚レバー（生）',     category:'meat',     energy:128, protein:20.4,fat:3.4, satFat:1.1, carb:2.5,  fiber:0, sugar:2.4, salt:0.1, potassium:290, calcium:5, iron:13.0,zinc:6.9, vitA:13000,vitD:1.3, vitB1:0.34, vitB2:3.60, vitB6:0.57, vitB12:25.2,vitC:20, folate:810, niacin:14.0 },

  // ─── 卵類 ───
  { id:'f090', name:'鶏卵（全卵・生）',   category:'egg',       energy:142, protein:12.3,fat:10.3,satFat:3.0, carb:0.4,  fiber:0, sugar:0.4, salt:0.4, potassium:130, calcium:46, iron:1.5, zinc:1.1, vitA:150, vitD:3.8, vitB1:0.06, vitB2:0.37, vitB6:0.08, vitB12:0.9, vitC:0, folate:43, niacin:0.1 },
  { id:'f091', name:'ゆで卵',             category:'egg',       energy:134, protein:12.5,fat:10.4,satFat:3.0, carb:0.4,  fiber:0, sugar:0.3, salt:0.4, potassium:130, calcium:43, iron:1.4, zinc:1.0, vitA:140, vitD:2.5, vitB1:0.06, vitB2:0.31, vitB6:0.07, vitB12:0.8, vitC:0, folate:43, niacin:0.1 },

  // ─── 乳類 ───
  { id:'f095', name:'普通牛乳',           category:'dairy',     energy:61,  protein:3.3, fat:3.8, satFat:2.4, carb:4.8,  fiber:0, sugar:4.8, salt:0.1, potassium:150, calcium:110, iron:0.0, zinc:0.4, vitA:38, vitD:0.3, vitB1:0.04, vitB2:0.15, vitB6:0.03, vitB12:0.3, vitC:1, folate:5, niacin:0.1 },
  { id:'f096', name:'低脂肪牛乳',         category:'dairy',     energy:42,  protein:3.8, fat:1.0, satFat:0.6, carb:5.5,  fiber:0, sugar:5.5, salt:0.1, potassium:190, calcium:130, iron:0.1, zinc:0.4, vitA:10, vitD:0.0, vitB1:0.04, vitB2:0.19, vitB6:0.04, vitB12:0.4, vitC:1, folate:6, niacin:0.2 },
  { id:'f097', name:'ヨーグルト（全脂無糖）',category:'dairy',  energy:56,  protein:3.6, fat:3.0, satFat:2.0, carb:5.0,  fiber:0, sugar:5.0, salt:0.1, potassium:170, calcium:120, iron:0.1, zinc:0.4, vitA:28, vitD:0.0, vitB1:0.04, vitB2:0.14, vitB6:0.04, vitB12:0.4, vitC:1, folate:11, niacin:0.1 },
  { id:'f098', name:'チーズ（プロセス）', category:'dairy',     energy:313, protein:22.7,fat:26.0,satFat:16.0,carb:1.3,  fiber:0, sugar:0.1, salt:2.8, potassium:60, calcium:630, iron:0.3, zinc:3.2, vitA:240, vitD:0.2, vitB1:0.03, vitB2:0.40, vitB6:0.06, vitB12:3.2, vitC:0, folate:27, niacin:0.2 },
  { id:'f099', name:'カッテージチーズ',   category:'dairy',     energy:99,  protein:13.3,fat:4.5, satFat:2.9, carb:1.9,  fiber:0, sugar:1.8, salt:0.8, potassium:55, calcium:55, iron:0.1, zinc:0.5, vitA:21, vitD:0.0, vitB1:0.02, vitB2:0.17, vitB6:0.07, vitB12:0.8, vitC:0, folate:13, niacin:0.1 },

  // ─── 油脂類 ───
  { id:'f100', name:'オリーブオイル',     category:'fat',       energy:894, protein:0.0, fat:99.9,satFat:13.5,carb:0.0,  fiber:0, sugar:0, salt:0.0, potassium:1, calcium:0, iron:0.0, zinc:0.0, vitA:0, vitD:0, vitB1:0.0, vitB2:0.0, vitB6:0.0, vitB12:0, vitC:0, folate:0, niacin:0 },
  { id:'f101', name:'ごま油',             category:'fat',       energy:890, protein:0.0, fat:99.8,satFat:15.0,carb:0.0,  fiber:0, sugar:0, salt:0.0, potassium:0, calcium:1, iron:0.0, zinc:0.1, vitA:0, vitD:0, vitB1:0.0, vitB2:0.0, vitB6:0.0, vitB12:0, vitC:0, folate:0, niacin:0 },
  { id:'f102', name:'バター（有塩）',     category:'fat',       energy:700, protein:0.5, fat:81.0,satFat:52.5,carb:0.2,  fiber:0, sugar:0.2, salt:1.9, potassium:28, calcium:17, iron:0.1, zinc:0.1, vitA:500, vitD:0.8, vitB1:0.01, vitB2:0.03, vitB6:0.00, vitB12:0.1, vitC:0, folate:1, niacin:0 },

  // ─── 調味料 ───
  { id:'f110', name:'みそ（淡色辛みそ）', category:'seasoning',  energy:192, protein:12.5,fat:6.0, satFat:1.0, carb:21.9, fiber:4.9, sugar:6.5, salt:12.4,potassium:380, calcium:100, iron:3.4, zinc:1.7, vitA:0, vitD:0, vitB1:0.03, vitB2:0.10, vitB6:0.12, vitB12:0, vitC:0, folate:40, niacin:1.4 },
  { id:'f111', name:'しょうゆ（濃口）',  category:'seasoning',  energy:71,  protein:7.7, fat:0.0, satFat:0.0, carb:10.1, fiber:0, sugar:6.7, salt:14.5,potassium:320, calcium:29, iron:1.7, zinc:0.9, vitA:0, vitD:0, vitB1:0.05, vitB2:0.17, vitB6:0.17, vitB12:0, vitC:0, folate:26, niacin:2.0 },
  { id:'f112', name:'白みそ（西京みそ）',category:'seasoning',  energy:220, protein:9.7, fat:3.0, satFat:0.5, carb:37.9, fiber:1.4, sugar:17.3,salt:6.1, potassium:340, calcium:80, iron:1.7, zinc:1.0, vitA:0, vitD:0, vitB1:0.04, vitB2:0.07, vitB6:0.09, vitB12:0, vitC:0, folate:21, niacin:0.8 },

  // ─── 加工食品・よく使うもの ───
  { id:'f120', name:'豆腐ハンバーグ（市販）',category:'processed',energy:158,protein:9.1,fat:9.7,satFat:2.3,carb:9.8,fiber:1.5,sugar:2.1,salt:1.0,potassium:180,calcium:76,iron:1.5,zinc:0.7,vitA:8,vitD:0,vitB1:0.09,vitB2:0.07,vitB6:0.12,vitB12:0.2,vitC:0,folate:14,niacin:1.2 },
  { id:'f121', name:'鶏ささみ（生）',     category:'meat',     energy:105, protein:23.9,fat:0.8, satFat:0.2, carb:0.0,  fiber:0, sugar:0.0, salt:0.1, potassium:430, calcium:3, iron:0.3, zinc:0.7, vitA:4, vitD:0.1, vitB1:0.10, vitB2:0.09, vitB6:0.66, vitB12:0.3, vitC:3, folate:11, niacin:12.7 },
  { id:'f122', name:'ツナ缶（油漬・ドレイン）',category:'fish',  energy:267, protein:17.7,fat:21.7,satFat:3.8, carb:0.1,  fiber:0, sugar:0.1, salt:0.5, potassium:190, calcium:9, iron:1.1, zinc:0.7, vitA:7, vitD:2.2, vitB1:0.03, vitB2:0.07, vitB6:0.18, vitB12:3.6, vitC:0, folate:5, niacin:9.3 },
  { id:'f123', name:'ゆで大豆（水煮缶）', category:'legume',    energy:140, protein:12.9,fat:6.7, satFat:1.0, carb:10.2, fiber:7.0, sugar:2.0, salt:0.3, potassium:500, calcium:90, iron:2.2, zinc:1.7, vitA:0, vitD:0, vitB1:0.17, vitB2:0.05, vitB6:0.14, vitB12:0, vitC:0, folate:50, niacin:0.7 },
  { id:'f124', name:'ひよこ豆（水煮）',   category:'legume',    energy:171, protein:9.5, fat:2.5, satFat:0.3, carb:29.6, fiber:11.6,sugar:4.8, salt:0.0, potassium:350, calcium:45, iron:2.6, zinc:1.5, vitA:0, vitD:0, vitB1:0.10, vitB2:0.06, vitB6:0.20, vitB12:0, vitC:0, folate:110, niacin:0.6 },
  { id:'f125', name:'ギリシャヨーグルト（無糖）',category:'dairy',energy:100,protein:10.0,fat:4.0,satFat:2.7,carb:5.0,fiber:0,sugar:4.0,salt:0.1,potassium:160,calcium:110,iron:0.1,zinc:0.6,vitA:36,vitD:0,vitB1:0.03,vitB2:0.15,vitB6:0.06,vitB12:0.5,vitC:1,folate:12,niacin:0.1 },
  { id:'f126', name:'プロテインパウダー（ホエイ）',category:'processed',energy:370,protein:75.0,fat:5.0,satFat:2.0,carb:9.0,fiber:0,sugar:6.0,salt:0.5,potassium:500,calcium:500,iron:1.0,zinc:2.0,vitA:0,vitD:0,vitB1:0.10,vitB2:0.20,vitB6:0.10,vitB12:0.5,vitC:0,folate:20,niacin:0.5 },
];

// 検索
export function searchFoods(query, limit = 20) {
  if (!query) return FOODS.slice(0, limit);
  const q = query.toLowerCase();
  return FOODS.filter(f => f.name.includes(q) || f.category.includes(q)).slice(0, limit);
}

// IDで取得
export function getFoodById(id) { return FOODS.find(f => f.id === id) || null; }

// カテゴリで取得
export function getFoodsByCategory(cat) { return FOODS.filter(f => f.category === cat); }

// 栄養素別ランキング (top N)
export function topFoodsByNutrient(nutrientKey, n = 10, categoryFilter = null) {
  let list = categoryFilter ? FOODS.filter(f => f.category === categoryFilter) : FOODS;
  return [...list]
    .sort((a, b) => (b[nutrientKey] || 0) - (a[nutrientKey] || 0))
    .slice(0, n);
}

// 食材で指定栄養素の目標量を達成するのに必要なグラム数
export function gramsNeeded(food, nutrientKey, targetAmount) {
  const per100 = food[nutrientKey] || 0;
  if (per100 <= 0) return null;
  return Math.round((targetAmount / per100) * 100);
}

// 栄養素名の日本語マッピング
export const NUTRIENT_LABELS = {
  energy:    { label: 'エネルギー',    unit: 'kcal', icon: '🔥' },
  protein:   { label: 'たんぱく質',   unit: 'g',    icon: '🥩' },
  fat:       { label: '脂質',          unit: 'g',    icon: '🫙' },
  satFat:    { label: '飽和脂肪酸',   unit: 'g',    icon: '🧈' },
  carb:      { label: '炭水化物',      unit: 'g',    icon: '🍚' },
  fiber:     { label: '食物繊維',      unit: 'g',    icon: '🥦' },
  sugar:     { label: '糖質',          unit: 'g',    icon: '🍬' },
  salt:      { label: '食塩相当量',   unit: 'g',    icon: '🧂' },
  potassium: { label: 'カリウム',      unit: 'mg',   icon: '🍌' },
  calcium:   { label: 'カルシウム',   unit: 'mg',   icon: '🥛' },
  iron:      { label: '鉄',            unit: 'mg',   icon: '🩸' },
  zinc:      { label: '亜鉛',          unit: 'mg',   icon: '⚡' },
  vitA:      { label: 'ビタミンA',     unit: 'μgRAE',icon: '🥕' },
  vitD:      { label: 'ビタミンD',     unit: 'μg',   icon: '☀️' },
  vitB1:     { label: 'ビタミンB1',    unit: 'mg',   icon: '🌾' },
  vitB2:     { label: 'ビタミンB2',    unit: 'mg',   icon: '🥬' },
  vitB6:     { label: 'ビタミンB6',    unit: 'mg',   icon: '🫛' },
  vitB12:    { label: 'ビタミンB12',   unit: 'μg',   icon: '🐟' },
  vitC:      { label: 'ビタミンC',     unit: 'mg',   icon: '🍋' },
  folate:    { label: '葉酸',          unit: 'μg',   icon: '🌿' },
  niacin:    { label: 'ナイアシン',   unit: 'mg',   icon: '🫀' },
};
