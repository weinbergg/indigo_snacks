function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4f0ea;
      color: #14181a;
    }
    main { max-width: 720px; margin: 48px auto; padding: 0 20px 64px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    p, label { line-height: 1.5; }
    .muted { color: #3a4245; }
    .card {
      background: #fff;
      border: 1px solid #d7cfc4;
      border-radius: 16px;
      padding: 24px;
    }
    .row { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px 8px; border-bottom: 1px solid #ece6de; vertical-align: middle; }
    th { font-size: 13px; color: #3a4245; font-weight: 600; }
    input[type="password"], input[type="number"] {
      width: 100%;
      max-width: 220px;
      padding: 10px 12px;
      border: 1px solid #cfc6ba;
      border-radius: 10px;
      font-size: 16px;
    }
    button, .ghost {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
    }
    button { background: #2f7a72; color: #fff; }
    .ghost { background: transparent; color: #2f7a72; }
    .notice { margin: 0 0 16px; padding: 12px 14px; border-radius: 12px; background: #e8f3f1; }
    .error { background: #f8e8e6; }
    .ok { background: #e8f3f1; }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`;
}

export function renderDisabledPage() {
  return layout(
    'Админка недоступна',
    `<div class="card">
      <h1>Админка выключена</h1>
      <p class="muted">Добавьте <code>ADMIN_PASSWORD</code> в <code>.env</code> и перезапустите API.</p>
    </div>`
  );
}

export function renderLoginPage(error = '') {
  return layout(
    'Вход в админку',
    `<div class="card">
      <h1>Indigo Snacks</h1>
      <p class="muted">Простая админка для цен на сайте.</p>
      ${error ? `<p class="notice error">${escapeHtml(error)}</p>` : ''}
      <form method="post" action="/admin/login">
        <p>
          <label for="password">Пароль</label><br>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
        </p>
        <button type="submit">Войти</button>
      </form>
    </div>`
  );
}

export function renderPricesPage(
  variants: Array<{
    sku: string;
    label: string;
    priceKopecks: number;
    product: { name: string };
  }>,
  notice = ''
) {
  const rows = variants
    .map((variant) => {
      const rubles = (variant.priceKopecks / 100).toFixed(0);
      return `<tr>
        <td>${escapeHtml(variant.product.name)}</td>
        <td>${escapeHtml(variant.label)}</td>
        <td>${escapeHtml(variant.sku)}</td>
        <td>
          <input type="hidden" name="sku" value="${escapeHtml(variant.sku)}">
          <input type="number" name="priceRubles" min="1" max="100000" step="1" value="${rubles}" required>
        </td>
      </tr>`;
    })
    .join('');

  return layout(
    'Цены',
    `<div class="row">
      <div>
        <h1>Цены</h1>
        <p class="muted">Суммы в рублях. После сохранения сайт сразу читает новые значения из базы.</p>
      </div>
      <form method="post" action="/admin/logout"><button class="ghost" type="submit">Выйти</button></form>
    </div>
    <div class="card">
      ${notice ? `<p class="notice ok">${escapeHtml(notice)}</p>` : ''}
      <form method="post" action="/admin/prices">
        <table>
          <thead>
            <tr>
              <th>Товар</th>
              <th>Фасовка</th>
              <th>SKU</th>
              <th>Цена, ₽</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p><button type="submit">Сохранить цены</button></p>
      </form>
    </div>`
  );
}
