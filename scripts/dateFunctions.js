export {msToDays, daysToAbsoluteDate, daysRelativeToReferenceDate}

//Converts millisecounds to relative days
function msToDays(millisecounds) {
    return millisecounds / (1000 * 60 * 60 * 24)
}

//Converts relative days to absolute date, based on a refernce date
function daysToAbsoluteDate(referenceDate, relativeDays) {
    return new Date(referenceDate.getTime() + (relativeDays * 24 * 60 * 60 * 1000));
}

//Absolute Date as relative days (float) to Reference Date
function daysRelativeToReferenceDate(referenceDate, absoluteDate) {
    return (new Date(absoluteDate.getTime()) - new Date(referenceDate.getTime())) / (1000 * 60 * 60 * 24);;
}