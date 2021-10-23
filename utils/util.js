export function minutesToTime(minute){
    if(minute===undefined) return [];
    const hour = parseInt(minute/60);
    const minutes = parseInt(minute%60);
    return [hour,minutes];
}

export function timeToMinutes(hour){
    if(hour === undefined) return;
    const minute =  (hour[0] === undefined ? 0 : hour[0] * 60) + (hour[1] === undefined ? 0 : hour[1]);
    return minute;
}

export function checkOverlap(intervals,newInterval){
    if(intervals.length==0)
        return false;
    for(let inetrval of intervals){
        if(newInterval[0]<=inetrval[1]) return true;
    }
    return false;
}

