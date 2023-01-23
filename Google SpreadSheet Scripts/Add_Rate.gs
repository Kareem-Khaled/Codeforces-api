let rankColor = {
  'undefined' : '#000000',
  'newbie': '#747474',
  'pupil': '#34a853',
  'specialist': '#4dd0e1',
  'expert': '#4a86e8',
  'candidate master': '#9900ff'
}

function Add_Rate(){
    let sheet = SpreadsheetApp.getActive().getSheetByName("Standing");
    let range = sheet.getRange('A:A');
    let handles = range.getValues();
    let colors = [['#ffffff']], i = 1;
    while(i < handles.length){
      let link = 'https://codeforces.com/api/user.info?handles=';
      for(;i< handles.length; i++){
          link += handles[i] + ';';
          if(i % 150 == 0){
             i++;
             break;
          }
      }
      let res = JSON.parse(UrlFetchApp.fetch(link).getContentText())['result'];
      let ranks = res.map(val => val.rank);
      for(rank of ranks){
        colors.push([rankColor[rank]]);
      }
    }
    range.setFontColors(colors);
}
