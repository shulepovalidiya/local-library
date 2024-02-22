import {Storage} from "./storage.js";
import {Book} from "./book.js";

/**
 * Объект для работы с localStorage
 * @type {Storage}
 */
const storage = new Storage('books');

/**
 * Контейнер для списка книг
 * @type {Element}
 */
const container = document.querySelector(".books-list")

/**
 * Форма для добавления новой книги
 * @type {Element}
 */
const addBookForm = document.querySelector(".add-book-form")

/**
 * Кнопка экспорта
 * @type {Element}
 */
const exportButton = document.querySelector(".add-book-form__export")

/**
 * Select для сортировки
 * @type {Element}
 */
const sortSelect = document.querySelector(".sort-books-select")

/**
 * Кнопка импорта
 * @type {Element}
 */
const importButton = document.querySelector(".add-book-form__import-button")

/**
 * Поле ввода для импорта базы книг
 * @type {Element}
 */
const importTextarea = document.querySelector(".add-book-form__import")

// Рендерим список книг при открытии страницы
if (storage.books?.length > 0) {
  renderBooks()
  exportButton.removeAttribute("disabled")
}

/**
 *  общий eventListener для книг - ловит события кликов по кнопкам редактирования и удаления, обрабатывает их
 */
container.addEventListener('click', (e) => {
  // элемент по которому кликнули
  const eventTarget = e.target

  // удаление
  if (eventTarget.classList.contains('book__delete-button')) {
    const bookUUID = eventTarget.parentNode.getAttribute('data-book-id')
    if (!bookUUID) {
      return
    }
    removeBookByUUID(bookUUID)
  }

  // редактирование
  if (eventTarget.classList.contains('book__edit-button')) {
    const bookUUID = eventTarget.parentNode.getAttribute('data-book-id')
    if (!bookUUID) {
      return
    }

    const currentBook = storage.books.find(el => el.uuid === bookUUID)
    let newData = prompt("Отредактируйте данные: ", JSON.stringify(currentBook.toExport()))
    updateBookByUUID(bookUUID, new Book({
      ...JSON.parse(newData),
      uuid: bookUUID
    }))
    //запускаем сортировку, чтобы она соответствовала выбранной на данный момент
    if (sortSelect?.value) {
      changeBooksSort(sortSelect?.value)
    }
  }
})

/**
 * Рендер книг - рендерит список книг из storage
 */
function renderBooks() {
  storage.books.forEach(book => addBookElementToDom(generateBookElement(book)))
}

/**
 * Ререндер книг - удаляет все существубющие из списка и рендерит заново из storage
 */
function reRenderBooks() {
  // удалить все старые
  document.querySelectorAll('[data-book-id]').forEach(bookDomElement => bookDomElement.remove());

  // отрендерить все что есть в localStorage
  renderBooks()
}

/**
 * Удаляет книгу из DOM и из storage
 * @param uuid
 */
function removeBookByUUID(uuid) {
  document.querySelector(`[data-book-id="${uuid}"]`).remove();
  storage.books = storage.books.filter(storageBook => storageBook.uuid !== uuid)
}

/**
 * Редактирует книгу в DOM и в storage
 * @param uuid
 * @param newBook
 */
function updateBookByUUID(uuid, newBook) {
  let bookForEdit = document.querySelector(`[data-book-id="${uuid}"]`);
  bookForEdit.querySelector(".book__title").textContent = newBook.getAll;
  storage.books = storage.books.map(storageBook => storageBook.uuid === uuid ? newBook : storageBook)
}

/**
 * Создаёт элемент книги
 * @param book
 * @returns {Node}
 */
function generateBookElement(book) {
  const bookElement = document.querySelector(".book-template").content.cloneNode(true);
  bookElement.querySelector(".book__title").textContent = book.getAll;
  bookElement.querySelector("li").setAttribute("data-book-id", book.uuid)
  return bookElement;
}

/**
 * Добавляет узел с книгой в DOM
 * @param bookElement
 * @return void
 */
function addBookElementToDom(bookElement) {
  container.appendChild(bookElement)
}

/**
 * Запуск Экспорта
 * @param storage
 */
function exportBooks(storage) {
  const blob = new Blob([JSON.stringify(storage.books.map(book => book.toExport()))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const exportLink = document.createElement('a');
  exportLink.href = url;
  exportLink.download = 'books.json';
  exportLink.click();
  URL.revokeObjectURL(url);
}

/**
 * Обработчик сабмита формы — создаёт книгу и добавляет в DOM
 */
addBookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(addBookForm);
  const bookData = {
    title: formData.get("title"),
    author: formData.get("author"),
    year: formData.get("year"),
    genre: formData.get("genre"),
    rating: formData.get("rating"),
  }
  const book = new Book(bookData);
  addBookElementToDom(generateBookElement(book));
  storage.books = [...storage.books, book]
  // нужно запустить сортировку, чтобы соответствовала тому какая выбрана сечас
  if (sortSelect?.value) {
    changeBooksSort(sortSelect?.value)
  }
  addBookForm.reset();
})

/**
 * Обработчик для кнопки экспорта
 */
exportButton.addEventListener("click", () => exportBooks(storage))

/**
 * Обработчик для кнопки импорта
 */
importButton.addEventListener('click', () => {
  try {
    let books = JSON.parse(importTextarea.value)
    if (books.length === 0) {
      return;
    }
    storage.books = books.map(book => new Book(book))
  } catch (e) {
    console.log('неверный ипорт', e)
    return
  }
  importTextarea.value = ''
})

/**
 * обработчик для селекта сортировки
 */
sortSelect.addEventListener("change", (e) => {
  changeBooksSort(e.target.options[e.target.selectedIndex].value)
})

/**
 * Меняет сортировку в storage и в списке
 * @param sort
 */
function changeBooksSort(sort) {
  const isSorted = storage.sortBy(sort)
  if (isSorted) {
    reRenderBooks()
  }
}
