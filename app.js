//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
// eslint-disable-next-line no-undef
const date = require(__dirname + '/date.js')
const app = express()

const items = []
const workItems = []

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// new route
app.get('/', (req, res) => {
    let day = date.getDate()
    res.render('list', { listTitle: day, newListItems: items })
})
app.post('/', (req, res) => {
    const item = req.body.newItem

    if (req.body.list == 'Work List') {
        workItems.push(item)
        res.redirect('/work')
    } else {
        items.push(item)

        res.redirect('/')
    }
})

// new route

app.get('/work', (req, res) => {
    res.render('list', { listTitle: 'Work List', newListItems: workItems })
})
app.post('/work', (req, res) => {
    const item = req.body.newItem

    workItems.push(item)
    res.redirect('/work')
})
// new route
app.get('/about', (req, res) => {
    res.render('about')
})

app.listen(2000, () => {
    console.log('Server started at port 2000')
})
