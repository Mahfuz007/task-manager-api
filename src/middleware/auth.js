const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = async(req,res,next)=>{
    try{
        let token = req.header('Authorization').replace('Bearer ','');
        let decode = jwt.verify(token,process.env.JWT_SECRET);
        let user = await User.findOne({_id: decode._id, 'tokens.token':token});

        if(!user) throw new Error();
        req.token = token;
        req.user = user;
        next();
    }catch{
        res.status(401).send({error: 'Authentication required'});
    }
}

module.exports = auth;