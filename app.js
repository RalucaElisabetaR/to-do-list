//jshint esversion:6

const express = require('express')

const mongoose = require('mongoose')
// eslint-disable-next-line no-undef
const date = require(__dirname + '/date.js')
const app = express()

const items = []
const workItems = []

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/todolistDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const itemsSchema = {
    name: String,
}
const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
    name: 'Welcome to your To Do List!',
})
const item2 = new Item({
    name: 'Hit the + button to add a new task.',
})

const item3 = new Item({
    name: '<-- Hit this to delete a task.',
})

const defaulItems = [item1, item2, item3]
//

// new route
app.get('/', (req, res) => {
    let day = date.getDate()
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaulItems, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Successfully saved default items to DB')
                }
            })
        } else {
            res.render('list', { listTitle: day, newListItems: foundItems })
        }
    })
})

app.post('/', (req, res) => {
    const itemName = req.body.newItem

    const item = new Item({
        name: itemName,
    })
    item.save()
    res.redirect('/')
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
