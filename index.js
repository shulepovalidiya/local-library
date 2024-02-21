import {Storage} from "./storage.js";
import {Book} from "./book.js";

const storage = new Storage('books');

const container = document.querySelector(".books-list")
const addBookForm = document.querySelector(".add-book-form")
const exportButton = document.querySelector(".add-book-form__export")
const select = document.querySelector(".sort-books-select")

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateBookElement(book) {
  const bookElement = document.querySelector(".book-template").content.cloneNode(true);
  bookElement.querySelector(".book__title").textContent = book.getAll;
  bookElement.querySelector(".book__delete-button").addEventListener("click", (e) => {
    e.target.parentNode.remove();
    storage.books = storage.books.filter(storageBook => storageBook.uuid !== book.uuid)
  })
  bookElement.querySelector(".book__edit-button").addEventListener("click", (e) => {
    let newData = prompt("Отредактируйте данные: ", book.toExport())
    if (newData !== null) {
      storage.books = storage.books.map(
        storageBook => storageBook.uuid === book.uuid ? JSON.parse(newData) : storageBook
      )
    }
    location.reload();
  })
  return bookElement;
}

function addBookElementToDom(bookElement) {
  container.appendChild(bookElement)
}

function exportBooksToJson(storage) {
  const blob = new Blob([storage.books.map(book => book.toExport())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const exportLink = document.createElement('a');
  exportLink.href = url;
  exportLink.download = 'books.json';
  exportLink.click();
  URL.revokeObjectURL(url);
}

if (storage.books?.length > 0) {
  storage.books.forEach(book => addBookElementToDom(generateBookElement(book)))
  exportButton.removeAttribute("disabled")
}

addBookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(addBookForm);
  const bookData = {
    title: formData.get("title"),
    author: formData.get("author"),
    year: formData.get("year"),
    genre: formData.get("genre"),
    rating: formData.get("rating"),
    uuid: generateUUID(),
  }
  const book = new Book(bookData);
  addBookElementToDom(generateBookElement(book));
  storage.books = [...storage.books, book]
  addBookForm.reset();
})

exportButton.addEventListener("click", () => exportBooksToJson(storage))

function sortBooksByValue(books, value) {
  return books.sort((a, b) => b[value] - a[value]);
}

select.addEventListener("change", (e) => {
  switch(e.target.options[e.target.selectedIndex].value) {
    case "Рейтинг":
      storage.books = sortBooksByValue(storage.books, "rating")
      location.reload();
      break;
    case "Год":
      storage.books = sortBooksByValue(storage.books, "year")
      location.reload();
      break;
    case "Жанр":
      storage.books = storage.books.sort((a, b) => a.localeCompare(b));
      break;
  }
})