const mongoose = require('mongoose'); // since we are using mongoose we have to require it

const  projectSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  name : String,
  author : String,
  imageUrl : String,
  url : String,
  // user_id :{
  //   type : mongoose.Schema.Types.ObjectId,
  //   ref : 'User'
  // }

});

module.exports = mongoose.model('Project', projectSchema);
