import {db} from "../db.js"
import jwt from "jsonwebtoken"

export const getPosts = (req,res)=>{
    const category = req.query.cat;
    console.log('Category:', category);
    const q = req.query.cat ? "SELECT * FROM posts WHERE cat=?"
    :"SELECT * FROM posts"

    db.query(q,[req.query.cat],(err,data)=>{
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        return res.status(200).json(data)
    })
}


export const getPost = (req,res)=>{
    const q = "SELECT p.id,`username`,`title`,`desc`,p.img,u.img AS userImg,`cat`,`date` FROM users u JOIN posts p ON u.id=p.uid WHERE p.id = ?"

    console.log("Post ID:", req.params.id); 

    db.query(q,[req.params.id],(err,data)=>{
        if (err) {
            console.error("Error executing query:", err); // Log any query execution errors
            return res.status(500).json(err);
        }

        console.log("Query Result:", data); // Log the result of the query

        if (data.length === 0) {
            return res.status(404).json("Post not found"); // Handle case when no data is returned
        }


        return res.status(200).json(data[0])
    })
}


export const addPost = (req,res)=>{
    const token = req.cookies.access_token
    console.log('Token:', token);
    if (!token) {
        console.log('No token found, returning 401');
        return res.status(401).json("Not Authenticated");
    }

    jwt.verify(token,"jwtkey",(err,userInfo)=>{
        if (err) {
            console.log('JWT verification error:', err.message); // Log the JWT verification error
            return res.status(403).json("Token is not valid");
        }

        console.log('Decoded userInfo:', userInfo); 

        const q=" INSERT INTO posts(`title`,`desc`,`img`,`cat`,`date`,`uid`) VALUES (?)"

        const values = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.cat,
            req.body.date,
            userInfo.id
        ]

        console.log('Insert values:', values);

        db.query(q,[values],(err,data)=>{
            if (err) {
                console.log('Database query error:', err.message); // Log database query error
                return res.status(500).json(err);
            }
            console.log('Post has been created successfully');
            return res.json("Post has been created");
        })
    
    })
}



export const deletePost = (req,res)=>{
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not Authenticated")

    jwt.verify(token,"jwtkey",(err,userInfo)=>{
        if(err) return res.status(403).json("Token is not valid")
        
            const postId = req.params.id
            const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?"

            db.query(q,[postId,userInfo.id],(err,data)=>{
                if(err) return res.status(403).json("You can delete only your post!")

                return res.json("Post has been deleted!")
            })
    })
}
export const updatePost = (req,res)=>{
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not Authenticated")

    jwt.verify(token,"jwtkey",(err,userInfo)=>{
        if(err) return res.status(403).json("Token is not valid");

        const postId = req.params.id
        const q=" UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id`=? AND `uid`=?"

        const values = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.cat
        ]

        db.query(q,[...values,postId,userInfo.id],(err,data)=>{
            if(err) return res.status(500).json(err)
                return res.json("Post has been updated")
        })
    
    })
}