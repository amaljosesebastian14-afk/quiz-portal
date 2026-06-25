const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const { getDB } =
require("../config/db");

router.get(
    "/",
    authMiddleware,
    async (req,res)=>{

        try{

            const db = getDB();

            const results =
            await db.collection("results")
            .find({
                userId:req.user._id.toString()
            })
            .toArray();

            const attempts =
            results.length;

            let highestScore = 0;
            let averageScore = 0;

            if(attempts > 0){

                highestScore =
                Math.max(
                    ...results.map(
                        r => r.score
                    )
                );

                const totalPercentage =
                results.reduce(
                    (sum,r)=>
                    sum + (r.percentage || 0),
                    0
                );

                averageScore =
                (
                    totalPercentage /
                    attempts
                ).toFixed(2);

            }

            res.json({

                success:true,

                profile:{

                    name:req.user.name,

                    email:req.user.email,

                    role:req.user.role,

                    attempts,

                    highestScore,

                    averageScore

                }

            });

        }
        catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    }
);

module.exports = router;