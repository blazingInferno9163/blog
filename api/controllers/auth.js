import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    // Check existing User
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";

    db.query(q, [req.body.email, req.body.username], (err, data) => {
        if (err) return res.json(err);
        if (data.length) return res.status(409).json("User already exists");

        // Hash the password and create a user
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.json(err);

            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) return res.json(err);

                const q = "INSERT INTO users(`username`, `email`, `password`) VALUES (?)";
                const values = [req.body.username, req.body.email, hash];

                db.query(q, [values], (err, data) => {
                    if (err) return res.json(err);
                    return res.status(200).json("User has been created");
                });
            });
        });
    });
};

export const login = (req, res) => {
    //Check User

    const q = "SELECT * FROM users WHERE username = ?"
    db.query(q,[req.body.username],(err,data)=>{
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(err);
        }
        if (data.length === 0) return res.status(404).json("User not found!");

    //Check Password

    const isPasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password)

    if(!isPasswordCorrect) return res.status(400).json("Wrong username or password")

    const token = jwt.sign({id:data[0].id},"jwtkey");
    const {password,...other} = data[0]

    res.cookie("access_token",token,{
        httpOnly:true
    })
    console.log("Cookie set:", res.getHeaders()["set-cookie"]); // Log the Set-Cookie header
        res.status(200).json(other);

    })
};

export const logout = (req, res) => {
    res.clearCookie("access_token",{
        sameSite:"none",
        secure:true
      }).status(200).json("User has been logged out.")
};
