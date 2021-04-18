//jshint esversion:6

const express = require('express')

const mongoose = require('mongoose')
const _ = require('lodash')
// eslint-disable-next-line no-undef
const dotenv = require('dotenv').config()
const app = express()

const items = []
const workItems = []

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
const apiKey = process.env.API_KEY

mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.myknc.mongodb.net/todolistDB`,

    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }
)

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

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema],
}

const List = mongoose.model('List', listSchema)

// new route
app.get('/', (req, res) => {
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Successfully saved default items to DB')
                }
            })
            res.redirect('/')
        } else {
            res.render('list', {
                listTitle: 'Today',
                newListItems: foundItems,
            })
        }
    })
})
app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                })
                list.save()
                res.redirect('/' + customListName)
            } else {
                // show existing list
                res.render('list', {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                })
            }
        }
    })
})
app.post('/', (req, res) => {
    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: itemName,
    })
    if (listName === 'Today') {
        item.save()
        res.redirect('/')
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item)
            foundList.save()
            res.redirect('/' + listName)
        })
    }
})

// new route

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log('Successfully deleted checked item.')
                res.redirect('/')
            }
        })
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } },
            (err, foundList) => {
                if (!err) {
                    res.redirect('/' + listName)
                }
            }
        )
    }
})

// new route

// app.get('/work', (req, res) => {
//     res.render('list', { listTitle: 'Work List', newListItems: workItems })
// })
// app.post('/work', (req, res) => {
//     const item = req.body.newItem

//     workItems.push(item)
//     res.redirect('/work')
// })
// new route
app.get('/about', (req, res) => {
    res.render('about')
})

let port = process.env.PORT
if (port == null || port == '') {
    port = 2000
}
app.listen(port, () => {
    console.log('Server has started successfully')
})
