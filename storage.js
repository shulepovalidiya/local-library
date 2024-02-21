import {Book} from "./book.js";

export class Storage {
  constructor(localStorageKey) {
    this.key = localStorageKey;
  }

  get books() {
      return JSON.parse(localStorage.getItem(this.key) || "[]").map(book => {
        try {
          return new Book(book)
        } catch (e) {
          console.log('invalid localStorage', book, e)
        }
      })
  }

  set books(books) {
    localStorage.setItem(this.key, JSON.stringify(books))
  }

  get hasBooks() {
    return this.books.length > 0;
  }

}