const axios = require('axios');

function normalGet(url) {
    axios({
        method: 'GET',
        url: url
    }).then((res) => {
        return res.data
    }).catch(err => {
        if (err) { console.log(err) }
        return 'fail'
    })
}

function paramsGet (url, params) {
    let reqUrl = url + '?'
    for (let item in params) {
        reqUrl += item.reqName + '=' + item.reqParam + '&'
    }
    axios({
        method: 'GET',
        url: reqUrl
    }).then((res) => {
        return res.data
    }).catch(err => {
        console.log(err)
        return 'fail'
    })
}

function normalPost(url, params) {
    axios({
        method: 'POST',
        url: url,
        data: params
    }).then((res) => {
        return res.data
    }).catch(err => {
        console.log(err)
        return 'fail'
    })
}