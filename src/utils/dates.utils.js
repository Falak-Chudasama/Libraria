const addToDate = (date, addDays) => {
    if (isNaN(date.getTime())) {
        throw new Error("Invalid base date provided.");
    }
    return new Date(date.getTime() + (addDays * 24 * 60 * 60 * 1000));
};

const compareDates = (date1, date2) => {
    const validDate1 = new Date(date1);
    const validDate2 = new Date(date2);

    if (isNaN(validDate1.getTime()) || isNaN(validDate2.getTime())) {
        throw new Error("Invalid date provided for comparison.");
    }

    if (validDate1 < validDate2) {
        return -1;
    } else if (validDate1 >= validDate2) {
        return 1;
    } else {
        return 0;
    }
};

export {
    addToDate,
    compareDates
};