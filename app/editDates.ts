const msInADay: number = 86400000;

function createDateRange(start: number, end: number): number[] {
  let dateList: number[] = [];
  let day: number = start;
  if (end == start) {
    return [start];
  }

  end -= msInADay;

  while (day != end) {
    //Add 1 day, and push to list of dates
    day += msInADay;
    dateList.push(day);
  }
  return [start, ...dateList, (end += msInADay)];
}

interface DateTable {
  [timestamp: string]: number;
}

function updateDates(
  dateTable: DateTable,
  startDate: number,
  endDate: number,
  quantity: number,
  totalQuantityForProduct: number
) {
  let dateTableKeys: string[] = Object.keys(dateTable);

  //Filter for dates within start date and end date
  let datesInRange = dateTableKeys.filter((date) => {
    return parseInt(date) >= startDate && parseInt(date) <= endDate;
  });

  //Get quanties of dates within start date and end date
  let quantitiesInRange = datesInRange.map(
    (timestamp) => dateTable[timestamp.toString()]
  );

  //Get list of dates to be added
  let datesToBeAdded = createDateRange(startDate, endDate);

  //Check if the amount of product on that day minus quantity ordered is over 0, or if there are no orders during that timespan
  if (
    quantitiesInRange.some((productOnDay) => productOnDay - quantity > 0) ||
    quantitiesInRange.length < 1
  ) {
    //Edit dateTable object to get final dates
    for (let i = 0; i < datesToBeAdded.length; i++) {
      if (dateTable[datesToBeAdded[i]]) {
        //If date already exists, subtract quantity from it
        dateTable[datesToBeAdded[i]] -= quantity;
      } else {
        //Else add that day, and set quantity to total quantity minus amount ordered
        dateTable[datesToBeAdded[i]] = totalQuantityForProduct - quantity;
      }
    }
    const returnDate = endDate + msInADay;
    if (dateTable[returnDate]) {
      //Add quantity back to date object after order completed if existing quantity on that day
      dateTable[returnDate] += quantity;
    } else {
      //Else set quantity to total
      dateTable[returnDate] = totalQuantityForProduct;
    }
    return dateTable;
  }
}

export { createDateRange, updateDates, DateTable };
