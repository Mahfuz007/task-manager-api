const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router();
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'));
        }

        cb(undefined,true);
    }
});

router.post('/users',async(req,res)=>{
    const user = new User(req.body);

    try{
        let token =await user.getUserAuthToken();
        res.status(201).send({user,token});
    }catch(e){
        res.status(404).send(e);
    }
})

router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user);
})

router.patch('/users/me',auth,async(req,res)=>{
    let updates = Object.keys(req.body);
    let allowUpdates = ['name','email','age','password'];

    let isValid = updates.every(update=>allowUpdates.includes(update));

    if(!isValid) return res.status(404).send({error: 'Invalid Update'});
    try{
        updates.forEach( (update)=> req.user[update]=req.body[update]);
        await req.user.save();
        res.send(req.user);
    }catch(err){
        res.status(500).send(err);
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove();
        res.send(req.user);
    }catch{
        res.status(500).send();
    }
})

router.post('/users/login',async(req,res)=>{
    try{
        let user = await User.findByCredentials(req.body.email,req.body.password);
        let token = await user.getUserAuthToken();
        res.send({user,token});
    }catch(err){
        res.status(404).send();
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token !== req.token;
        })

        await req.user.save();
        res.send();
    }catch{
        res.status(500).send();
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.send();
    }catch{
        res.status(500).send();
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    let buffer =await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error: error.message});
})

router.delete('/users/me/avatar',auth, async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async(req,res)=>{
    try{
        let user = await User.findById(req.params.id);

        if(!user || !user.avatar) throw new Error();

        res.set('Content-Type','image/jpg');
        res.send(user.avatar);
    }catch{
        res.status(404).send();
    }
})

module.exports = router;