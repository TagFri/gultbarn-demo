export {msToDays, daysToMs, daysToAbsoluteDate, daysRelativeToReferenceDate, leadingZero}

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