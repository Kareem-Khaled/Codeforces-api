function Get_Seeds() {
  let SeedsSheet = SpreadsheetApp.getActive().getSheetByName("Seeds");
  let urls = SeedsSheet.getRange('A:A').getValues();
  
  urls = urls.filter(cell => cell[0] != "");
  handlesList = urls.shift()[0].split('/').pop();

  urls = urls.map(url => {
    if (Array.isArray(url)) {
      url = url[0];
    }
    let path = url.split("/group/")[1];
    let groupName = path.split("/")[0];
    let contestNumber = path.split("/")[2];
    return [groupName, contestNumber];
  });
  
  return [handlesList, urls];
}
