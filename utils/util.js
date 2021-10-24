exports.minutesToTime=(minute)=>{
    if(minute===undefined) return [];
    const hour = parseInt(minute/60);
    const minutes = parseInt(minute%60);
    return [hour,minutes];
}

exports.timeToMinutes=(hour)=>{
    if(hour === undefined) return;
    const minute =  (hour[0] === undefined ? 0 : hour[0] * 60) + (hour[1] === undefined ? 0 : hour[1]);
    return minute;
}

//helper function for the following
//check whether two inetrvals overlap
doesOverlap = (a,b)=>{
    return (Math.min(a[1],b[1]) >= Math.max(a[0],b[0]));
}

exports.addInterval = (intervals,newInterval)=>{
    //no intevals present
    if(intervals.length==0)
        return [...newInterval];

    //new interval can be added at the begining
    if(newInterval[1] < intervals[0][0]){
        intervals.unshift(newInterval);
        return intervals;
    }

    //new interval can be added at the end
    if(newInterval[0]>intervals[intervals.length-1][1]){
        intervals.push(newInterval);
        return intervals;
    }

    //find postion for new interval or if it overlap return 
    let temp = [];
    for(let i=0; i<intervals.length;i++){

        if(doesOverlap(intervals[i],newInterval)){
            return;
        }

        temp.push(intervals[i]);

        if(i<intervals.length && newInterval[0] > intervals[i][1] && newInterval[1]<intervals[i+1][0]){
            temp.push(newInterval);
        }
    }

    return temp;
}


exports.parseTime = (time)=>{
    if(!time){
        return [0,0];
    }

    time = time.split(':').map((t)=>{
        if(!t){
            return 0;
        }else{
            return parseInt(t);
        }
    })

    return time;
}


exports.vrifiyTime = (time)=>{
    if(time.length!==2){
        return false;
    }
    return time[0] < 24 && time[1] < 60;
}


exports.getDayScehdule = (schedules,day)=>{
    for(let schedule of schedules){
        if(schedule.day===day){
            return schedule;
        }
    }
    return;
}

exports.updateSlot = (schedules,day,newSlots)=>{
    for(let schedule of schedules){
        if(schedule.day===day){
            schedule.slots = newSlots
            return true;
        }
    }
    return false;
}

exports.findAndUpdateSlot = (slots,current,update)=>{
    let low = 0;
    let high = slots.length-1;

    while(low<=high){
        const mid = low + parseInt((high-low)/2);
        if(slots[mid][0]===current[0]){

            slots[mid][0] = update[0];
            slots[mid][1] = update[1];

            slots.sort((a,b)=>a[0]-b[0]);

            return true;

        }else if(slots[mid][0]>current[0]){
            high = mid-1;
        }
        else{
            low = mid+1;
        }
    }

    return false;
}

exports.findAndDeleteSlot = (slots,target)=>{
    let low = 0;
    let high = slots.length-1;

    while(low<=high){
        const mid = low + parseInt((high-low)/2);
        if(slots[mid][0]===target[0]){

            slots.splice(mid,1);

            return true;

        }else if(slots[mid][0]>target[0]){
            high = mid-1;
        }
        else{
            low = mid+1;
        }
    }

    return false;
}