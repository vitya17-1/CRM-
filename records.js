function documentStore(mode, action) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('uroki-demo-pdfs', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('files', {autoIncrement: true});
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('files', mode);
      const request = action(transaction.objectStore('files'));
      transaction.oncomplete = () => { db.close(); resolve(request.result); };
      transaction.onabort = () => { db.close(); reject(transaction.error); };
    };
  });
}

let activeDocumentStudent;
let documentLoad = 0;
async function renderDocuments() {
  const studentId = activeDocumentStudent;
  const load = ++documentLoad;
  const status = $('#docsStatus');
  const list = $('#docsList');
  list.replaceChildren();
  status.textContent = 'Загружаем список…';
  try {
    const records = await documentStore('readonly', store => store.getAll());
    if (load !== documentLoad || !$('#docs').open || user?.role !== 'admin') return;
    const files = records.filter(record => record.studentId === studentId);
    status.textContent = files.length ? '' : 'Документов пока нет.';
    for (const {file} of files) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'text-btn';
      button.textContent = 'Скачать ' + file.name;
      button.onclick = () => {
        if (user?.role !== 'admin') return;
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      item.append(button);
      list.append(item);
    }
  } catch {
    if (load === documentLoad) status.textContent = 'Хранилище PDF недоступно.';
  }
}

document.addEventListener('click', event => {
  const id = Number(event.target.closest('[data-docs]')?.dataset.docs);
  if (user?.role !== 'admin' || !student(id)) return;
  activeDocumentStudent = id;
  $('#docsTitle').textContent = 'Документы · ' + student(id).name;
  resetDocumentPicker();
  $('#docs').showModal();
  renderDocuments();
});

$('#docsForm').onsubmit = async event => {
  event.preventDefault();
  if (user?.role !== 'admin') return;
  const studentId = activeDocumentStudent;
  const file = $('#docsFile').files[0];
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  try {
    if (!file || !/\.pdf$/i.test(file.name) || file.size > 10 * 1024 * 1024 ||
        await file.slice(0, 5).text() !== '%PDF-') {
      $('#docsStatus').textContent = 'Выберите PDF размером до 10 МБ.';
      return;
    }
    await documentStore('readwrite', store => store.add({studentId, file}));
    if ($('#docs').open && activeDocumentStudent === studentId) {
      resetDocumentPicker();
      await renderDocuments();
    }
  } catch {
    $('#docsStatus').textContent = 'Не удалось сохранить PDF.';
  } finally {
    button.disabled = !$('#docsFile').files.length;
  }
};

const submitLogin = $('#loginForm').onsubmit;
function syncDocumentPicker() {
  const file = $('#docsFile').files[0];
  $('#docsFilename').textContent = file?.name || 'PDF до 10 МБ';
  $('#docsForm button').disabled = !file;
}

function resetDocumentPicker() {
  $('#docsForm').reset();
  syncDocumentPicker();
}

$('#docsFile').addEventListener('change', syncDocumentPicker);
$('#loginForm').onsubmit = event => {
  if ($('#loginInput').value.trim().toLowerCase() !== 'parent' ||
      $('#passwordInput').value !== accounts.parent.password) return submitLogin(event);
  event.preventDefault();
  $('#loginError').textContent = '';
  $('#consentForm').reset();
  $('#consent').showModal();
};
$('#consentForm').onsubmit = event => {
  event.preventDefault();
  user = {login: 'parent', ...accounts.parent};
  $('#consent').close();
  enterApp();
};
