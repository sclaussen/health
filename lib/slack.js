'use strict';


const curl = require('./curl');


async function slack(message) {
    await curl.post(process.env.SKYBLOCK_SLACK, null, {
        "text": message
    });
}



module.exports.slack = slack;
