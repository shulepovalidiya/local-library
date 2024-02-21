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

function renderBooks() {
  storage.books.forEach(book => addBookElementToDom(generateBookElement(book)))
}

function reRenderBooks() {
  // удалить все старые
  const allBooks = document.querySelectorAll('[data-book-id]');
  const uuidsForDelete = new Set(storage.books.map(book => book.uuid))
  allBooks.forEach(bookDomElement => {
    if (uuidsForDelete.has(bookDomElement.getAttribute('data-book-id'))) {
      bookDomElement.remove()
    }
  });

  // отрендерить все что есть в localStorage
  renderBooks()
}

/**
 * Создаёт элемент книги
 * @param book
 * @returns {Node}
 */
function generateBookElement(book) {
  const bookElement = document.querySelector(".book-template").content.cloneNode(true);
  bookElement.querySelector(".book__title").textContent = book.getAll;
  bookElement.querySelector(".book__delete-button").addEventListener("click", (e) => {
    e.target.parentNode.remove();
    storage.books = storage.books.filter(storageBook => storageBook.uuid !== book.uuid)
  })
  bookElement.querySelector(".book__edit-button").addEventListener("click", () => {
    let newData = prompt("Отредактируйте данные: ", JSON.stringify(book.toExport()))
    if (newData === null) {
      return
    }
    storage.books = storage.books.map(
      storageBook => storageBook.uuid === book.uuid ? new Book({
        ...JSON.parse(newData),
        uuid: book.uuid
      }) : storageBook
    )
    reRenderBooks();
  })
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
 * Сортирует объект по числовому полю
 * @param books
 * @param field
 * @return {*}
 */
function sortBooksByNumberField(books, field) {
  return books.sort((a, b) => b[field] - a[field]);
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
  switch(e.target.options[e.target.selectedIndex].value) {
    case "Рейтинг":
      storage.books = sortBooksByNumberField(storage.books, "rating")
      reRenderBooks();
      break;
    case "Год":
      storage.books = sortBooksByNumberField(storage.books, "year")
      reRenderBooks();
      break;
    case "Жанр":
      storage.books = storage.books.sort((a, b) => a.genre.localeCompare(b.genre));
      reRenderBooks();
      break;
  }
})
