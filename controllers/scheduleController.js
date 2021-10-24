const util = require('../utils/util');
const user = require('../models/user');
const Prefrences = require('../models/preferences');

exports.addSchedule = async (req,res,next)=>{
        try{


            const userid = req.user;

            //get the data from request body
            const day = req.body.day;
            let start_time = req.body.start_time;
            let end_time = req.body.end_time;

            //verifiy if got all data
            if(!day || !start_time || !end_time){
               return  res.status(400).send('Bad request');
            }

            start_time = util.parseTime(start_time);
            end_time = util.parseTime(end_time);

            if(!util.vrifiyTime(start_time) || !util.vrifiyTime(end_time)){
                return res.status(400).send('Bad request');
            }

            
            //convert times to minute and create slot interval
            const start_time_minutes = util.timeToMinutes(start_time);
            const end_time_minutes = util.timeToMinutes(end_time);
            const slot = [start_time_minutes,end_time_minutes];


            //check given time interval is wrong or not  
            if(start_time_minutes > end_time_minutes){
                return res.status(400).send('Bad request');
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
            const updated = util.updateDaySchedule(currentPrefernce.schedule,day,newSlots);

            if(updated){

                const saved = await currentPrefernce.save();

                if(saved) 
                    return res.status(200).send();
                else
                    return res.status(500).send('Internal server error');

            }else{
                return res.status(500).send('Internal server error');
            }

        }catch(err){
            next(err);
        }
}