function GetDate(addDays = 0) {
  let date = new Date();
  date.setDate(date.getDate() + addDays);
  return date.toLocaleDateString('en-us', options);
}

function convertDate(date) {
  try{
    return date.toLocaleDateString('en-us', options);
  }
  catch{
    return 'NULL';
  }
}

function cmp2(a, b) {
  for (let i = a.length - 1; i > 0; i--) {
    if (a[i] != b[i])
      return (a[i] > b[i] ? -1 : 1); // last accepteds
  }
  return (a[0] < b[0] ? -1 : 1); // handle's links
}

function calculate_average(data) {
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let sum = 0, count = 0;
    for (let j = 2; j < row.length; j++) {
      if (typeof row[j] === "number" && !isNaN(row[j])) {
        sum += row[j];
        count++;
      }
    }
    const avg = (count > 0 ? parseFloat((sum / count).toFixed(1)) : 0);
    data[i][1] = avg;
  }
  count = data[0].length - 2;
  data[0][1] = `Average: ${count} Days`;
}

function reverse_data(data) {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const reversedRow = row.slice(2).reverse();
    data[i] = [row[0], row[1]].concat(reversedRow);
  }
}

function Analysis(Contestants) {
  let AnalysisSheet = SpreadsheetApp.getActive().getSheetByName('Analysis');
  let StandingSheet = SpreadsheetApp.getActive().getSheetByName('Standing');

  let analysisData = AnalysisSheet.getDataRange().getValues();
  let standingData = StandingSheet.getDataRange().getValues();

  if (standingData.length == 1) {
    analysisData = [['Handle \\ Date', 'Average: 1 Day', GetDate()]];
    for (let contestant of Contestants) {
      analysisData.push([contestant.handle, 0, 0]);
    }
    Clear(AnalysisSheet, analysisData);
    analysisData.sort(cmp2);
    AnalysisSheet.getRange(1, 1, analysisData.length, analysisData[0].length).setValues(analysisData);
    return;
  }

  let AnalysisObj = {};
  for (let contestant of Contestants) {
    let handle = contestant.handle;
    let totalAccepted = contestant.GetTotalAccepted();
    AnalysisObj[handle] = totalAccepted;
  }

  for (let row = 1; row < standingData.length; row++) {
    let handle = standingData[row][0];
    if(!(handle in AnalysisObj))
      continue;
    let lastTotalAccepted = standingData[row][1];
    AnalysisObj[handle] -= lastTotalAccepted;
  }
  reverse_data(analysisData);
  let lastColumn = AnalysisSheet.getLastColumn() - 1;
  let curDate = GetDate();

  if (curDate != convertDate(analysisData[0][lastColumn])) { // new day
    lastColumn++;
    analysisData[0].push(curDate);
    for (let row = 1; row < analysisData.length; row++) {
      analysisData[row].push(0);
    }
  }

  for (let row = 1; row < analysisData.length; row++) { // add new ac
    let handle = analysisData[row][0];
    if(!(handle in AnalysisObj)){
      analysisData.splice(row--, 1);
      continue;
    }
    let val = parseInt(analysisData[row][lastColumn]) + AnalysisObj[handle];
    analysisData[row][lastColumn] = val;
    delete AnalysisObj[handle];
  }

  // there are new contestants
  for (const [handle, value] of Object.entries(AnalysisObj)) {
    let tmpArray = Array(lastColumn).fill('#NULL');
    tmpArray[0] = handle;
    tmpArray.push(0);
    analysisData.push(tmpArray);
  }

  Clear(AnalysisSheet, analysisData);
  analysisData.sort(cmp2);
  calculate_average(analysisData);
  reverse_data(analysisData);
  AnalysisSheet.getRange(1, 1, analysisData.length, analysisData[0].length).setValues(analysisData);
}
