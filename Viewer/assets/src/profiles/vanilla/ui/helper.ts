export function msToTime(value: number, truncateHours: boolean = false, showMilliseconds: boolean = true) {
    const milliseconds: string | number = Math.floor((value % 1000) / 100);
    let seconds: string | number = Math.floor((value / 1000) % 60),
        minutes: string | number = Math.floor((value / (1000 * 60)) % 60),
        hours: string | number = Math.floor((value / (1000 * 60 * 60)) % 24);
            
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
        
    let ms = "";
    if (showMilliseconds) {
        ms = "." + milliseconds;
    }

    if (truncateHours && hours === 0) {
        return minutes + ":" + seconds + ms;
    } else {
        hours = (hours < 10) ? "0" + hours : hours;
        return hours + ":" + minutes + ":" + seconds + ms;
    }

}