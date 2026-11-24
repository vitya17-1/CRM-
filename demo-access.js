const demoKey = 'uroki-demo-access-v1';
let accessDemo = JSON.parse(localStorage.getItem(demoKey) || 'null') ||
  {invites: [], accounts: {}, blocked: {}, removed: {}, messages: []};
const saveAccess = () => localStorage.setItem(demoKey, JSON.stringify(accessDemo));
const sampleParents = [['parent-olga', 'Ольга', 2], ['parent-irina', 'Ирина', 3]];
for (const [login, name, studentId] of sampleParents) {
  if (student(studentId)) accounts[login] = {name, studentId, password: 'parent123', role: 'parent', label: 'Родитель'};
}
Object.assign(accounts, accessDemo.accounts);
navs.admin.push(['access', '◉', 'Доступ'], ['messages', '✉', 'Сообщения']);
navs.parent.push(['messages', '✉', 'Сообщения']);

const inviteEntry = document.createElement('button');
inviteEntry.type = 'button';
inviteEntry.className = 'secondary';
inviteEntry.textContent = 'Войти по приглашению';
inviteEntry.onclick = () => {
  $('#redeemInvite').reset();
  $('#inviteError').textContent = '';
  $('#inviteDialog').showModal();
};
$('#loginForm').append(inviteEntry);

function familyAccounts() {
  return Object.entries(accounts).filter(([login, account]) =>
    account.role !== 'admin' && student(account.studentId) && !accessDemo.removed[login]);
}

function accessPage() {
  if (user.role !== 'admin') return '';
  const invites = accessDemo.invites.filter(invite => invite.expires > Date.now());
  return `<div class="grid dashboard-grid">
    <section class="card"><h2>Пригласить в кабинет</h2><p>Демо: передайте код для проверки в этом браузере. Код одноразовый и действует 48 часов.</p>
    <form id="issueInvite" class="demo-form">
    <fieldset class="invite-choices"><legend>Ученик</legend>
      <details class="invite-students"><summary>${escapeHtml(data.students[0]?.name || 'Добавьте ученика')}</summary>
        <div>${data.students.map((pupil, index) => `<label><input type="radio" name="studentId" value="${pupil.id}" ${index === 0 ? 'checked' : ''}> <span>${escapeHtml(pupil.name)}</span></label>`).join('')}</div>
      </details>
    </fieldset>
    <fieldset class="invite-choices invite-roles"><legend>Кого пригласить</legend>
      <label><input type="radio" name="role" value="parent" checked> Родителя</label>
      <label><input type="radio" name="role" value="student"> Ученика</label>
    </fieldset>
    <button class="primary" ${data.students.length ? '' : 'disabled'}>Создать приглашение</button></form>
    ${invites.map(invite => `<div class="task-preview"><b>${escapeHtml(student(invite.studentId)?.name)} · ${invite.role === 'parent' ? 'Родитель' : 'Ученик'}</b><code>${invite.code}</code><button class="text-btn" data-revoke-invite="${invite.code}">Отозвать приглашение</button></div>`).join('')}</section>
    <section class="card"><h2>Учётные записи</h2>${familyAccounts().map(([login, account]) => `<div class="task-preview"><b>${escapeHtml(account.name)} · ${account.label}</b><small>${escapeHtml(login)} · ${escapeHtml(student(account.studentId)?.name)} · ${accessDemo.blocked[login] ? 'Заблокирован' : 'Активен'}</small><div class="demo-account-actions"><button class="secondary" data-block-account="${escapeHtml(login)}">${accessDemo.blocked[login] ? 'Разблокировать' : 'Заблокировать'}</button><button class="text-btn" data-remove-account="${escapeHtml(login)}">Удалить аккаунт</button></div></div>`).join('') || '<p>Аккаунтов пока нет.</p>'}</section>
  </div>`;
}

let activeConversation = '';
let conversationOpen = false;
function refreshChatNotifications() {
  if (!user || !['admin', 'parent'].includes(user.role)) return;
  const count = accessDemo.messages.filter(message => !message.read &&
    (user.role === 'admin' ? message.from === message.parent : message.parent === user.login && message.from === 'sasha')).length;
  for (const button of $$('button[data-page="messages"], .mobile-more > summary')) {
    button.querySelector('.chat-nav-badge')?.remove();
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'chat-nav-badge';
      badge.textContent = count;
      badge.setAttribute('aria-label', 'Непрочитанных сообщений: ' + count);
      button.append(badge);
    }
  }
  $('#chatDashboardNotice')?.remove();
  if (count && currentPage === 'dashboard') {
    const notice = document.createElement('button');
    notice.id = 'chatDashboardNotice';
    notice.className = 'secondary chat-dashboard-notice';
    notice.dataset.page = 'messages';
    notice.textContent = 'Непрочитанные сообщения: ' + count + ' →';
    $('#content').prepend(notice);
  }
}
function messagesPage() {
  const parents = familyAccounts().filter(([login, account]) => account.role === 'parent' && !accessDemo.blocked[login]);
  const admin = user.role === 'admin';
  if (admin && !parents.some(([login]) => login === activeConversation)) { activeConversation = ''; conversationOpen = false; }
  const partner = admin ? activeConversation : user.login;
  const thread = accessDemo.messages.filter(message => message.parent === partner);
  let changed = false;
  for (const message of thread) {
    if (message.from !== user.login && !message.read) { message.read = true; changed = true; }
  }
  if (changed) saveAccess();
  const dialogList = admin ? `<aside class="chat-list" aria-label="Диалоги"><h2>Диалоги</h2>${parents.map(([login, account]) => {
    const messages = accessDemo.messages.filter(message => message.parent === login);
    return {login, account, last: messages.at(-1), unread: messages.filter(message => message.from === login && !message.read).length};
  }).sort((a,b) => (b.last?.at || 0) - (a.last?.at || 0)).map(({login, account, last, unread}) => `<button type="button" class="chat-contact ${login === partner ? 'active' : ''}" data-chat-contact="${escapeHtml(login)}" aria-pressed="${login === partner}"><span class="mini-avatar" aria-hidden="true">${escapeHtml(initials(account.name))}</span><span class="chat-contact-copy"><strong>${escapeHtml(account.name)} · ${escapeHtml(student(account.studentId)?.name)}</strong><small>${last ? escapeHtml(last.text) : 'Сообщений пока нет'}</small></span>${unread ? `<span class="chat-unread" aria-label="Новых сообщений: ${unread}">${unread}</span>` : ''}</button>`).join('') || '<p>Пригласите родителя, чтобы начать чат.</p>'}</aside>` : '';
  return `<section class="card demo-chat ${admin ? 'multi-chat' : ''} ${conversationOpen ? 'conversation-open' : ''}">
    ${dialogList}<div class="chat-main">
    ${admin && partner ? '<button type="button" class="secondary chat-back" data-chat-back>← Диалоги</button>' : ''}
    <h2>${admin ? (partner ? escapeHtml(accounts[partner]?.name) : 'Выберите диалог') : 'Чат с Сашей'}</h2>
    ${partner ? `<div class="demo-thread" aria-label="История сообщений">${thread.map(message => `<article class="${message.from === user.login ? 'own-message' : ''}"><small>${message.from === 'sasha' ? 'Саша' : escapeHtml(accounts[partner]?.name)} · ${new Date(message.at).toLocaleString('ru-RU', {dateStyle:'short', timeStyle:'short', timeZone:'Europe/Moscow'})}</small><div>${escapeHtml(message.text)}</div></article>`).join('') || '<p>Сообщений пока нет.</p>'}</div><form id="chatForm" class="demo-form"><label>Сообщение <textarea name="message" rows="3" maxlength="2000" required></textarea></label><button class="primary">Отправить</button></form>` : '<p>Сообщения выбранной семьи появятся здесь.</p>'}
  </div></section>`;
}

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id === 'issueInvite' && user?.role === 'admin') {
    event.preventDefault();
    const values = new FormData(form);
    const studentId = Number(values.get('studentId'));
    const role = values.get('role');
    if (!student(studentId) || !['parent','student'].includes(role)) return;
    const code = Array.from(crypto.getRandomValues(new Uint8Array(12)), byte => byte.toString(16).padStart(2, '0')).join('');
    accessDemo.invites.push({code, studentId, role, expires: Date.now() + 48 * 3600000});
    saveAccess();
    go('access');
    toast('Приглашение создано');
  }
  if (form.id === 'chatForm' && ['admin','parent'].includes(user?.role)) {
    event.preventDefault();
    const parent = user.role === 'admin' ? activeConversation : user.login;
    const text = new FormData(form).get('message').trim();
    if (!text || !familyAccounts().some(([login, account]) => login === parent && account.role === 'parent' && !accessDemo.blocked[login])) return;
    accessDemo.messages.push({parent, from: user.login, text, at: Date.now(), read: false});
    saveAccess();
    go('messages');
    $('.demo-thread').scrollTop = $('.demo-thread').scrollHeight;
    $('#chatForm textarea').focus();
  }
});

document.addEventListener('change', event => {
  if (event.target.matches('#issueInvite [name="studentId"]')) {
    const picker = event.target.closest('details');
    const summary = picker.querySelector('summary');
    summary.textContent = student(event.target.value)?.name || 'Выберите ученика';
    picker.open = false;
    summary.focus();
    return;
  }
});
document.addEventListener('click', event => {
  if (user?.role !== 'admin') return;
  const contact = event.target.closest('[data-chat-contact]');
  if (contact && currentPage === 'messages') {
    activeConversation = contact.dataset.chatContact;
    conversationOpen = true;
    go('messages');
    const thread = $('.demo-thread');
    if (thread) thread.scrollTop = thread.scrollHeight;
    $('#chatForm textarea')?.focus({preventScroll: true});
    return;
  }
  if (event.target.closest('[data-chat-back]')) {
    conversationOpen = false;
    activeConversation = '';
    go('messages');
    $('.chat-contact')?.focus();
    return;
  }
  const {revokeInvite, blockAccount, removeAccount} = event.target.closest('button')?.dataset || {};
  const login = blockAccount || removeAccount;
  if (revokeInvite) accessDemo.invites = accessDemo.invites.filter(invite => invite.code !== revokeInvite);
  else if (!familyAccounts().some(([id]) => id === login)) return;
  else if (blockAccount) accessDemo.blocked[login] = !accessDemo.blocked[login];
  else {
    if (!confirm('Удалить аккаунт? Карточка ученика и оплаты сохранятся.')) return;
    accessDemo.removed[login] = true;
    delete accessDemo.accounts[login];
  }
  saveAccess();
  go('access');
});

$('#redeemInvite').onsubmit = event => {
  event.preventDefault();
  const values = new FormData(event.target);
  const login = values.get('login').trim().toLowerCase();
  const code = values.get('code').trim().toLowerCase();
  const name = values.get('displayName').trim();
  const invite = accessDemo.invites.find(item => item.code === code && item.expires > Date.now());
  if (!invite || !name || !/^[a-z0-9._-]{3,40}$/.test(login) || login in accounts || accessDemo.removed[login]) {
    $('#inviteError').textContent = 'Проверьте код и имя. Если логин уже использовался, выберите другой.';
    return;
  }
  accounts[login] = accessDemo.accounts[login] = {name, password: values.get('password'), role: invite.role,
    label: invite.role === 'parent' ? 'Родитель' : 'Ученик', studentId: invite.studentId};
  accessDemo.invites = accessDemo.invites.filter(item => item !== invite);
  saveAccess();
  $('#inviteDialog').close();
  $('#loginInput').value = login;
  $('#passwordInput').value = '';
  $('#passwordInput').focus();
  toast('Аккаунт создан. Войдите со своим паролем.');
};

$('#loginForm').onsubmit = event => {
  event.preventDefault();
  const login = $('#loginInput').value.trim().toLowerCase();
  const account = Object.hasOwn(accounts, login) && accounts[login];
  if (!account || account.password !== $('#passwordInput').value || accessDemo.removed[login]) {
    $('#loginError').textContent = 'Неверный логин или пароль.';
    return;
  }
  if (accessDemo.blocked[login]) {
    $('#loginError').textContent = 'Аккаунт заблокирован. Обратитесь к Саше.';
    return;
  }
  $('#loginError').textContent = '';
  if (account.role !== 'parent') {
    user = {login, ...account};
    enterApp();
    return;
  }
  $('#consentForm').reset();
  $('#consentForm').onsubmit = consent => {
    consent.preventDefault();
    user = {login, ...account};
    $('#consent').close();
    enterApp();
  };
  $('#consent').showModal();
};

window.addEventListener('storage', event => {
  if (event.key !== demoKey || !event.newValue) return;
  accessDemo = JSON.parse(event.newValue);
  Object.assign(accounts, accessDemo.accounts);
  if (user && (accessDemo.blocked[user.login] || accessDemo.removed[user.login])) {
    $('#logoutBtn').click();
    $('#loginError').textContent = 'Доступ к аккаунту отключён.';
  } else if (user && ['messages', 'access'].includes(currentPage) && !document.activeElement?.matches('input, textarea')) {
    go(currentPage);
  } else if (user) {
    refreshChatNotifications();
  }
});
