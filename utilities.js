const dateStringToText = (dateString) => {
    if (dateString.length != 10)
        return ''

    let year = dateString.substring(0, 4)
    let month = dateString.substring(5, 7)
    let day = Number(dateString.substring(8, 10))

    let ones = [1, 21, 31]
    let twos = [2, 22]
    let threes = [3, 23]

    let dayText = ''
    if (day in ones)
        dayText = String(day) + 'st'
    else if (day in twos)
        dayText = String(day) + 'nd'
    else if (day in threes)
        dayText = String(day) + 'rd'
    else
        dayText = String(day) + 'th'

    let months = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    }
    let monthText = months[month]

    return dayText + ' ' + monthText + ' ' + year
}

module.exports.dateStringToText = dateStringToText