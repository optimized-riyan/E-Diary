const express = require('express')
const { resolve } = require('path')
const router = express.Router()
const { Entry } = require('./mongodbUtil')

router.route('/')
    .get((req, res) => {
        let username = req.cookies.username
        if(!username) {
            res.send('You are not authenticated to enter this page')
            return
        }
        res.render('postentry')
    })
    .post((req, res) => {
        let date = req.body.date
        let content = req.body.content
        let username = req.cookies.username

        if (!date)
            res.render('postentry', { error: '*Enter a date', content: content })
        else if (!content)
            res.render('postentry', { error: '*No content has been entered', date: date })
        else {
            const newEntry = new Entry({
                date: req.body.date,
                content: req.body.content,
                username: username
            })
    
            let nextDay = String(Number(date.substr(8, 2)) + 1)
            if (nextDay.length == 1)
                nextDay = '0' + nextDay
            nextDate = date.substr(0, 8) + nextDay
            
            let promise = new Promise((resolve, reject) => {
                Entry.find({ date: { $gte: new Date(date), $lt: new Date(nextDate) } }, { date: 1 }, (err, response) => {
                    resolve(response)
                })
            }).then((resolution) => {
                if(resolution.length == 0) {
                    newEntry.save(() => {
                        res.render('postentry', { error: 'New entry added' })
                    })
                }
                else {
                    res.render('postentry', { error: '*An entry already exists on this date' })
                }
            })
        }
    })

module.exports = router