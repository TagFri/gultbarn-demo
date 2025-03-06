export {msToDays, daysToMs, daysToAbsoluteDate, daysRelativeToReferenceDate, leadingZero, between, realtiveToGraphLabel}

//Converts millisecounds to relative days
function msToDays(millisecounds) {
    return millisecounds / (1000 * 60 * 60 * 24)
}

//Converts relative dats to millisecounds
function daysToMs(relativeDays) {
    return relativeDays * (1000 * 60 * 60 * 24)
}

//Converts relative days to absolute date, based on a refernce date
function daysToAbsoluteDate(referenceDate, relativeDays) {
    console.log(referenceDate)
    console.log(typeof referenceDate)
    return new Date(referenceDate.getTime() + (relativeDays * 24 * 60 * 60 * 1000));
}

//Absolute Date as relative days (float) to Reference Date
function daysRelativeToReferenceDate(referenceDate, absoluteDate) {
    return (absoluteDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
}

//Insert leading zero for date/time <10:
function leadingZero(number) {
    return (number < 10) ? '0' + number : number;
}

//CHECK IF NUMBER IS BETWEEN MIN / MAX
function between(x, min, max) {
    return x >= min && x <= max;
}

//Make a relative day to pretty ormat (for graphing labels)
function realtiveToGraphLabel(relativeDate) {
    let date = daysToAbsoluteDate(relativeDate)
    let minutes = date.getMinutes()
    if (minutes < 10) {minutes = "0" + minutes} else {minutes = minutes}
    let hours = date.getHours()
    if (hours < 10) {hours = "0" + hours} else {hours = hours}
    let days = date.getDate()
    if (days < 10) {days = "0" + days} else {days = days}
    let months = date.getMonth() + 1
    if (months < 10) {months = "0" + months} else {months = months}
    let years = date.getFullYear()
    years = years.toString().slice(-2)
    return (days + "/" + months + "-" + years + " kl." + hours + ":" + minutes)
}