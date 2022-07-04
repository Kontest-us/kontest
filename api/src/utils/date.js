//Declare date namespace

var dateNs = {};

/* Helper Methods */

//Converts milliseconds to minutes
function millToMin(milliseconds) {
    return milliseconds / 60000;
}

//Gets the string format "YY:MM:DD HH:MM" from a Date object
function getFullDate(dateObject, includeSeconds) {
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

/* Export Methods */

/**
 * [Checks if the current time falls within a time interval
 * @param  {String} start Lower bound in datetime format
 * @param  {String} stop  Upper bound in datetime format
 * @return {Boolean}      If the current time is within the interval
 */
dateNs.checkTime = function (start, stop) {
    var currentTime = new Date();
    currentTime = currentTime.getTime(); //number of milliseconds

    start = new Date(start).getTime(); //number of milliseconds
    stop = new Date(stop).getTime(); //number of milliseconds

    return currentTime >= start && currentTime <= stop;
};

/**
 * Returns an integer that represents the state of the current time
 * @param  {String} start Lower bound in datetime format
 * @param  {String} stop  upper bound in datetime format
 * @return {Integer}      0 - game hasn't started, 1 - game has started, 2 - game is over
 */

dateNs.gameTime = function (start, stop) {
    var currentTime = new Date();
    currentTime = currentTime.getTime(); //number of milliseconds

    start = new Date(start).getTime(); //number of milliseconds
    stop = new Date(stop).getTime(); //number of milliseconds

    if (currentTime < start) {
        return 0;
    } else if (currentTime > stop) {
        return 2;
    }
    return 1;
};

/**
 * checks if the current time falls within the start and stop time
 */
dateNs.goodTime = function (data) {
    //data is a JSON object

    var currentTime = new Date();
    currentTime = currentTime.getTime(); //number of milliseconds

    start = new Date(data['start']).getTime(); //number of milliseconds
    stop = new Date(data['end']).getTime(); //number of milliseconds

    if (!data['live']) {
        return {
            message: "You cannot submit an answer because the game isn't live!",
            success: false,
        };
    }

    if (currentTime < start) {
        return {
            message:
                "You cannot submit an answer because the game hasn't started yet!",
            success: false,
        };
    } else if (currentTime > stop) {
        return {
            message: 'You cannot submit an answer because the game has ended!',
            success: false,
        };
    }
    return { message: '', success: true };
};

/**
 * Finds the milliseconds elapsed since January 1, 1970, 00:00:00, UTC (standard datetime)
 * @param includeSeconds Whether to include seconds in this calculation
 * @returns Number representing milliseconds elapsed since standard datetime
 */
dateNs.getOffset = function (includeSeconds) {
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
};

dateNs.timeToServer = function (clientOffset, time, includeSeconds) {
    let localOffset = dateNs.getOffset(includeSeconds);

    let millisecondsDifference = localOffset - clientOffset;

    let newD = new Date(time.replace(' ', 'T'));

    newD.setTime(newD.getTime() + millisecondsDifference);

    return getFullDate(newD, includeSeconds);
};

// Export all the things! *\('o')|
for (prop in dateNs) {
    if (dateNs.hasOwnProperty(prop)) {
        //make sure the key belongs to this JSON object
        module.exports[prop] = dateNs[prop];
    }
}
