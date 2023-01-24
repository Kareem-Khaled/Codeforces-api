let Contestants = [], Contests = [], StandingData = [['Handle \\ Sheet', 'Total']];

function cmp(a, b) {
  if (a[1] == b[1]) {
    return (a[0] < b[0] ? -1 : 1); // handle's links
  }
  return (a[1] > b[1] ? -1 : 1); // total ac
}

function Get_Accepted() {
  let [handlesList, standings] = Get_Seeds();
  let standingNumber = -1;
  for (standing of standings) {
    standingNumber++;
    let lastContestants = {};
    for (let page = 1; ; page++) {
      let link = `https://codeforces-api.netlify.app/.netlify/functions/ac/g/${standing[0]}/c/${standing[1]}/p/${page}/l/${handlesList}`;
      let res = JSON.parse(UrlFetchApp.fetch(link).getContentText())['result'];
      if (page == 1) {
        let standingLink = res.contest.link;
        let standingName = res.contest.name;
        let standingProblems = res.contest.problems.length;
        Contests.push(standingProblems);
        StandingData[0].push(`=HYPERLINK("${standingLink}", "${standingName}")`);
        Logger.log(standingName);
      }
      if (Object.keys(res.contestants).length === 0 || JSON.stringify(res.contestants) === JSON.stringify(lastContestants)) {
        break;
      }
      lastContestants = res.contestants;
      let contestantsObj = res.contestants;
      for (const handle in contestantsObj) {
        let [newContestant, contestant] = Contestant.getContestant(handle);
        if (newContestant) {
          Contestants.push(contestant);
        }
        contestant.AddProblems(standingNumber, contestantsObj[handle].ac);
      }
    }
  }

  let contestantsData = [];
  for (let contestant of Contestants) {
    let problems = contestant.GetAcceptedArray(Contests, standingNumber);
    let totalAccepted = contestant.GetTotalAccepted();
    let handleLink = `=HYPERLINK("https://codeforces.com/profile/${contestant.handle}", "${contestant.handle}")`;
    contestantsData.push([handleLink, totalAccepted, ...problems]);
  }
  contestantsData.sort(cmp);
  StandingData.push(...contestantsData);

  let StandingSheet = SpreadsheetApp.getActive().getSheetByName("Standing");

  Analysis(Contestants);

  let lastRow = StandingSheet.getLastRow();
  if (lastRow > StandingData.length) {
    StandingSheet.deleteRows(StandingData.length + 1, lastRow - StandingData.length);
  }

  Clear(StandingSheet, StandingData);
  StandingSheet.getRange(1, 1, StandingData.length, StandingData[0].length).setValues(StandingData);

  Add_Rate();
}

