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

//get all products
app.get('/projects', (req,res)=>{
  Project.find().then(result =>{
    res.send(result);
  })
}); // get all projects 

//get projects by ID
app.get('/projects/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Project.findOne({_id:idParam}, (err, result)=>{
    if(result){
      res.send(result)
    }
    else{
      res.send("Can't find project with this ID")
    }
  }).catch(err => res.send(err));
}); // get projects by ID

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
       image_url : req.body.imageUrl,
       url : req.body.url,
       user_id : req.body.userId
     });
       //save to database and notify the user accordingly
       dbProject.save().then(result =>{
         res.send(result);
       }).catch(err => res.send(err));
     }
   })
}); // add projects

// delete a product
app.delete('/deleteProject/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Project.findOne({_id:idParam}, (err, result)=>{
    if(result){
      Project.deleteOne({_id:idParam}, err =>{
        res.send("Project deleted")
      });
    }
    else{
      res.send("Can't delete project. ID Not found")
    }
  }).catch(err => res.send(err));
}); // delete project  

// update Product
app.patch('/updateProject/p=:id', (req,res)=>{
  const idParam = req.params.id;
  Project.findById(idParam, (err,result)=>{
    const updatedProject = {
      name : req.body.name,
      author : req.body.author,
      image_url : req.body.imageUrl,
      url : req.body.url
    };
    Project.updateOne({_id:idParam}, updatedProject).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}) // update project

//show users
app.get('/users',(req,res)=>{
  User.find().then(result =>{
    res.send(result)
  })
}) // show users

//register user
app.post('/register', (req,res)=>{
  User.findOne({email:req.body.email},(err,result) =>{
    if(result){
      res.send("This email is already taken. Please try another one")
    }
    else{
      const hash = bcryptjs.hashSync(req.body.password);
      const user = new User({
        _id : new mongoose.Types.ObjectId,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hash
      });
      user.save().then(result =>{
        res.send(result);
      }).catch(err => res.send(err));
    }
  });
}); // register user

//login user
app.post('/login', (req,res)=>{
  User.findOne({email:req.body.email}, (err, result)=>{
    if(result){
      if(bcryptjs.compareSync(req.body.password, result.password)){
        res.send(result)
      }
      else{
        res.send("Not authorised. Incorrect password")
      }
    }
    else{
      res.send("User not found")
    }
  })
}); // login user

// update user
app.patch('/updateUser/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const updatedUser = {
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      email : req.body.email
    };
    User.updateOne({_id:idParam}, updatedUser).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update user

// update password
app.patch('/updatePassword/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findById(idParam, (err,result)=>{
    const hash = bcryptjs.hashSync(req.body.password);
    const updatedUser = {
      password : hash
    };
    User.updateOne({_id:idParam}, updatedUser).then(result=>{
      res.send(result);
    }).catch(err=> res.send(err));
  }).catch(err=>res.send("Not found"))
}); // update password

// delete a user
app.delete('/deleteUser/u=:id', (req,res)=>{
  const idParam = req.params.id;
  User.findOne({_id:idParam}, (err, result)=>{
    if(result){
      User.deleteOne({_id:idParam}, err =>{
        res.send("User deleted")
      });
    }
    else{
      res.send("Can't delete user. Not found")
    }
  }).catch(err => res.send(err));
}); // delete a user





// leave right at bottom
app.listen(port, () => console.log(`App listening on port ${port}!`))
