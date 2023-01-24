let minPro = 10, maxPro = 15;

const options = { year: 'numeric', month: 'short', day: 'numeric' }

function nextFriday(dayOfWeek = 5) {
  date = new Date();
  date.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay()) % 7);
  return date.toLocaleDateString('en-us', options);

}

function Add_Tasks() {
  let TasksSheet = SpreadsheetApp.getActive().getSheetByName("Tasks");
  let Standing = SpreadsheetApp.getActive().getSheetByName("Standing");
  let rows = Standing.getDataRange().getNumRows();

  let tasks = [];
  for(let i = 2; i <= rows; i++){
    let data = Standing.getRange(`${i}:${i}`).getValues();
    let toSolve = {
      handle: data[0][0],
      all : 0,
      sheets: []
    };
    for(let j = 2; j < data[0].length; j++){
      let cell = data[0][j];
      if(cell.toString().includes(':)')) continue
      if(cell.includes(':('))
        cell = cell.slice(0, -2);
      let [a, b] = cell.toString().split(' / ');
      // Logger.log(a);
      if(toSolve.all + (b - a) > maxPro) {
        if(toSolve.all < minPro){
          toSolve.all += (b - a);
          toSolve.sheets.push(j);
        }
        break;
      }
      toSolve.all += (b - a);
      toSolve.sheets.push(j);
    }
    tasks.push(toSolve);
    // break;
  }
  let sheetsName = {};
  let sheetsNames = Standing.getRange(`${1}:${1}`).getValues();
  for(let j = 2; j < sheetsNames[0].length; j++){
    let str = sheetsNames[0][j].toString().replace('Juniors Phase 1', 'J.Ph1')
    sheetsName[j] = str;
  }
  let finalTasks = [['Task']];
  let finalHandles = [['Handle']];
  for(let task of tasks){
    finalHandles.push([task.handle]);
    let newTask = 'Finish('; 
    for(let cell of task.sheets){
      newTask += sheetsName[cell] + ', ';
    }
    if(newTask == 'Finish(')
      newTask = 'Great Job :)';
    else
      newTask = newTask.slice(0, -2) + ')';
    finalTasks.push([newTask]);
  }
  Clear(TasksSheet, finalTasks);
  TasksSheet.getRange(1, 1, finalHandles.length, 1).setValues(finalHandles);
  TasksSheet.getRange(1, 2, finalTasks.length, 1).setValues(finalTasks);
  TasksSheet.getRange('c1:c1').setValue('Deadline');
  TasksSheet.getRange(2, 3, finalTasks.length - 1, 1).setValue(nextFriday());
}
