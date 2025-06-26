function TimeStamps({date}){
    const now = new Date(); // Current time
    const postTime = new Date(date);
    
    const diffInSeconds = Math.floor((now-postTime)/1000); 
    const diffInMinutes = Math.floor(diffInSeconds/60);
    const diffInHours = Math.floor(diffInMinutes/60);
    const diffInDays = Math.floor(diffInHours/24);
    const diffInMonths = Math.floor(diffInDays/30);
    const diffInYears = now.getFullYear()-postTime.getFullYear();
    
    // Same minute
    if (diffInSeconds<60){
        return diffInSeconds + ' seconds ago';
    }
    // Same hour
    if (diffInMinutes<60){
        return diffInMinutes + ' minutes ago'
    }
    // Same day
    if (diffInHours<24){
        return diffInHours + ' hours ago';
    }
    
    // Less than a month
    const month = postTime.getMonth();
    if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12){
        if(diffInDays<31){
            return diffInDays + ' days ago';
        }
    } else if(month == 4 || month == 6 || month == 9 || month == 11){
        if(diffInDays<30){
            return diffInDays + ' days ago';
        }
    } else {
        if(diffInDays<28){
            return diffInDays + ' days ago';
        } 
    }
    
    // Less than a year 
    if(diffInDays<365){
        return diffInMonths + ' months ago';
    }
        
    // More than a year
    return diffInYears + ' year(s) ago';
}

export default TimeStamps;