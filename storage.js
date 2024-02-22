import {Book} from "./book.js";
import {sortObjectsByNumberField, sortObjectsByStringField} from "./utils.js";

export class Storage {
  constructor(localStorageKey) {
    this.key = localStorageKey
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

  sortBy(sort) {
    let isSorted = false
    switch (sort) {
      case "Рейтинг":
        this.books = sortObjectsByNumberField(this.books, "rating")
        isSorted = true
        break;
      case "Год":
        this.books = sortObjectsByNumberField(this.books, "year")
        isSorted = true
        break;
      case "Жанр":
        this.books = sortObjectsByStringField(this.books, "genre");
        isSorted = true
        break;
    }
    return isSorted
  }
}