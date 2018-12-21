function getLinkFromPage(text) {
    const link = text.match(/"publicLink":"(.*?)"/);
    return link[1]
}

async function getPublicProfile(recruiterUrl) {
    return await fetch(recruiterUrl)
        .then(res => res.text())
        .then(getLinkFromPage)
}

function getTargetRole(role) {
    let targetRole = "";
    if (role.match(/(engineer|developer)/i)) {
        targetRole = "SE";
    } else if (role.match(/(designer|ux)/i)) {
        targetRole = "PD";
    } else if (role.match(/(product manager | pm)/i)) {
        targetRole = "PM";
    }
    return targetRole;
}

function getShortLocation(location) {
    let shortLocation = location;
    if (location.match(/(new york|nyc)/i)) {
        shortLocation = "NYC";
    } else if (location.match(/(chicago)/i)) {
        shortLocation = "Chicago";
    } else if (location.match(/(maryland|virginia|washington|columbia)/i)) {
        shortLocation = "DC";
    }
    return shortLocation;
}

async function buildRows() {
    const names = Array.from($(".name a")).map(a => a.innerText);
    const locations = Array.from($(".demographic dd:first-of-type")).map(a => a.innerText);
    const headlines = Array.from($(".headline")).map(a => a.innerText);
    const profilePromises = Array.from($(".name a")).map(a => a.href).map(getPublicProfile);
    const profiles = await Promise.all(profilePromises);
    return names.map((name, index) => {
        const role = headlines[index];
        const location = locations[index];

        const targetRole = getTargetRole(role);
        let shortLocation = getShortLocation(location);

        return [name, shortLocation, role, targetRole, profiles[index]];
    });
}

function convertToCSV(rows) {
    return rows
        .map(function (d) {
            return JSON.stringify(d);
        })
        .join('\n')
        .replace(/(^\[)|(\]$)/mg, '');
}

function buildLink(encodedUri) {
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "li_dd.csv");
    document.body.appendChild(link); // Required for FF
    return link;
}

async function generateAndDownloadCSV() {
    const rows = await buildRows();
    const csvRows = convertToCSV(rows);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Location,Current Role,Target RoleProfile Link\r\n";
    csvContent += csvRows;

    const encodedUri = encodeURI(csvContent);
    const link = buildLink(encodedUri);

    link.click();
}

generateAndDownloadCSV();
