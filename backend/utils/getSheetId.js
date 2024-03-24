const getSpreadsheetId = (url) => {
    const idStartIndex = url.indexOf('/d/') + 3; // Find the start of the ID
    const idEndIndex = url.indexOf('/edit'); // Find the end of the ID
    if (idStartIndex !== -1 && idEndIndex !== -1) {
        return url.slice(idStartIndex, idEndIndex);
    } else {
        return null; // If the URL format is invalid
    }
}

module.exports = getSpreadsheetId;


  
