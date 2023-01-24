function Clear(Sheet, Data) {
  let lastRow = Sheet.getLastRow();
  if (lastRow > Data.length) {
    Sheet.deleteRows(Data.length + 1, lastRow - Data.length);
  }
}
