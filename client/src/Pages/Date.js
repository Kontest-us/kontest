/**
 * Finds the milliseconds elapsed since January 1, 1970, 00:00:00, UTC (standard datetime)
 * @param includeSeconds Whether to include seconds in this calculation
 * @returns Number representing milliseconds elapsed since standard datetime
 */
export function getOffset(includeSeconds) {
    var current = new Date();

    var hours = current.getHours();
    var minutes = current.getMinutes();
    var year = current.getFullYear();
    var month = current.getMonth();
    var day = current.getDate();
    var seconds = current.getSeconds();

    if (includeSeconds) {
        return Date.UTC(year, month, day, hours, minutes, seconds);
    } else {
        return Date.UTC(year, month, day, hours, minutes);
    }
}

//Gets the string format "YY:MM:DD HH:MM" from a Date object
export function getFullDate(dateObject, includeSeconds) {
    var hours = dateObject.getHours();
    var minutes = dateObject.getMinutes();
    var year = dateObject.getFullYear();
    var month = dateObject.getMonth() + 1;
    var day = dateObject.getDate();
    var seconds = dateObject.getSeconds();

    //Make sure to add zeros if any values are single digit
    if (String(day).length === 1) {
        day = '0' + day;
    }

    if (String(month).length === 1) {
        month = '0' + month;
    }

    if (String(minutes).length === 1) {
        minutes = '0' + minutes;
    }

    if (String(hours).length === 1) {
        hours = '0' + hours;
    }

    if (String(seconds).length === 1) {
        seconds = '0' + seconds;
    }

    //combine
    let time = hours + ':' + minutes;
    let date = year + '-' + month + '-' + day;

    if (includeSeconds) {
        time += ':' + seconds;
    }

    return date + ' ' + time;
}

export function timeToServer(serverOffset, time, includeSeconds) {
    let localOffset = getOffset(includeSeconds);

    let millisecondsDifference = localOffset - serverOffset;

    let newD = getDateObject(time);

    newD.setTime(newD.getTime() + millisecondsDifference);

    return getFullDate(newD, includeSeconds);
}

/*
Returns a dateobject

Source: https://stackoverflow.com/questions/33231447/date-gettime-returns-differents-values-on-ios-and-windows

dateString in format YYYY-MM-DD HH:MM
*/
export function getDateObject(dateString) {
    var aDate = dateString.split(' ')[0].split('-');
    var aTime = dateString.split(' ')[1].split(':');

    //include seconds if they are include
    if (aTime.length == 3) {
        return new Date(
            aDate[0],
            aDate[1] - 1,
            aDate[2],
            aTime[0],
            aTime[1],
            aTime[2],
        );
    }

    return new Date(aDate[0], aDate[1] - 1, aDate[2], aTime[0], aTime[1], 0);
}

//Returns true if the start time is after the end time

export function badDates(startTime, startDate, endTime, endDate) {
    let fullStart = startDate + ' ' + startTime;
    let fullEnd = endDate + ' ' + endTime;

    var startD = new Date(fullStart.replace(' ', 'T'));
    var endD = new Date(fullEnd.replace(' ', 'T'));

    return startD.getTime() >= endD.getTime();
}

export function getTimezoneName() {
    return Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone.split('_')
        .join(' ');
}

export function getNewDate(startDate, timeStart, additionalHours) {
    // for am single digit times, Date class only takes 09:34 instead of 9:34
    let startDateArr = timeStart.split(':');

    let dateString = '';

    if (String(startDateArr[0]).length === 1) {
        dateString = startDate + ' ' + '0' + timeStart;
    } else {
        dateString = startDate + ' ' + timeStart;
    }

    //https://stackoverflow.com/questions/13363673/javascript-date-is-invalid-on-ios
    //Need to do this for mobile devices do to ES5 specification

    let newD = new Date(dateString.replace(' ', 'T'));

    newD.setTime(newD.getTime() + additionalHours * 60 * 60 * 1000);

    let hours = newD.getHours();
    let minutes = newD.getMinutes();
    let year = newD.getFullYear();
    let month = newD.getMonth() + 1;
    let day = newD.getDate();

    if (String(day).length === 1) {
        day = '0' + day;
    }

    if (String(month).length === 1) {
        month = '0' + month;
    }

    if (String(minutes).length === 1) {
        minutes = '0' + minutes;
    }

    if (String(hours).length === 1) {
        hours = '0' + hours;
    }

    return {
        time: hours + ':' + minutes,
        date: year + '-' + month + '-' + day,
    };
}
