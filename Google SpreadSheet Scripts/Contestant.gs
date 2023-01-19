class Contestant {
  constructor(handle) {
    this.handle = handle;
    this.sheets = [new Set()];
  }

  AddProblems(standingNumber, problems) {
    this.AddNoAcceptedSheets(standingNumber);
    problems.split("-").forEach(problem => {
      this.sheets[standingNumber].add(problem);
    });
  }

  GetTotalAccepted() {
    let totalAccepted = 0;
    for (let sheet of this.sheets) {
      totalAccepted += sheet.size;
    }
    return totalAccepted;
  }

  GetAcceptedArray(Contests, standingNumber) {
    this.AddNoAcceptedSheets(standingNumber);
    let problems = this.sheets.map((problemsSet, index) => {
      let emoji = '';
      let totalProblems = Contests[index];
      if (!problemsSet.size) {
        emoji = ' :(';
      }
      else if (totalProblems == problemsSet.size) {
        emoji = ' :)';
      }
      return `${problemsSet.size} / ${totalProblems}` + emoji;
    });
    return problems;
  }

  AddNoAcceptedSheets(standingNumber){
    while (standingNumber >= this.sheets.length) {
      this.sheets.push(new Set());
    }
  }

  static getContestant(handle) {
    if (Contestant.hasOwnProperty(handle)) {
      return [0, Contestant[handle]];
    }
    else {
      let contestant = new Contestant(handle);
      Contestant[handle] = contestant;
      return [1, contestant];
    }
  }
}
