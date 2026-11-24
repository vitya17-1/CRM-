function homeworkAttachmentField() {
  return `<div class="field full"><label class="pdf-picker">
    <input type="file" name="homeworkFiles" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.docx,.txt" aria-label="Добавить файлы">
    <span class="secondary pdf-picker-button" aria-hidden="true">+ Добавить файлы</span>
    <span id="homeworkFileNames" aria-live="polite">Картинки, PDF, DOCX и TXT · до 10 МБ всего</span>
  </label></div>`;
}

async function saveHomeworkAttachments(form) {
  const files = Array.from(form.elements.homeworkFiles.files);
  if (!files.length) return [];
  if (files.length > 10 || files.reduce((sum, file) => sum + file.size, 0) > 10 * 1024 * 1024 ||
      files.some(file => !/\.(png|jpe?g|webp|gif|pdf|docx|txt)$/i.test(file.name))) {
    throw new Error('Выберите до 10 поддерживаемых файлов общим размером до 10 МБ.');
  }
  const submit = form.querySelector('button[type="submit"], .modal-actions .primary');
  submit.disabled = true;
  try {
    const id = await documentStore('readwrite', store => store.add({homeworkFiles: files}));
    return files.map((file, index) => ({id, index, name: file.name}));
  } catch {
    throw new Error('Не удалось сохранить вложения в этом браузере.');
  } finally {
    submit.disabled = false;
  }
}

function homeworkAttachmentButtons(task) {
  return (task.attachments || []).map((file, index) =>
    `<button type="button" class="text-btn homework-file" data-homework-file="${task.id}" data-file-index="${index}">↓ ${escapeHtml(file.name)}</button>`).join('');
}

document.addEventListener('change', event => {
  if (event.target.name !== 'homeworkFiles') return;
  $('#homeworkFileNames').textContent = Array.from(event.target.files, file => file.name).join(', ') ||
    'Картинки, PDF, DOCX и TXT · до 10 МБ всего';
});

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-homework-file]');
  if (!button || !user) return;
  const account = user;
  const task = data.homework.find(item => String(item.id) === button.dataset.homeworkFile &&
    (account.role === 'admin' || item.studentId === account.studentId));
  const attachment = task?.attachments?.[Number(button.dataset.fileIndex)];
  if (!attachment) return;
  try {
    const group = await documentStore('readonly', store => store.get(attachment.id));
    const file = group?.homeworkFiles?.[attachment.index];
    if (!file) throw new Error('Missing attachment');
    if (user !== account) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    toast('Вложение недоступно в этом браузере.');
  }
});
