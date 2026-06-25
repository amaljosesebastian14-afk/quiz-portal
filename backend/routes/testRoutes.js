const express =
require("express");

const router =
express.Router();

const admin =
require("../config/firebase");

router.get(
"/firebase-test",
(req,res)=>{

    res.json({

        success:true,

        projectId:
        admin.app().options
        .credential.projectId

    });

});

module.exports =
router;