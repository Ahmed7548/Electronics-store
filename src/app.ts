import express from "express"


const app = express()

// middleware
app.use(express.urlencoded({ extended: true })),
app.use(express.json())












app.listen(process.env.PORT, ():void => {
  console.log(`app is listening on port ${process.env.PORT}`)
})