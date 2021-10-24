const util = require('../utils/util');
const Prefrences = require('../models/preferences');
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
exports.addSchedule = async (req,res,next)=>{
        try{


            const userid = req.user;

            //get the data from request body
            const day = req.body.day;
            let start_time = req.body.start_time;
            let end_time = req.body.end_time;

            //verifiy if got all data
            if(!day || !start_time || !end_time || !days.includes(day)){
               return  res.status(400).send('Bad request provide correct input');
            }

            start_time = util.parseTime(start_time);
            end_time = util.parseTime(end_time);

            if(!util.vrifiyTime(start_time) || !util.vrifiyTime(end_time)){
                return res.status(400).send('Bad request invalid time');
            }

            
            //convert times to minute and create slot interval
            const start_time_minutes = util.timeToMinutes(start_time);
            const end_time_minutes = util.timeToMinutes(end_time);
            const slot = [start_time_minutes,end_time_minutes];


            //check given time interval is wrong or not  
            if(start_time_minutes > end_time_minutes){
                return res.status(400).send('Bad request stratTime greater than endTime');
            }
            
            //get the prefrence objecct from db;
            let currentPrefernce = await Prefrences.findOne({
                user : userid,
            });

            //objecct not found in db 
            //add new and save
            if(!currentPrefernce){

                const pref = new Prefrences({
                    user : userid,
                    schedule:{
                        day : day,
                        slots :[slot]
                    }
                })

                const saved = await  pref.save();

                if(saved) 
                    return res.status(200).send('Schedule saved sucess');
                else
                    return res.status(500).send('Internal server error');
            }

            //fetch the schedule for the day 
            let daySchedule = util.getDayScehdule(currentPrefernce.schedule,day);
            
            //current day has no schedules 
            //push the new schedule and save
            if(!daySchedule){
                currentPrefernce.schedule.push({
                    day: day,
                    slots:[slot]
                });

                const saved = await currentPrefernce.save();

                if(saved) 
                    return res.status(200).send();
                else
                    return res.status(500).send('Internal server error');
            }

            //fetch the current slots
            let currentSlots = daySchedule.slots;
            
            let newSlots = util.addInterval(currentSlots,slot);

            //when their is an overlaping schedule
            if(!newSlots){
                return res.status(400).send('Bad request Overlaping schedules');
            }

            //update the currentPrefrence with new schedule
            const updated = util.updateSlot(currentPrefernce.schedule,day,newSlots);

            if(updated){

                const saved = await currentPrefernce.save();

                if(saved) 
                    return res.status(200).send('Schedule added');
                else
                    return res.status(500).send('Internal server error');

            }else{
                return res.status(500).send('Internal server error');
            }

        }catch(err){
            next(err);
        }
}

exports.getScehdule = async (req,res,next)=>{
    try{
        const userid = req.user;
        const day = req.params.day;

        if(!day || !days.includes(day)){

            return res.status(400).send('Bad request please provide correct day');
        }

        const currentPrefernce = await Prefrences.findOne({
            user : userid,
            schedule:{
                $elemMatch:{day:day}
            }
        });

        if(!currentPrefernce){
            return res.status(404).send('Schedule not found');
        }

        //fetch the schedule for the day 
        const daySchedule = util.getDayScehdule(currentPrefernce.schedule,day);

        //if daySchedule is undefined for some reason 
        if(!daySchedule){
            return res.status(500).send('Internal server error');
        }

        //create the return data 
        let returnData = {
            'day' : day,
            'schedule':[]
        };

        //get slots and conevert from minutes to time and save in return data object
        for(let slot of  daySchedule.slots){
           const startTime = util.minutesToTime(slot[0]);
           const endTime =  util.minutesToTime(slot[1]);

           let schedule = returnData['schedule'];
           schedule.push({
               'start_time' : `${startTime[0]}:${startTime[1]}`,
               'end_time'   :  `${endTime[0]}:${endTime[1]}`
           });

           returnData['schedule']=schedule;   
        }
        
        res.status(200).json(returnData);

    }catch(err){
        next(err);
    }
}

exports.updateSchedule = async (req,res,next)=>{
    try{
        const userid = req.user;
        const day = req.params.day;

        let current_start_time = req.body.current.start_time;
        let current_end_time = req.body.current.end_time;

        let update_start_time = req.body.update.start_time;
        let update_end_time = req.body.update.end_time;


        //verifiy if got all data
        if(!day || !current_start_time || !current_end_time || !days.includes(day) || !update_start_time || !update_end_time){
            return  res.status(400).send('Bad request provide correct input');
        }


        const currentPrefernce = await Prefrences.findOne({
            user : userid,
            schedule:{
                $elemMatch:{day:day}
            }
        });

        if(!currentPrefernce){
            return res.status(404).send('Schedule for the day not found');
        }

        //parse the time to array
        current_start_time = util.parseTime(current_start_time);
        current_end_time = util.parseTime(current_end_time);

        update_start_time = util.parseTime(update_start_time);
        update_end_time = util.parseTime(update_end_time);
        
       //convert times to minute and create slot interval
       const current_start_time_minutes = util.timeToMinutes(current_start_time);
       const current_end_time_minutes = util.timeToMinutes(current_end_time);
       const current_slot = [current_start_time_minutes,current_end_time_minutes];

       const update_start_time_minutes = util.timeToMinutes(update_start_time);
       const update_end_time_minutes = util.timeToMinutes(update_end_time);
       const update_slot = [update_start_time_minutes,update_end_time_minutes];


       //fetch the schedule for the day 
       const daySchedule = util.getDayScehdule(currentPrefernce.schedule,day);

       //if daySchedule is undefined for some reason 
       if(!daySchedule){
           return res.status(500).send('Internal server error');
       }

       //fetch the current slots
       let currentSlots = daySchedule.slots;

       //update slot value with new slot and get data in currentSlots itself 
       const slotUpdated = util.findAndUpdateSlot(currentSlots,current_slot,update_slot);
       
       //not updated as current slot not found
       if(!slotUpdated){
            return res.status(404).send('Schedule not found');
       }

       const updated = util.updateSlot(currentPrefernce.schedule,day,currentSlots);
        
       if(!updated){
         return res.status(500).send('Internal server error');
       }


       const saved = await currentPrefernce.save();

       if(saved) 
           return res.status(200).send('Update success');
       else
           return res.status(500).send('Internal server error');
       

    }catch(err){
        next(err);
    }
}


exports.deleteSchedule = async (req,res,next)=>{
    try{
        const userid = req.user;
        const day = req.params.day;

        let start_time = req.body.start_time;
        let end_time = req.body.end_time;

        


        //verifiy if got all data
        if(!day || !end_time || !days.includes(day) || !start_time){
            return  res.status(400).send('Bad request provide correct input');
        }


        const currentPrefernce = await Prefrences.findOne({
            user : userid,
            schedule:{
                $elemMatch:{day:day}
            }
        });

        if(!currentPrefernce){
            return res.status(404).send('Schedule for the day not found');
        }

        //parse the time to array
        start_time = util.parseTime(start_time);
        end_time = util.parseTime(end_time);

        
        
       //convert times to minute and create slot interval
       const start_time_minutes = util.timeToMinutes(start_time);
       const end_time_minutes = util.timeToMinutes(end_time);
       const slot = [start_time_minutes,end_time_minutes];

       

       //fetch the schedule for the day 
       const daySchedule = util.getDayScehdule(currentPrefernce.schedule,day);

       //if daySchedule is undefined for some reason 
       if(!daySchedule){
           return res.status(500).send('Internal server error');
       }

       //fetch the current slots
       let currentSlots = daySchedule.slots;

       //delete the slot and get new slots in currentSlots
       const slotUpdated = util.findAndDeleteSlot(currentSlots,slot);
       
       //not updated as current slot not found
       if(!slotUpdated){
            return res.status(404).send('Schedule not found');
       }

       const updated = util.updateSlot(currentPrefernce.schedule,day,currentSlots);
        
       if(!updated){
         return res.status(500).send('Internal server error');
       }


       const saved = await currentPrefernce.save();

       if(saved) 
           return res.status(200).send('Delete success');
       else
           return res.status(500).send('Internal server error');
       

    }catch(err){
        next(err);
    }
}


