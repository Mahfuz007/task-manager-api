const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks',auth,async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(err){
        res.status(404).send(err);
    }
})

router.get('/tasks',auth,async(req,res)=>{
    let match ={};
    let sort = {};
    if(req.query.completed){
        match.completed = req.query.completed ==='true';
    }

    if(req.query.sortBy){
        let parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1]==='Desc'?-1:1;
    }

    try{
        await req.user.populate({
            path: 'task',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.task);
    }catch(err){
        res.status(500).send(err);
    }
})

router.get('/tasks/:id',auth,async(req,res)=>{
    try{
        let task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task) return res.status(404).send();
        res.send(task);
    }catch{
        res.status(500).send();
    }
})

router.patch('/tasks/:id',auth,async(req,res)=>{
    try{
        let updates = Object.keys(req.body);
        let allowUpdate = ['description','completed'];
        let isValid = updates.every(update=>allowUpdate.includes(update));
        
        if(!isValid) return res.status(404).send({error: "Invalid Updates"});
        
        let task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if(!task) return res.status(404).send();

        updates.forEach((update)=>task[update]=req.body[update]);
        await task.save(); 
        
        res.send(task);
    }catch(err){
        res.status(500).send(err);
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        let task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task) return res.status(404).send();
        res.send(task);
    }catch{
        res.status(500).send();
    }
})

module.exports = router;