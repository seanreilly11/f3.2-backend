const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');//to hash and compare password in an encrypted method
const config = require('./config.json');
const User = require('./models/users.js')
const Project = require('./models/projects.js');

const port = 3000;

//connect to db
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASS}@${config.MONGO_CLUSTER}.mongodb.net/f32?retryWrites=true&w=majority`;
mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Database connected"))
.catch((err) => console.log(`Database connection error: ${err.message}`));

// check connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once('open', function(){console.log("We are connected to MongoDB")});

app.use((req,res,next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

//including body-parser, cors, bcryptjs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors());


// beginning of Project

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/allProjects', (req,res)=>{
  res.json(project);

});

app.get('/projects/p=:id', (req,res)=>{
  const idParam = req.params.id;

  for (let i = 0; i < project.length; i++){

    if (idParam.toString() === project[i].id.toString()) {
       res.json(project[i]);
    }
  }

});

//Add projects.
app.post('/addProject', (req,res)=>{
  //checking if user is found in the db already
  Project.findOne({name:req.body.name},(err,projectResult)=>{

    if (projectResult){
      res.send('project added already');
    } else {


       const dbProject = new Project({
         _id : new mongoose.Types.ObjectId,
         name : req.body.name,
         author : req.body.author,
         image_url : req.body.imageUrl
         // user_id : req.body.userId

       });
       //save to database and notify the user accordingly
       dbProject.save().then(result =>{
         res.send(result);
       }).catch(err => res.send(err));
    }

  })


});

//get all products
app.get('/allProductsFromDB', (req,res)=>{
  Product.find().then(result =>{
    res.send(result);
  })

});






// leave right at bottom
app.listen(port, () => console.log(`App listening on port ${port}!`))
