const express = require('express')
const app = express()
const PORT = 4000
const router = require('./router.js')
const bodyParser = require('body-parser')
const { Entry, User } = require('./mongodbUtil')
const { dateStringToText } = require('./utilities.js')
const cookieParser = require('cookie-parser')

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static('public/'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/signup', (req, res) => {
    // User.findOne({ username: 'sus' }, (err, response) => {
    //     console.log(response)
    // })
    res.render('signup')
})

app.post('/signup', (req, res) => {
    let username = req.body.username.trim()
    let password = req.body.password
    let passConfirm = req.body.confirm_pass
    
    if (!username) {
        res.render('signup', { error: 'Please enter a username', password: password, passConfirm: passConfirm })
        return
    }
    if (!password) {
        res.render('signup', { error: 'Please enter a password', username: username })
        return
    }
    if (password != passConfirm) {
        res.render('signup', { error: 'Passwords don\'t match', username: username, password: password })
        return
    }
    
    let dbResponseWillArrive = new Promise((resolve, reject) => {
        User.findOne({ username: username }, (err, response) => {
            if (err) throw err
            else
            resolve(response)
        })
    }).then((resolution) => {
        if (!resolution) {
            let newUser = new User();
            newUser.username = username
            newUser.setPassword(password)
            
            newUser.save((err) => {
                if (err) throw err
                else {
                    res.cookie('username', username)
                    res.redirect('home')
                }
            })
        }
        else
        res.render('signup', { error: 'This username already exists', password: password, passConfirm: passConfirm })
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    let username = req.body.username.trim()
    let password = req.body.password

    if (!username) {
        res.render('login', { error: 'Enter a username', password: password })
        return
    }
    if (!password) {
        res.render('login', { error: 'Enter a password', username: username })
        return
    }

    User.findOne({ username: username }, (err, user) => {
        if (err) throw err
        if (!user) {
            res.render('login', { error: 'Username not found', password: password })
            return
        }
        else {
            if (user.isValidPassword(password)) {
                res.cookie('username', username)
                res.redirect('home')
            }
            else {
                res.render('login', { error: 'Incorrect password', username: username })
            }
        }
    })
})

function getHome(req, res) {
    var titleAboveEntriesView
    var datesAsString = new Array()

    let username = req.cookies.username
    if(!username) {
        res.send('You are not authenticated to enter this page')
        return
    }

    let dbResponseWillArrive = new Promise((resolve, reject) => {
        if (!req.query.date) {
            Entry.find({ username: username }, { date: 1 }, (err, response) => {
                resolve(response)
            })
        }
        else {
            date = req.query.date
            let nextDay = String(Number(date.substr(8, 2)) + 1)
            if (nextDay.length == 1)
                nextDay = '0' + nextDay
            nextDate = date.substr(0, 8) + nextDay

            Entry.find({ date: { $gte: new Date(date), $lt: new Date(nextDate) }, username: username }, { date: 1 }, (err, response) => {
                resolve(response)
            })
        }
    }).then((resolution) => {
        try {
            for (var i = 0; i < resolution.length; i += 1) {
                datesAsString.push(resolution[i].date.toISOString().substring(0, 10))
            }
        }
        catch(err) {
            throw err
        }

        if (datesAsString.length == 0) {
            titleAboveEntriesView = "No Entries Found"
        }
        else {
            titleAboveEntriesView = "View Entries:"
        }
        res.render('home', { dates: datesAsString, titleAboveEntriesView: titleAboveEntriesView, dateToText: dateStringToText })
    })
}

app.get('/', getHome)
app.get('/home', getHome)

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/observe', (req, res) => {
    let username = req.cookies.username
    if(!username) {
        res.send('You are not authenticated to enter this page')
        return
    }

    let date = req.query.date
    let nextDay = String(Number(date.substr(8, 2)) + 1)
    if (nextDay.length == 1)
        nextDay = '0' + nextDay
    nextDate = date.substr(0, 8) + nextDay

    let dbResponseWillArrive = new Promise((resolve, reject) => {
        Entry.findOne({ date: { $gte: new Date(date), $lt: new Date(nextDate) }, username: username }, { content: 1 }, (err, response) => {
            if (err) throw err
            if (!response)
                reject()
            else
                resolve(response)
        })
    }).then((resolution) => {
        res.render('observe', { date: dateStringToText(date), content: resolution.content })
    }).catch((rejection) => {
        res.render('observe', { date: dateStringToText(date) })
    })
})

app.delete('/observe', (req, res) => {
    let date = req.query.date
    let username = req.cookies.username
    Entry.deleteOne({ date: date, username: username }, (err, response) => {
        res.status = 200
        res.send('<b><i>The entry at this date has been deleted....Redirecting to home in <span id="countdown"></span></i></b>')
    })

})

app.use('/postentry', router)

app.get('/logout', (req, res) => {
    res.clearCookie('username')
    res.redirect('login')
})

app.listen(PORT, (req, res) => {
    console.log(`Server is listening on port ${PORT}`)
})