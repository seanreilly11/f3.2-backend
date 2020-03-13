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
}); // register

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
}); // login

// update user
app.patch('/updateUser/:id', (req,res)=>{
    const idParam = req.params.id;
    User.findById(idParam, (err,result)=>{
    	// const hash = bcryptjs.hashSync(req.body.password);
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





// leave right at bottom
app.listen(port, () => console.log(`App listening on port ${port}!`))