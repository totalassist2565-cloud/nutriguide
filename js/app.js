// SPA Router

import { renderDashboard } from '../pages/dashboard.js';
import { renderClients } from '../pages/clients.js';
import { renderClientDetail } from '../pages/client-detail.js';
import { renderMaterials } from '../pages/materials.js';
import { renderConverter } from '../pages/converter.js';
import { renderMeals } from '../pages/meals.js';
import { renderObsidian } from '../pages/obsidian.js';
import { renderReports } from '../pages/reports.js';

const ROUTES = {
  '/dashboard':      { render: renderDashboard,    title: 'ダッシュボード' },
  '/clients':        { render: renderClients,       title: 'クライアント管理' },
  '/clients/new':    { render: (p) => renderClientDetail(p, null), title: '新規クライアント' },
  '/clients/:id':    { render: renderClientDetail,  title: 'クライアント詳細' },
  '/materials':      { render: renderMaterials,      title: '説明用資料' },
  '/converter':      { render: renderConverter,     title: '食品⇄栄養素変換' },
  '/meals':          { render: renderMeals,         title: '食事記録・分析' },
  '/obsidian':       { render: renderObsidian,      title: 'Obsidianノート' },
  '/reports':        { render: renderReports,       title: 'レポート生成' },
};

export function navigate(path) {
  location.hash = '#' + path;
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/dashboard';
  // Exact match
  if (ROUTES[path]) return { route: ROUTES[path], params: {} };
  // Param match
  for (const [pattern, route] of Object.entries(ROUTES)) {
    const parts = pattern.split('/');
    const pathParts = path.split('/');
    if (parts.length !== pathParts.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) params[parts[i].slice(1)] = pathParts[i];
      else if (parts[i] !== pathParts[i]) { match = false; break; }
    }
    if (match) return { route, params };
  }
  return { route: ROUTES['/dashboard'], params: {} };
}

let _currentChart = null;

export function destroyChart() {
  if (_currentChart) { _currentChart.destroy(); _currentChart = null; }
}

export function registerChart(chart) { _currentChart = chart; }

export function initRouter() {
  function render() {
    destroyChart();
    const { route, params } = matchRoute(location.hash);
    document.getElementById('page-title').textContent = route.title;
    document.getElementById('header-actions').innerHTML = '';

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
      const page = link.dataset.page;
      const hash = location.hash.replace('#/', '');
      if (page && hash.startsWith(page)) link.classList.add('active');
    });

    const content = document.getElementById('page-content');
    content.innerHTML = '';
    route.render(params);
  }

  window.addEventListener('hashchange', render);
  render();
}

// Global toast helper
export function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  const colors = { success: 'bg-brand-600', error: 'bg-red-600', info: 'bg-blue-600', warn: 'bg-amber-500' };
  el.className = `toast ${colors[type] || colors.success}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

// Modal helper
export function openModal(html, onReady) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal max-w-2xl">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  if (onReady) onReady(overlay.querySelector('.modal'));
  return overlay;
}

export function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

// Confirm dialog
export function confirm(msg) {
  return new Promise(resolve => {
    const overlay = openModal(`
      <div class="p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-3">確認</h3>
        <p class="text-slate-600 mb-6">${msg}</p>
        <div class="flex justify-end gap-3">
          <button id="confirm-no" class="btn-secondary">キャンセル</button>
          <button id="confirm-yes" class="btn-danger">削除する</button>
        </div>
      </div>
    `);
    overlay.querySelector('#confirm-yes').onclick = () => { closeModal(); resolve(true); };
    overlay.querySelector('#confirm-no').onclick = () => { closeModal(); resolve(false); };
  });
}
