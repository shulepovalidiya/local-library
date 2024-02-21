import {Book} from "./book.js";

export class Storage {
  constructor(localStorageKey) {
    this.key = localStorageKey;
  }

  get books() {
    if (this.hasBooks) {
      return JSON.parse(localStorage.getItem(this.key)).map(book => {
        try {
          return new Book(book)
        } catch (e) {
          console.log('invalid localStorage', book, e)
        }
      })
    }
    return [];
  }

  set books(books) {
    localStorage.setItem(this.key, JSON.stringify(books))
  }

  get hasBooks() {
    return localStorage.length > 0;
  }

}