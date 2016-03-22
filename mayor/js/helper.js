function getFollowers(f) {
    var r;
    f.Followers != null ? r = f.Followers.length : r = 0;
    return r;

}

function dateFormat(date) {

    var mshours = 60 * 60 * 1000,
        msDay = 60 * 60 * 24 * 1000,
        msMinutes = 60 * 1000,
        then = new Date(date),
        now = new Date(),
        string = '';

    var days = Math.floor((now - then) / msDay),
        hours = Math.floor(((now - then) % msDay) / mshours),
        minutes = Math.floor(((now - then) % msDay) / msMinutes);
    if (days > 0) {
        days == 1 ? string += days + " ден," : string += days + " дни,";
    }
    if (mshours > 0) {
        hours == 1 ? string += hours + " час" : string += hours + " часа";
    }
    if (minutes > 0 && minutes < 60) {
        minutes == 1 ? string = minutes + " минута" : string = minutes + " минути";
    }
    if (days == 0 && hours == 0 && minutes == 0) {
        var seconds = Math.floor((now - then) / 1000);
        seconds == 1 ? string = seconds + " секунда" : string = seconds + " секунди";
    }

    return string;
}