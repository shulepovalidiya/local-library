/**
 * Сортирует объект по числовому полю
 * @param objects
 * @param field
 * @return {*}
 */
export function sortObjectsByNumberField(objects, field) {
  return objects.sort((a, b) => b[field] - a[field]);
}

/**
 * Сортирует объект по строковому полю
 * @param objects
 * @param field
 * @return {*}
 */
export function sortObjectsByStringField(objects, field) {
  return objects.sort((a, b) => a[field].localeCompare(b[field]));
}