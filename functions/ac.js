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

// to get the dom
async function getDom(url) {
    return axios.get(url)
    .then((res) => {
        const dom = new JSDOM(res.data);
        return dom.window.document;
    })
    // const API_KEY = 'e4e7dc2ef068a949f0915ee007a50c80'
    // return axios('http://api.scraperapi.com/', {
    //     params: {
    //         'url': url,
    //         'api_key': API_KEY,
    //         'render' : true
    //     }
    // }).then((res) => {
    //     const dom = new JSDOM(res.data);
    //     return dom.window.document;
    // })
}

// get ac solutions for each contestant
const getAc = async(url) => {
    try{
        const dom = await getDom(url);
        let standing = dom.querySelector('.standings');
        let problemsA = standing.rows[0].querySelectorAll('a');

        let problems = [];
        for (let problem of problemsA){
            problems.push({
                'name': problem.title, 
                'link': 'https://codeforces.com' + problem.href
            });
        }
        
        let sheetNameA = dom.querySelector(".contest-name").querySelector('a');
        let contest = {
            'name': strip(sheetNameA.textContent),
            'link': 'https://codeforces.com' + sheetNameA.href,
            'problems': problems
        };

        let data = {};
        for(let i = 1; i < standing.rows.length - 1; i++){
            let team = 'Not a team', contestants = [];
            let tr = standing.rows[i].querySelectorAll('td'), isTeam = true;
            try{
                trA = tr[1].querySelector('span').querySelectorAll('a');
                if(!trA.length) isTeam = false;
            }
            catch{
                isTeam = false;
            }
            if (isTeam && trA[0].href.includes('team')){ // it's a team
                team = trA[0]['title'];
                for (let k = 1; k < trA.length; k++){
                    tmp = (trA[k].title.split(' '));
                    contestants.push(tmp[tmp.length - 1]);
                }
            }
            else{ // it's a contestant 
                tmp = (tr[1].querySelector('a').title.split(' '));
                contestants.push(tmp[tmp.length - 1]);
            }

            let tds = standing.rows[i].querySelectorAll('td');
            for(let i = 4; i < tds.length; i++){
                let txt = strip(tds[i].querySelector('span').textContent) || '-';
                if(txt[0] == '-') continue;
                for(let j = 0; j < contestants.length; j++){
                    if(!(contestants[j] in data)){ // new contestant to the data
                        data[contestants[j]] = [];
                    }
                    let pNum = problems[i - 4].name.split(' - ')[0];
                    if(!data[contestants[j]].includes(pNum))
                        data[contestants[j]].push(pNum);
                }
            }
        }

        let keys = Object.keys(data);
        keys.forEach(async (key) => {
            data[key] = {
                ac: data[key].join('-')
            }
        });

        return {
            'status': 'OK',
            'result': {
                'contest': contest,
                'contestants': data
            },
        }
    }
    catch (err){
        return {
            'status': 'FAILED',
            'result': 'There is something wrong :(',
            'err' : err.message
        }
    }
}

router.get('/g/:groupId/c/:contestId/p/:page', async (req, res) =>{
    let {groupId, contestId, page} = req.params;
    url = `https://codeforces.com/group/${groupId}/contest/${contestId}/standings/page/${page}?showUnofficial=true`
    let ret = await getAc(url);
    res.status(200).send(ret);
})

router.get('/g/:groupId/c/:contestId/p/:page/l/:listId', async (req, res) =>{
    let {groupId, contestId, listId, page} = req.params;
    url = `https://codeforces.com/group/${groupId}/contest/${contestId}/standings/page/${page}?list=${listId}&showUnofficial=true`
    let ret = await getAc(url);
    res.status(200).send(ret);
})

app.use('/.netlify/functions/ac', router);
module.exports.handler = serverless(app);