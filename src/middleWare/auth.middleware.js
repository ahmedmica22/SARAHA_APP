import jwt from "jsonwebtoken";
export const auth = (req, res , next)=>{
    const {token} =req.headers;
    if(!token){
        throw new Error ("Inavalid token")
    }

    const decode = jwt.verify(token , process.env.SECRET_KEY);
    req.user = decode;
    next();
}