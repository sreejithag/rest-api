const util = require('../utils/util');
const Prefrences = require('../models/preferences');

const maxMinutesInDay = 24*60; 
const minMinutesInday = 0;

exports.addRestriction = async (req,res,next)=>{
    try{    
        const userid = req.user;
        const appName = req.body.appName;
        let weekDayLimit = req.body.weekDayLimit;
        let weekEndLimit = req.body.weekEndLimit;

        if(!appName || !weekDayLimit || !weekEndLimit){
            return  res.status(400).send('Bad request provide correct input');
        }
        
        weekDayLimit = util.parseTime(weekDayLimit);
        weekEndLimit = util.parseTime(weekEndLimit);

        const weekDayLimitMinutes = util.timeToMinutes(weekDayLimit);
        const weekEndLimitMinutes = util.timeToMinutes(weekEndLimit);

        //check if given limits are correct;
        if(weekDayLimitMinutes>maxMinutesInDay || weekEndLimitMinutes>maxMinutesInDay || 
           weekDayLimitMinutes<minMinutesInday || weekEndLimitMinutes<minMinutesInday){
                return res.status(400).send('Please provide valid restrictions');
        }
        
        

        let currentPrefernceWithAppName = await Prefrences.findOne({
            user : userid,
            restrictedApps:{
                $elemMatch:{name:appName}
            }
        });

        //app name not in prefrence of the user
        if(!currentPrefernceWithAppName){

            //fetch the prefrence for user
            let userPrefrence = await Prefrences.findOne({
                user : userid,
            });

            //create new object with the limit
            const restrictedApps = {
                name : appName,
                weekDayLimit : weekDayLimitMinutes,
                weekEndLimit : weekEndLimitMinutes
            }

            //fetch the restriced app object userPrefrence
            let restrictedAppsInPrefrence = userPrefrence.restrictedApps;

            //add the object to list 
            restrictedAppsInPrefrence.push(restrictedApps);

            const saved = await userPrefrence.save();

            if(saved) 
                 return res.status(200).send('Restriction added succesfully');
            else
                 return res.status(500).send('Internal server error');

        }

        //app alredy in the list update required 
        const updated = util.findAndUpdateRestritedApp(currentPrefernceWithAppName.restrictedApps,appName,weekDayLimitMinutes,weekEndLimitMinutes);

        //if updated correctly
        if(updated){
                //save the data to db
                const saved = await currentPrefernceWithAppName.save();
                if(saved){
                    return res.status(200).send('Restriction added succesfully');
                }else{
                    return res.status(500).send('Internal server error');
                }
        }else{
            return res.status(500).send('Internal server error');
        }
        
    }catch(err){
        next(err);
    }
}

exports.listAllRestrictions = async (req,res,next)=>{

    try{

        const userid = req.user;

       
        const userPrefrence = await Prefrences.findOne({
            user : userid
        });

        //fetch the user prefrence object from db
        if(!userPrefrence){
           return res.status(404).send('No prefrences found for the user');
        }

        const restrictedApps = userPrefrence.restrictedApps;

        if(!restrictedApps || restrictedApps.length===0 ){
            return res.status(404).send('No restricted apps found for the user');
        }

        let returnData = [];
        for(let app of restrictedApps){
            let restriction = {
                name : app.name,
                weekDayLimit : (util.minutesToTime(app.weekDayLimit)).join(':'),

                weekEndLimit : (util.minutesToTime(app.weekEndLimit)).join(':')

            };

            returnData.push(restriction);
        }

        if(!returnData){
            return res.status(500).send('Internal server error');
        }else{
            return res.status(200).json(returnData)
        }

    }catch(err){
        next(err);
    }
}

exports.listRestrictionForApp = async (req,res,next)=>{
    try{

        const userid = req.user;

        const appName = req.body.name;

        if(!appName){
            return  res.status(400).send('Bad request provide correct input');
        }


        const userPrefrence = await Prefrences.findOne({
            user : userid,
            restrictedApps:{
                $elemMatch:{name:appName}
            }
        });

        //fetch the user prefrence object from db
        if(!userPrefrence){
            return res.status(404).send('App not found in list');
        }

        const restrictedApps = userPrefrence.restrictedApps;

        if(!restrictedApps || restrictedApps.length===0 ){
            return res.status(404).send('App not found in list');
        }

        for(let app of restrictedApps){
            
            if(app.name === appName){
                let restriction = {
                    name : app.name,
                    weekDayLimit : (util.minutesToTime(app.weekDayLimit)).join(':'),
    
                    weekEndLimit : (util.minutesToTime(app.weekEndLimit)).join(':')
    
                }

                if(!restriction){
                    return res.status(500).send('Internal server error');
                }else{
                    return res.status(200).json(restriction)
                }
            }
            
        }

        return res.status(404).send('App not found in list');

    }catch(err){
        next(err);
    }
}

exports.deleteRestrictionForapp = async (req,res,next)=>{

    try{

        const userid = req.user;

        const appName = req.body.name;

        if(!appName){
            return  res.status(400).send('Bad request provide correct input');
        }


        let userPrefrence = await Prefrences.findOne({
            user : userid,
            restrictedApps:{
                $elemMatch:{name:appName}
            }
        });

        //fetch the user prefrence object from db
        if(!userPrefrence){
            return res.status(404).send('App not found in list');
        }

        let restrictedApps = userPrefrence.restrictedApps;

        if(!restrictedApps || restrictedApps.length===0 ){
            return res.status(404).send('App not found in list');
        }

        for(let i=0; i<restrictedApps.length;i++){
            
            if(restrictedApps[i].name === appName){
                restrictedApps.splice(i,1);

                const saved = await userPrefrence.save();

                if(saved){
                    return res.status(200).send('Restriction for app deleted');
                }else{
                    return res.status(500).send('Internal server error');
                }
            }
            
        }

        return res.status(404).send('App not found in list');

    }catch(err){
        next(err);
    }

}

exports.editRestrictionForApp = async (req,res,next)=>{
    try{    
        const userid = req.user;
        const appName = req.body.appName;
        let weekDayLimit = req.body.weekDayLimit;
        let weekEndLimit = req.body.weekEndLimit;

        if(!appName || !weekDayLimit || !weekEndLimit){
            return  res.status(400).send('Bad request provide correct input');
        }
        
        weekDayLimit = util.parseTime(weekDayLimit);
        weekEndLimit = util.parseTime(weekEndLimit);

        const weekDayLimitMinutes = util.timeToMinutes(weekDayLimit);
        const weekEndLimitMinutes = util.timeToMinutes(weekEndLimit);


        //check if given limits are correct;
        if(weekDayLimitMinutes>maxMinutesInDay || weekEndLimitMinutes>maxMinutesInDay || 
            weekDayLimitMinutes<minMinutesInday || weekEndLimitMinutes<minMinutesInday){
                 return res.status(400).send('Please provide valid restrictions');
         }

        let currentPrefernceWithAppName = await Prefrences.findOne({
            user : userid,
            restrictedApps:{
                $elemMatch:{name:appName}
            }
        });

        //app name not in prefrence of the user send 404 error
        if(!currentPrefernceWithAppName){

            return res.status(404).send('App not found in restriction list');
            
        }

        //app alredy in the list update required 
        const updated = util.findAndUpdateRestritedApp(currentPrefernceWithAppName.restrictedApps,appName,weekDayLimitMinutes,weekEndLimitMinutes);

        //if updated correctly
        if(updated){
                //save the data to db
                const saved = await currentPrefernceWithAppName.save();
                if(saved){
                    return res.status(200).send('Restriction updated succesfully');
                }else{
                    return res.status(500).send('Internal server error');
                }
        }else{
            return res.status(500).send('Internal server error');
        }
        
    }catch(err){
        next(err);
    }

}