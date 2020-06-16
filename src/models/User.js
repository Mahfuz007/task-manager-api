const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase: true,

        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }

    },
    age: {
         type: Number,
         default: 0,
         validate(value){
             if(value<0) throw new Error("Age must be positive");
         }
    },
    password: {
        type: String,
        required: true,
        trim: true,

        validate(value){
            if(value.length<7) throw new Error("Password must be greater than six character");

            if(value.toLowerCase().includes('password')) throw new Error("Password must not be password");
        }
    },

    tokens:[
        {
            token:{
                type: String,
                required: true
            }
        }
    ],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
});

userSchema.virtual('task',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    let userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.getUserAuthToken = async function(){
    let token = jwt.sign({_id: this._id.toString()},'thisisme');
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
}

userSchema.statics.findByCredentials = async(email,password)=>{
    let user = await User.findOne({email: email});
    if(!user) throw new Error('Unable to login!');

    let isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) throw new Error('Unable to login!');

    return user;
}

userSchema.pre('save',async function(next){

    let user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8); 
    }
    
    next();
})

userSchema.pre('remove', async function(next){
    await Task.deleteMany({owner: this._id});
})

const User = mongoose.model('User',userSchema);

module.exports = User;