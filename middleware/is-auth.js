const jwt =require('jsonwebtoken');

module.exports = (req, res, next) =>{
    const authHeader = req.get('Authorization')
    if(!authHeader){ //req.get('Authorization')가 있는지 먼저 검사
        const error = new Error('Authorization 없음')
        error.statusCode = 401
        throw error;
    }

    const token = req.get('Authorization').split(' ')[1]   //헤더 값 받기
    let decodedToken;
     try{
        decodedToken = jwt.verify(token,'tokenkey') //decode와 검사 한번에
     }catch(err){
        err.statusCode = 500
        throw err;
     }
     if(!decodedToken){
        const error = new Error('토큰 없음')
        error.statusCode =401;
        throw error;
     }
     req.userId = decodedToken.userId;
     next();
}