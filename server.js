//imports
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import multer from 'multer'
import GridFsStorage from 'multer-gridfs-storage'
import Grid from 'gridfs-stream'
import bodyParser from 'body-parser'
import path from 'path'
import Pusher from 'pusher'
import Posts from './postModel.js'
import Pusher from 'pusher'

const connection_url = 'mongodb+srv://jamstanleyambe:.@cluster1.cmnc3ny.mongodb.net/?retryWrites=true&w=majority'

Grid.mongo = mongoose.mongo
const app = express()
const port = process.env.PORT || 9000
//middleware
app.use(bodyParser.json()),
    app.use(cors())

//DB Config

const connection = mongoose.createConnection(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})


let gfs
connection.once('open', () => {
    console.log('DB Connected')
    gfs = Grid(connection.db, mongoose.mongo)
    gfs.collection('images')
})
const storage = new GridFsStorage({
    url: connection_url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `image-${Date.now()}${path.extname(file.
                originalname)}`
            const fileInfo = {
                filename: filename,
                bucketName: 'images'
            }
            resolve(fileInfo)
        })
    }
})
const upload = multer({ storage })

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const pusher = new Pusher({
  appId: "1747976",
  key: "04ef066f9bf4a023aa56",
  secret: "0f5b0c4af027cf023b95",
  cluster: "ap2",
  useTLS: true
});


//api routes

app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"))

app.post('/upload/image', upload.single('file'), (req, res) => {
    res.status(201).send(req.file)
})
app.post('/upload/post', (req, res) => {
    const dbPost = req.body
    Posts.create(dbPost, (err, data) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(201).send(data)
        }) })
        app.get('/posts', (req, res) => {
            Posts.find((err, data) => {
                if(err) {
                    res.status(500).send(err)
                } else {
                    data.sort((b,a) => a.timestamp - b.timestamp)
                    res.status(200).send(data)
        } })
        })




//API Endpoints
mongoose.connect(connection_url, {  ...})
mongoose.connection.once('open', () => {
    console.log('DB Connected for pusher')
    const changeStream = mongoose.connection.collection('posts').watch()
    changeStream.on('change', change => {
        console.log(change)
        if(change.operationType === "insert") {
            console.log('Trigerring Pusher')
            pusher.trigger('posts','inserted', {
                change: change
           })
        } else {
            console.log('Error trigerring Pusher')
} })
})
//listen
app.listen(port, () => console.log(`Listening on localhost: ${port}`))



