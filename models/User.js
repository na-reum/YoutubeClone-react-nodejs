const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password: {
        type :String,
        maxlength:100
    },
    lastname:{
        type:String,
        maxlength:50
    }
    ,
    role:{
        type:Number,
        default:0
    },
    image: String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
})

userSchema.pre('save',function(next){
    let user = this;
    
    if(user.isModified('password')){
            //비밀번호 암호화 시킨다.
        bcrypt.genSalt(saltRounds, (err,salt)=>{
            if(err) return next(err);
    
            bcrypt.hash(user.password,salt, (err,hash)=>{
                if(err) return next(err);
    
                user.password = hash
                next();
            });
        });
    }else{
        next();
    }

})

userSchema.methods.comparePassword = function(plainPassword,cb){

    //plainPassword 1234567 암호화된 비밀번호 
    bcrypt.compare(plainPassword,this.password,(err,isMatch)=>{
        if(err)return cd(err)
        cb(null,isMatch)
    })

}

userSchema.methods.generateToken = function(cb){
    let user = this;

    const token = jwt.sign(user._id.toHexString(),process.env.TOKEN)
    
    user.token = token;
    user.save((err,user)=>{
        if(err) return cb(err);
        cb(null,user)
    })

}

userSchema.statics.findByToken = function(token,cb){
    let user = this;
    
    jwt.verify(token,process.env.TOKEN,(err,decoded)=>{
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id":decoded, "token": token},(err,user)=>{
            if(err) return cb(err);
            cb(null,user)
        })
    });

}

const User = mongoose.model('User', userSchema)

module.exports = { User }