// to start serverless-http
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

// to scrap the html
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// to request the pgae
const axios = require('axios');

// to remove extra's
function strip(string) {
  return string.replace(/^\s+|\s+$/g, '');
}

// get ac solutions for each contestant
const getAc = async(body, lastStanding, data) => {
  const dom = new JSDOM(body);
  let standing = dom.window.document.querySelector('.standings');
  if(lastStanding == standing.innerHTML){
      return [0];
  }
  let problemsA = standing.rows[0].querySelectorAll('a');
  let problems = [];
  for (let problem of problemsA){
      problems.push({'name': problem.title , 'link': 'https://codeforces.com'+problem.href});
  }
  if(lastStanding == 1){ // first time only
      let sheetNameA = dom.window.document.querySelector(".contest-name").querySelector('a');
      let sheetName = {
          'name': strip(sheetNameA.textContent),
          'link': 'https://codeforces.com' + sheetNameA.href
      };
      data["sheetData"] = ({'sheet': sheetName, 'problems': problems});
  }
  for(let i = 1; i < standing.rows.length - 1; i++){
      let team = '', contestants = [];
      let tr = standing.rows[i].querySelectorAll('td'), isTeam = true;
      try{
          trA = tr[1].querySelector('span').querySelectorAll('a');
      }
      catch{
          isTeam = false;
      } 
      if (isTeam && trA[0].href.includes('team')){ // it's a team
          team = trA[0]['title'];
          for (let k = 1; k < trA.length; k++){
              tmp = (trA[k].title.split(' '));
              contestants.push(tmp[1]);
          }
      }
      else{ // it's a contestant 
          tmp = (tr[1].querySelector('a').title.split(' '));
          contestants.push(tmp[1]);
      }
      let tds = standing.rows[i].querySelectorAll('td');
      for(let i = 4; i < tds.length; i++){
          let txt = strip(tds[i].querySelector('span').textContent) || '-';
          if(txt[0] == '-') continue;
          for(let j = 0; j < contestants.length; j++){
              if(!(contestants[j] in data)){
                  data[contestants[j]] = new Set();
              }
              data[contestants[j]].add(problems[i - 4]);
          }
      }
  }
  return [standing.innerHTML, data];
}

// to get the html of the page
async function requestPage(url, standing, data) {
  return axios.get(url)
  .then((res) => {
      return getAc(res.data, standing, data);
  })
}

router.get('/g/:groupId/c/:contestId/l/:listId', async (req, res) =>{
    let {groupId, contestId, listId} = req.params;
    let standing = 1, page = 1, data = {};
    while(standing){
        url = `https://codeforces.com/group/${groupId}/contest/${contestId}/standings/page/${page}?list=${listId}&showUnofficial=true`
        let ret = await requestPage(url, standing, data);
        if(ret[0] == 0) break;
        standing = ret[0];
        data = ret[1];
        page++;
    }
    let handles = [], sheetDataTmp = data['sheetData'];
    delete data['sheetData'];
    for (const [key, value] of Object.entries(data)) {
        handles.push({handle :key, ac: value.size});
    }
    res.status(200).send(
        {
            'status': 'OK',
            'result':{
                'contest': {
                    'name': sheetDataTmp['sheet']['name'],
                    'link': sheetDataTmp['sheet']['link'],
                    'problems': sheetDataTmp['problems']
                },
                'contestants': handles
            }
        }
    );
})

app.use('/.netlify/functions/ac', router);
module.exports.handler = serverless(app);