const util = require('../utils/util');
const Prefrences = require('../models/preferences');

exports.addToBlocklist = async (req,res,next)=>{
    try{

        const userid = req.user;
        const appName = req.body.appName;

        if(!appName){
            res.status(400).send('Bad request appName not found');
        }

        let currentPrefernce = await Prefrences.findOne({
            user:userid,
        });

        if(!currentPrefernce){
            res.status(404).send('user prefrence not found');
        }

        let blokedApps  =  currentPrefernce.blcokedApps;

        if(blokedApps.length === 0){
            blokedApps.push(appName);
        }else{
            if(blokedApps.includes(appName)){
                return res.status(200).send('App alredy in list');
            }else{
                blokedApps.push(appName);
            }
        }

        //update current prefrence with new blocked app name 
        currentPrefernce.blcokedApps = blokedApps;

        //save the prefrence to db
        const saved = await currentPrefernce.save();
       
        if(saved) 
             return res.status(200).send('App added to blockList');
        else
            return res.status(500).send('Internal server error');

    }catch(err){
        next(err);
    }
}



exports.listAll = async (req,res,next)=>{
    try{

        const userid = req.user;

        let currentPrefernce = await Prefrences.findOne({
            user:userid,
        });

        if(!currentPrefernce){
            res.status(404).send('user prefrence not found');
        }

        let blokedApps  =  currentPrefernce.blcokedApps;

        if(blokedApps.length===0){
            res.status(200).send('No apps found');
        }else{

            res.status(200).json(blokedApps);
        }
       

    }catch(err){
        next(err);
    }
}


exports.removeFromBlockList = async (req,res,next)=>{
    try{

        const userid = req.user;
        const appName = req.body.appName;

        if(!appName){
            res.status(400).send('Bad request appName not found');
        }

        let currentPrefernce = await Prefrences.findOne({
            user:userid,
        });

        if(!currentPrefernce){
            res.status(404).send('user prefrence not found');
        }

        let blokedApps  =  currentPrefernce.blcokedApps;

        if(blokedApps.length === 0){
            res.status(404).send('App not found in block list');
        }else{
            let found = false;
            for(let i=0;i<blokedApps.length;i++){
                if(blokedApps[i]===appName){
                    found = true;
                    blokedApps.splice(i,1);
                    break;
                }
            }
            if(!found){
                res.status(404).send('App not found in block list');
            }
        }

        //update current prefrence with appName removed 
        currentPrefernce.blcokedApps = blokedApps;

        //save the prefrence to db
        const saved = await currentPrefernce.save();
       
        if(saved) 
             return res.status(200).send('App removed from block list');
        else
            return res.status(500).send('Internal server error');

    }catch(err){
        next(err);
    }
}

