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

function Analysis(Contestants) {
  let AnalysisSheet = SpreadsheetApp.getActive().getSheetByName('Analysis');
  let StandingSheet = SpreadsheetApp.getActive().getSheetByName('Standing');

  let analysisData = AnalysisSheet.getDataRange().getValues();
  let standingData = StandingSheet.getDataRange().getValues();

  if (analysisData[0].length == 1) {
    analysisData = [['Handle \\ Date', GetDate()]];
    for (let contestant of Contestants) {
      analysisData.push([contestant.handle, 0]);
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
  AnalysisSheet.getRange(1, 1, analysisData.length, analysisData[0].length).setValues(analysisData);
}
