// to start server
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

router.get('/', (req, res) =>{
    res.status(200).send({
        "status": "success",
        "comment": "Hey We did it!!!"
    });
})

router.get('*', (req, res) =>{
    res.status(404).send({
        "status": "FAILED",
        "comment": "Check your parameters"
    });
})

app.use('/.netlify/functions/ac', router);
module.exports.handler = serverless(app);