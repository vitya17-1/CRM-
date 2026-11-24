const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),money=n=>Number(n).toLocaleString('ru-RU')+' ₽',future=d=>{let x=new Date();x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)},fmt=d=>new Date(d+'T12:00').toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'short'});
const accounts={sasha:{password:'demo123',role:'admin',name:'Саша',label:'Руководитель'},parent:{password:'parent123',role:'parent',name:'Елена',label:'Родитель',studentId:1},student:{password:'student123',role:'student',name:'Анна',label:'Ученица',studentId:1}};
const seed={students:[{id:1,name:'Анна Петрова',parent:'Елена Петрова',phone:'+7 999 123-45-67',subject:'Математика · 8 класс',price:1200,balance:2,status:'Активен'},{id:2,name:'Михаил Орлов',parent:'Ольга Орлова',phone:'+7 999 555-20-10',subject:'Английский · B1',price:1500,balance:6,status:'Активен'},{id:3,name:'София Белова',parent:'Ирина Белова',phone:'+7 999 410-88-92',subject:'Русский язык · 6 класс',price:1100,balance:8,status:'Активен'},{id:4,name:'Даниил Соколов',parent:'Марина Соколова',phone:'+7 999 710-42-21',subject:'Математика · 9 класс',price:1400,balance:1,status:'Пауза'}],lessons:[{id:11,studentId:1,date:future(1),time:'16:00',paid:true},{id:12,studentId:2,date:future(1),time:'18:30',paid:true},{id:13,studentId:3,date:future(2),time:'15:00',paid:true},{id:14,studentId:1,date:future(5),time:'16:00',paid:true}],homework:[{id:21,studentId:1,title:'Решить задания № 12–18',due:future(3),done:false},{id:22,studentId:2,title:'Подготовить рассказ о путешествии',due:future(2),done:false}],slots:[{id:31,date:future(2),time:'14:00',duration:60},{id:32,date:future(3),time:'17:00',duration:60},{id:33,date:future(6),time:'12:00',duration:90}],payments:[{id:41,studentId:1,date:'18.11.2026',amount:9000,status:'Оплачено'},{id:42,studentId:2,date:'10.11.2026',amount:12000,status:'Оплачено'}]};
let data=JSON.parse(localStorage.getItem('uroki-crm-v3')||'null')||seed,user=null,currentPage='dashboard';const save=()=>localStorage.setItem('uroki-crm-v3',JSON.stringify(data)),student=id=>data.students.find(s=>s.id==id),initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const localDay = () => new Date().toLocaleDateString('sv-SE');
const orderedLessons = lessons => [...lessons].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
const ownLessons = () => data.lessons.filter(lesson => user.role === 'admin' || lesson.studentId === user.studentId);
const lessonList = (lessons, message) => lessons.map(lessonRow).join('') || `<p class="empty">${message}</p>`;
for (const lesson of data.lessons) lesson.price ??= student(lesson.studentId)?.price ?? 0;
if (data === seed && data.lessons.length > 1) data.lessons[1].paid = false;
const navs={admin:[['dashboard','⌂','Обзор'],['students','♙','Ученики'],['schedule','□','Расписание'],['homework','✓','Задания',data.homework.filter(x=>!x.done).length],['payments','₽','Оплаты'],['slots','◷','Свободные окна']],parent:[['dashboard','⌂','Главная'],['schedule','□','Расписание'],['homework','✓','Задания'],['payments','₽','Оплаты'],['slots','◷','Свободные окна']],student:[['dashboard','⌂','Главная'],['schedule','□','Мои занятия'],['homework','✓','Задания'],['payments','₽','Оплаты'],['slots','◷','Свободные окна']]};
$('#showPassword').onclick=()=>{let i=$('#passwordInput');i.type=i.type==='password'?'text':'password';$('#showPassword').textContent=i.type==='password'?'Показать':'Скрыть'};$('#forgot').onclick=()=>toast('Обратитесь к Саше для восстановления доступа');
$$('[data-demo]').forEach(b=>b.onclick=()=>{let a=accounts[b.dataset.demo];$('#loginInput').value=b.dataset.demo;$('#passwordInput').value=a.password});
$('#loginForm').onsubmit=e=>{e.preventDefault();let login=$('#loginInput').value.trim().toLowerCase(),a=accounts[login];if(!a||a.password!==$('#passwordInput').value){$('#loginError').textContent='Неверный логин или пароль. Проверьте данные.';return}user={login,...a};enterApp()};
function enterApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');$('#accountBadge').innerHTML=`<span class="avatar">${initials(user.name)}</span><div><b>${user.name}</b><small>${user.label}</small></div>`;$('#nav').innerHTML=navs[user.role].map(n=>`<button class="nav-button ${n[0]==='dashboard'?'active':''}" data-page="${n[0]}">${n[1]} <span>${n[2]}</span>${n[3]?`<i>${n[3]}</i>`:''}</button>`).join('');setupMobileMenu();$('#dateLine').textContent=new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});go('dashboard')}
function setupMobileMenu() {
  const nav = $('#nav');
  nav.setAttribute('aria-label', 'Разделы кабинета');
  const more = document.createElement('details');
  more.className = 'mobile-more';
  more.innerHTML = '<summary>⋯ <span>Ещё</span></summary><div class="mobile-menu-panel"></div>';
  const panel = more.lastElementChild;
  for (const button of nav.querySelectorAll('button')) {
    if (['dashboard', 'schedule', 'payments'].includes(button.dataset.page)) continue;
    button.classList.add('desktop-section');
    panel.append(button.cloneNode(true));
  }
  for (const [id, label] of [['helpBtn', 'Помощь'], ['logoutBtn', 'Выйти']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-button';
    button.textContent = label;
    button.onclick = () => $('#' + id).click();
    panel.append(button);
  }
  panel.addEventListener('click', () => { more.open = false; });
  nav.append(more);
}
document.addEventListener('click', event => {
  const more = $('.mobile-more[open]');
  if (more && !more.contains(event.target)) more.open = false;
});
document.addEventListener('keydown', event => {
  const more = $('.mobile-more[open]');
  if (more && event.key === 'Escape') {
    more.open = false;
    more.querySelector('summary').focus();
  }
});
$('#logoutBtn').onclick=()=>{user=null;$('#app').classList.add('hidden');$('#login').classList.remove('hidden');$('#passwordInput').value='';$('#loginError').textContent=''};$('#helpBtn').onclick=()=>toast('Поддержка: напишите Саше в привычном мессенджере');
function lessonSubscription(studentId, date) {
  const month = date.slice(0, 7);
  const subscription = data.monthlyPayments?.[month + ':' + studentId];
  const scheduled = data.lessons.filter(lesson =>
    lesson.studentId === Number(studentId) && lesson.date.startsWith(month + '-')).length;
  return { subscription, scheduled };
}

function previewLessonSubscription(form) {
  const note = $('#lessonSubscriptionNote');
  const date = form.elements.date.value;
  if (!date) {
    note.textContent = 'Выберите дату, чтобы проверить абонемент на этот месяц. Урок не создаёт отдельный счёт.';
    return;
  }
  const { subscription, scheduled } = lessonSubscription(form.elements.studentId.value, date);
  note.textContent = !subscription
    ? 'На этот месяц абонемент ещё не оформлен. Урок появится в расписании без отдельного счёта.'
    : scheduled >= subscription.count
      ? `Все ${subscription.count} занятий абонемента уже запланированы.`
      : `Урок входит в абонемент. После сохранения будет запланировано ${scheduled + 1} из ${subscription.count} занятий.`;
}

function lessonRow(lesson) {
  const pupil = student(lesson.studentId);
  const { subscription, scheduled } = lessonSubscription(lesson.studentId, lesson.date);
  return `<div class="lesson-row"><div class="time">${lesson.time}<small>${fmt(lesson.date)}</small></div><div class="student-cell"><div>${escapeHtml(pupil.name)}<small>${escapeHtml(pupil.subject)}</small></div></div><span class="status ${subscription && scheduled <= subscription.count ? '' : 'warn'}">${!subscription ? 'Абонемент не оформлен' : scheduled > subscription.count ? 'Лимит абонемента превышен' : 'В абонементе'}</span></div>`;
}
function adminDashboard() {
  const today = localDay();
  const lessons = orderedLessons(data.lessons);
  const daily = lessons.filter(lesson => lesson.date === today);
  const month = localDay().slice(0, 7);
  const invoices = monthlyInvoices(month);
  return `<div class="quick-grid overview-actions"><button data-add="student">＋ Ученик</button><button data-add="homework">＋ Задание</button><button data-add="slot">＋ Свободное окно</button></div><div class="grid dashboard-grid"><section class="card"><div class="card-head"><div><h2>Сегодня</h2><p>${daily.length} в расписании</p></div><button class="text-btn" data-page="schedule">Расписание →</button></div>${lessonList(daily, 'Сегодня занятий нет')}</section><section class="card"><div class="card-head"><div><h2>Оплаты за месяц</h2><p>К оплате: ${money(invoices.filter(item => !item.paid).reduce((sum, item) => sum + item.amount, 0))}</p></div><button class="text-btn" data-page="payments">Все оплаты →</button></div>${invoiceRows(invoices.filter(item => !item.paid).slice(0, 4))}</section></div><section class="card upcoming-card"><h2>Следующие занятия</h2>${lessonList(lessons.filter(lesson => lesson.date > today).slice(0, 4), 'Предстоящих занятий пока нет')}</section>`;
}
function personalDashboard() {
  const pupil = student(user.studentId);
  const lesson = orderedLessons(ownLessons()).find(item => item.date + 'T' + item.time >= localDay() + 'T' + new Date().toTimeString().slice(0, 5));
  const tasks = data.homework.filter(task => task.studentId === pupil.id && !task.done);
  const nextZoom = lesson && (zoomUrl(lesson.zoom) || zoomUrl(data.defaultZoom));
  const notices = ownLessons().filter(item => item.notify === 'yes').slice(-3).reverse();
  const noticePanel = notices.length ? `<section class="card calendar-notices"><h2>Уведомления</h2>${notices.map(item => `<div class="task-preview"><b>Запланирован урок</b><small>${fmt(item.date)} · ${item.time}</small></div>`).join('')}</section>` : '';
  return `${noticePanel}<section class="parent-hero"><div><p>Ближайшее занятие</p><h2>${lesson ? fmt(lesson.date) + ' · ' + lesson.time : 'Пока не назначено'}</h2><small>${escapeHtml(pupil.name)} · ${escapeHtml(pupil.subject)}</small></div>${nextZoom ? `<a class="primary lesson-join" href="${escapeHtml(nextZoom)}" target="_blank" rel="noopener noreferrer">Подключиться к Zoom</a>` : '<button class="secondary" data-page="payments">Оплата за месяц →</button>'}</section><div class="grid dashboard-grid"><section class="card"><div class="card-head"><h2>Домашние задания</h2><button class="text-btn" data-page="homework">Все задания →</button></div>${tasks.map(task => `<div class="task-preview"><b>${escapeHtml(task.title)}</b><small>До ${fmt(task.due)}</small></div>`).join('')||'<p class="empty">Новых заданий нет</p>'}</section><section class="card"><div class="card-head"><h2>Свободные окна</h2><button class="text-btn" data-page="slots">Посмотреть →</button></div>${data.slots.filter(slot=>slot.date>=localDay()).slice(0,3).map(slot=>`<div class="task-preview"><b>${fmt(slot.date)} · ${slot.time}</b><small>${slot.duration} мин.</small></div>`).join('')||'<p class="empty">Свободных окон пока нет</p>'}</section></div>`;
}
function studentsPage(){return `<div class="section-head"><div><h2>Ученики</h2><p>Контакты, обучение и стоимость занятий</p></div><button class="primary" data-add="student">＋ Новый ученик</button></div><div class="toolbar"><input class="search" placeholder="⌕  Найти ученика или родителя"></div><div class="data-table"><div class="table-head"><span>Ученик</span><span>Родитель</span><span>Направление</span><span>За занятие</span></div>${data.students.map(s=>`<div class="table-row"><div class="student-cell"><span class="mini-avatar">${initials(s.name)}</span><div>${escapeHtml(s.name)}<small>${escapeHtml(s.phone)}</small></div></div><span>${escapeHtml(s.parent)}</span><span>${escapeHtml(s.subject)}</span><div>${money(s.price)}<br><button class="text-btn" data-docs="${s.id}">📎 Документы</button></div></div>`).join('')}</div>`}
let calendarDate;
let calendarView = 'week';

function shiftCalendarDate(date, days) {
  const result = new Date(date + 'T12:00');
  result.setDate(result.getDate() + days);
  return result.toLocaleDateString('sv-SE');
}

function schedulePage() {
  calendarDate ||= localDay();
  if (calendarView === 'month') return monthCalendar();
  const weekday = new Date(calendarDate + 'T12:00').getDay();
  const start = calendarView === 'week' ? shiftCalendarDate(calendarDate, -((weekday + 6) % 7)) : calendarDate;
  const dates = Array.from({length: calendarView === 'week' ? 7 : 1}, (_, i) => shiftCalendarDate(start, i));
  const lessons = orderedLessons(ownLessons()).filter(lesson => dates.includes(lesson.date));
  const hours = lessons.map(lesson => Number(lesson.time.slice(0, 2)));
  const firstHour = Math.min(8, ...hours);
  const lastHour = Math.max(20, ...hours);
  const rows = Array.from({length: lastHour - firstHour + 1}, (_, index) => {
    const hour = String(firstHour + index).padStart(2, '0');
    return `<tr><th scope="row">${hour}:00</th>${dates.map(date => `<td>${calendarSlot(date, hour + ':00')}${lessons.filter(lesson => lesson.date === date && lesson.time.startsWith(hour + ':')).map(lesson => {
      const pupil = student(lesson.studentId);
      return `<button class="calendar-lesson" type="button" data-lesson-details="${lesson.id}"><strong>${lesson.time} · ${escapeHtml(pupil.name)}</strong></button>`;
    }).join('')}</td>`).join('')}</tr>`;
  }).join('');
  return `<section class="card"><div class="calendar-toolbar"><div><button class="secondary" data-calendar="today">Сегодня</button> <button class="secondary" data-calendar="prev" aria-label="Предыдущий период">←</button> <button class="secondary" data-calendar="next" aria-label="Следующий период">→</button></div><h2>${fmt(start)}${dates.length > 1 ? ' — ' + fmt(dates.at(-1)) : ''}</h2>${calendarViews()}</div><div class="calendar-scroll" tabindex="0" aria-label="Календарь занятий"><table class="calendar-table ${calendarView}"><thead><tr><th scope="col">Время</th>${dates.map(date => `<th scope="col" class="${date === localDay() ? 'calendar-today' : ''}">${fmt(date)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function calendarViews() {
  return '<div>' + [['day','День'],['week','Неделя'],['month','Месяц']].map(([key, label]) =>
    `<button class="secondary" data-calendar="${key}" aria-pressed="${calendarView === key}">${label}</button>`).join(' ') + '</div>';
}
function calendarSlot(date, time) {
  if (user.role !== 'admin' || data.lessons.some(lesson => lesson.date === date && lesson.time === time)) return '';
  return `<button type="button" class="calendar-slot" data-slot-date="${date}" data-slot-time="${time}" aria-label="Запланировать урок: ${fmt(date)}, ${time}">＋</button>`;
}
function monthCalendar() {
  const month = calendarDate.slice(0, 7);
  const first = month + '-01';
  const date = new Date(first + 'T12:00');
  const offset = (date.getDay() + 6) % 7;
  const start = shiftCalendarDate(first, -offset);
  const lessons = ownLessons();
  const cells = Array.from({length: 42}, (_, index) => {
    const day = shiftCalendarDate(start, index);
    const count = lessons.filter(lesson => lesson.date === day).length;
    return `<button class="month-cell ${day.startsWith(month) ? '' : 'outside-month'}" data-calendar-date="${day}" ${day === localDay() ? 'aria-current="date"' : ''} aria-label="${fmt(day)}, занятий: ${count}"><strong>${Number(day.slice(-2))}</strong>${count ? `<span class="month-dot" aria-hidden="true"></span>` : ''}</button>`;
  }).join('');
  const label = date.toLocaleDateString('ru-RU', {month: 'long', year: 'numeric'});
  return `<section class="card"><div class="calendar-toolbar"><div><button class="secondary" data-calendar="today">Сегодня</button> <button class="secondary" data-calendar="prev" aria-label="Предыдущий месяц">←</button> <button class="secondary" data-calendar="next" aria-label="Следующий месяц">→</button></div><h2>${label}</h2>${calendarViews()}</div><div class="month-grid">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day => `<span>${day}</span>`).join('')}${cells}</div></section>`;
}

function zoomUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password &&
        ['zoom.us', 'zoom.com'].some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) return url.href;
  } catch {}
  return '';
}

function openLessonDetails(lesson) {
  const dialog = $('#lessonDetails');
  const pupil = student(lesson.studentId);
  const link = zoomUrl(lesson.zoom) || zoomUrl(data.defaultZoom);
  dialog.querySelector('h2').textContent = pupil.name;
  dialog.querySelector('.lesson-details-meta').textContent = fmt(lesson.date) + ' · ' + lesson.time + ' · ' + pupil.subject;
  const join = dialog.querySelector('.lesson-join');
  join.hidden = !link;
  join.href = link || '#';
  dialog.querySelector('.lesson-no-zoom').hidden = Boolean(link);
  const form = dialog.querySelector('form');
  form.hidden = user.role !== 'admin';
  form.elements.zoom.value = lesson.zoom || '';
  form.elements.defaultZoom.value = data.defaultZoom || '';
  form.onsubmit = event => {
    event.preventDefault();
    if (user?.role !== 'admin') return;
    const value = form.elements.zoom.value.trim();
    const address = zoomUrl(value);
    if (value && !address) {
      form.elements.zoom.setCustomValidity('Укажите HTTPS-ссылку на zoom.us или zoom.com.');
      form.elements.zoom.reportValidity();
      return;
    }
    const defaultValue = form.elements.defaultZoom.value.trim();
    const defaultAddress = zoomUrl(defaultValue);
    if (defaultValue && !defaultAddress) {
      form.elements.defaultZoom.setCustomValidity('Укажите HTTPS-ссылку на zoom.us или zoom.com.');
      form.elements.defaultZoom.reportValidity();
      return;
    }
    data.defaultZoom = defaultAddress;
    lesson.zoom = address;
    save();
    dialog.close();
    toast('Ссылка сохранена');
  };
  form.elements.zoom.setCustomValidity('');
  form.elements.zoom.oninput = () => form.elements.zoom.setCustomValidity('');
  form.elements.defaultZoom.setCustomValidity('');
  form.elements.defaultZoom.oninput = () => form.elements.defaultZoom.setCustomValidity('');
  dialog.showModal();
}

document.addEventListener('click', event => {
  const slot = event.target.closest('[data-slot-date]');
  if (slot && user?.role === 'admin') openForm('lesson', {date: slot.dataset.slotDate, time: slot.dataset.slotTime});
  const day = event.target.closest('[data-calendar-date]');
  if (day && user && currentPage === 'schedule') {
    calendarDate = day.dataset.calendarDate;
    calendarView = 'day';
    go('schedule');
    $('[data-calendar="day"]')?.focus();
  }
  const command = event.target.closest('[data-calendar]')?.dataset.calendar;
  if (command && user && currentPage === 'schedule') {
    if (command === 'today') calendarDate = localDay();
    else if (['day', 'week', 'month'].includes(command)) calendarView = command;
    else if (calendarView === 'month') {
      const date = new Date(calendarDate.slice(0, 7) + '-01T12:00');
      date.setMonth(date.getMonth() + (command === 'prev' ? -1 : 1));
      calendarDate = date.toLocaleDateString('sv-SE');
    }
    else calendarDate = shiftCalendarDate(calendarDate, (command === 'prev' ? -1 : 1) * (calendarView === 'week' ? 7 : 1));
    go('schedule');
    $(`[data-calendar="${command}"]`)?.focus();
  }
  const id = event.target.closest('[data-lesson-details]')?.dataset.lessonDetails;
  if (!user || !id) return;
  const lesson = ownLessons().find(item => String(item.id) === id);
  if (lesson) openLessonDetails(lesson);
});
function homeworkPage(){let hs=user.role==='admin'?data.homework:data.homework.filter(x=>x.studentId===user.studentId);return `<div class="section-head"><div><h2>Домашние задания</h2><p>${user.role==='admin'?'Создавайте и проверяйте задания':'Задания от преподавателя'}</p></div>${user.role==='admin'?'<button class="primary" data-add="homework">＋ Задание</button>':''}</div><div class="card">${hs.map(x=>{let s=student(x.studentId);return `<div class="lesson-row"><div><input type="checkbox" data-check="${x.id}" ${x.done?'checked':''} ${user.role!=='admin'?'disabled':''}></div><div class="student-cell"><div>${escapeHtml(x.title)}<small>${escapeHtml(s.name)} · до ${fmt(x.due)}</small>${homeworkAttachmentButtons(x)}</div></div><span class="status ${x.done?'':'warn'}">${x.done?'Выполнено':'В работе'}</span></div>`}).join('')||'<div class="empty">Заданий нет</div>'}</div>`}
let selectedMonth = '';
function monthlyInvoices(month) {
  const pupils = user.role === 'admin' ? data.students : data.students.filter(pupil => pupil.id === user.studentId);
  return pupils.flatMap(pupil => {
    const saved = data.monthlyPayments?.[month + ':' + pupil.id];
    return saved ? [{ pupil, ...saved, scheduled: lessonSubscription(pupil.id, month + '-01').scheduled }] : [];
  });
}
function invoiceRows(invoices) {
  return invoices.map(({pupil, count, amount, paid, scheduled}) => `<div class="lesson-row invoice-row"><div class="student-cell">${escapeHtml(pupil.name)}</div><div>Запланировано: ${scheduled} из ${count}<br><b>${money(amount)}</b></div><div class="lesson-price"><span class="status ${paid ? '' : 'warn'}">${paid ? 'Оплачено' : 'Ждёт оплаты'}</span>${user.role === 'admin' && currentPage === 'payments' ? `<button class="${paid ? 'secondary' : 'primary'} confirm-payment" data-invoice="${pupil.id}">${paid ? 'Вернуть в ожидание' : 'Подтвердить перевод'}</button>` : ''}</div></div>`).join('') || '<p class="empty">За этот месяц абонементов пока нет</p>';
}
function paymentsPage() {
  const month = selectedMonth || localDay().slice(0, 7);
  return `<section class="card"><div class="card-head"><h2>Абонементы</h2>${user.role === 'admin' ? '<button class="primary" data-add="subscription">Создать абонемент</button>' : ''}<label>Месяц <input type="month" id="billingMonth" value="${month}"></label></div>${invoiceRows(monthlyInvoices(month))}</section>`;
}
function slotsPage(){return `<div class="section-head"><div><h2>Свободные окна</h2><p>${user.role==='admin'?'Настройте время, которое увидят семьи':'Уточните запись у Саши'}</p></div>${user.role==='admin'?'<button class="primary" data-add="slot">＋ Добавить окно</button>':''}</div><div class="grid slot-layout">${data.slots.filter(slot=>slot.date>=localDay()).map(x=>`<div class="card"><small style="color:var(--purple);font-weight:800">${fmt(x.date)}</small><h2 style="font-size:24px;margin:8px 0">${x.time}</h2><p style="font-size:8px;color:var(--muted)">${x.duration} минут</p>${user.role==='admin'?'<span class="status">Опубликовано</span>':'<span class="status">Свободно</span>'}</div>`).join('')}</div>`}
function go(page){if (!user || !navs[user.role].some(item => item[0] === page)) return;currentPage=page;$$('.nav-button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));let titles={dashboard:user.role==='admin'?'Добрый день, Саша!':'Личный кабинет',students:'Ученики',schedule:'Расписание',homework:'Домашние задания',payments:'Оплаты за месяц',slots:'Свободные окна',access:'Доступ',messages:'Сообщения'};$('#pageTitle').textContent=titles[page];$('#primaryAction').style.display=user.role==='admin'?'block':'none';let html=page==='dashboard'?(user.role==='admin'?adminDashboard():personalDashboard()):page==='students'?studentsPage():page==='schedule'?schedulePage():page==='homework'?homeworkPage():page==='payments'?paymentsPage():page==='access'?accessPage():page==='messages'?messagesPage():slotsPage();$('#content').innerHTML=html;refreshChatNotifications()}
const field=(l,n,t='text',full=false)=>`<div class="field ${full?'full':''}"><label for="field-${n}">${l}</label><input id="field-${n}" name="${n}" type="${t}" ${n==='price'?'min="0" step="0.01"':(n==='duration'||n==='count')?'min="1"':''} required></div>`,studentSelect=()=>`<div class="field full"><label for="field-studentId">Ученик</label><select id="field-studentId" name="studentId" required>${data.students.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}</select></div>`;
function openForm(type, preset = {}){if(user?.role!=='admin') return;let map={subscription:['Оплаты','Новый абонемент'],student:['Карточка ученика','Новый ученик'],lesson:['Расписание','Запланировать урок'],homework:['Обучение','Новое задание'],slot:['Расписание','Свободное окно']},body='';$('#modalKicker').textContent=map[type][0];$('#modalTitle').textContent=map[type][1];$('#modalForm').dataset.type=type;if(type==='subscription')body=studentSelect()+field('Месяц','month','month')+field('Количество занятий','count','number')+field('Сумма, ₽','price','number');if(type==='student')body=field('Имя ученика','name')+field('Имя родителя','parent')+field('Телефон','phone','tel')+field('Направление','subject')+field('Цена занятия','price','number');if(type==='lesson')body=studentSelect()+field('Дата','date','date')+field('Время','time','time')+'<p id="lessonSubscriptionNote" class="field full subscription-note" aria-live="polite"></p><label class="field full calendar-notify"><span><input type="checkbox" name="notify" value="yes"> Показать уведомление в кабинете семьи</span></label>';if(type==='homework')body=studentSelect()+field('Задание','title', 'text',true)+field('Срок','due','date')+homeworkAttachmentField();if(type==='slot')body=field('Дата','date','date')+field('Время','time','time')+field('Длительность, минут','duration','number');$('#modalBody').innerHTML=body;if(type==='subscription')$('#modalForm').elements.month.value=selectedMonth||localDay().slice(0,7);if(type==='lesson'){const form=$('#modalForm');form.elements.date.value=preset.date||'';form.elements.time.value=preset.time||'';const update=()=>previewLessonSubscription(form);form.elements.studentId.onchange=update;form.elements.date.onchange=update;update()}$('#modal').showModal();$('#modalBody').querySelector('input, select')?.focus()}
$('#modalForm').onsubmit=async e=>{e.preventDefault();if(user?.role!=='admin')return;let f=Object.fromEntries(new FormData(e.target)),t=e.target.dataset.type;f.id=Date.now();if(t==='subscription'){
  if (!createSubscription(f)) return;
  $('#modal').close();
  go('payments');
  toast('Абонемент создан');
  return;
}if(t==='student'){f.price=+f.price;f.status='Активен';data.students.push(f)}if(t==='lesson'){
  f.studentId = Number(f.studentId);
  if (!student(f.studentId)) return;
  const { subscription, scheduled } = lessonSubscription(f.studentId, f.date);
  if (subscription && scheduled >= subscription.count) {
    toast('На выбранный месяц уже запланированы все уроки пакета');
    return;
  }
  if (data.lessons.some(lesson => lesson.date === f.date && lesson.time === f.time)) {
    toast('На это время уже запланирован урок');
    return;
  }
  if (currentPage === 'schedule') calendarDate = f.date;
  data.lessons.push(f);
}if(t==='homework'){
  f.studentId = Number(f.studentId);
  f.done = false;
  try {
    f.attachments = await saveHomeworkAttachments(e.target);
  } catch (error) {
    toast(error.message);
    return;
  }
  data.homework.push(f);
}if(t==='slot'){f.duration=+f.duration;data.slots.push(f)}save();$('#modal').close();go(currentPage);toast('Сохранено')};
document.onclick=e=>{let p=e.target.closest('[data-page]'),a=e.target.closest('[data-add]');if(p)go(p.dataset.page);if(a)openForm(a.dataset.add);const invoice=e.target.closest('[data-invoice]');if(invoice&&user?.role==='admin')updateInvoice(Number(invoice.dataset.invoice));if(user?.role==='admin'&&e.target.dataset.check){data.homework.find(x=>x.id==e.target.dataset.check).done=e.target.checked;save();go(currentPage)}if(e.target.closest('[data-dismiss-modal]'))e.target.closest('dialog').close()};$('#primaryAction').onclick=()=>openForm('lesson');
function toast(t){let x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
document.addEventListener('input', event => {
  if (!event.target.matches('.search')) return;
  const query = event.target.value.trim().toLowerCase();
  for (const row of $$('.table-row')) row.hidden = !row.textContent.toLowerCase().includes(query);
});
document.addEventListener('change', event => {
  if (event.target.id !== 'billingMonth' || !/^\d{4}-\d{2}$/.test(event.target.value)) return;
  selectedMonth = event.target.value;
  go('payments');
});
function updateInvoice(studentId) {
  const month = selectedMonth || localDay().slice(0, 7);
  const invoice = monthlyInvoices(month).find(item => item.pupil.id === studentId);
  if (!invoice) return;
  data.monthlyPayments ??= {};
  const key = month + ':' + studentId;
  data.monthlyPayments[key] = {paid: !invoice.paid, count: invoice.count, amount: invoice.amount};
  save();
  go('payments');
  toast(invoice.paid ? 'Оплата возвращена в ожидание' : 'Оплата за месяц подтверждена');
}
function createSubscription(form) {
  const pupil = student(form.studentId);
  const count = Number(form.count);
  const amount = Number(form.price);
  if (!pupil || !/^\d{4}-(0[1-9]|1[0-2])$/.test(form.month) ||
      !Number.isSafeInteger(count) || count < 1 || !form.price || !Number.isFinite(amount) || amount < 0) {
    toast('Проверьте ученика, месяц, число занятий и сумму');
    return false;
  }
  data.monthlyPayments ??= {};
  const key = form.month + ':' + pupil.id;
  const { scheduled } = lessonSubscription(pupil.id, form.month + '-01');
  if (scheduled > count) {
    toast(`Уже запланировано занятий: ${scheduled}. Укажите не меньше.`);
    return false;
  }
  if (data.monthlyPayments[key]) {
    toast('У этого ученика уже есть абонемент на выбранный месяц');
    return false;
  }
  data.monthlyPayments[key] = {count, amount, paid: false};
  selectedMonth = form.month;
  save();
  return true;
}
