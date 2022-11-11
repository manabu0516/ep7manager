
const request = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');

const imagePath = (text) => {
    const imgIdx = text.indexOf("SELECTED_SKIN");
    const imgStartIndex = text.indexOf("'", imgIdx);
    const imgEndIndex = text.indexOf("';", imgIdx);
    const imgPath = text.substring(imgStartIndex+1, imgEndIndex);
    return imgPath;
}; 

const statusValue = ($, $td) => {
    const $awakening = $($td).find("span");

    if($awakening.length === 0) {
        return $($td).text().trim().replace("%", "");
    }

    let counter = 0;
    $awakening.each((idx, e) => {
        const value = parseInt($(e).text().trim().replace("%", "").replace("+", "").replace("(", "").replace(")", ""));
        counter += value;
    });

    return counter + '';
};

const textNodeData = (contents) => {
    const str = [];
    for (let i = 0; i < contents.length; i++) {
        const node = contents[i];
        if(node.type !== "text") {
            continue;
        }
        str.push(node.data.trim())
    }
    return mergeSpace(str.join("\r\n").trim());
};

const mergeSpace = (str) => {
    str=str.replace(/(\s|&nbsp;)+/g, ' ');
    return str;
};

const skillDescParse = ($, $div) => {
    const data = {
        text : "",
        burn : "",
        soul : null,
        ct : null,
        enhance : [],
        multipliers : "",
    };

    $div.each((idx, elem) => {
        const $elem = $(elem);

        const soul = $elem.hasClass("soul-required");
        const burn = $elem.hasClass("burn-effect");
        const ct = $elem.hasClass("awakening-stat");
        const extention = $elem.hasClass("panel");

        if(soul === true) {
            data.soul = mergeSpace($elem.text().toLocaleLowerCase().replace("souls", "soul")).trim();
        }

        if(soul === false && burn == true) {
            data.burn = textNodeData($elem.contents());
        }

        if(ct === true) {
            data.ct = textNodeData($elem.contents()).replace("turns", "").trim()
        }

        if(extention === true) {
            const extType = $elem.prev().text().trim();
            if(extType.indexOf("Enhancements") !== -1) {
                $elem.find(".f-14").each((i,e) => {
                    const enhanceText = $(e).text().trim().replace(";", ":");
                    if(enhanceText === '') {
                        return;
                    }
                    const enhanceValues = enhanceText.split(":");
                    data.enhance.push(enhanceValues[1].trim());
                })
            }

            if(extType.indexOf("Multipliers") !== -1) {
                data.multipliers = $elem.text().trim();
            }
        }

        if(soul===false && burn === false && ct === false && extention === false) {
            data.text = $elem.text().trim();
        }
    });

    return data;
}

const skillParse = ($, $div) => {
    return {
        title : $($div).find(".skill-title").text().trim(),
        type : $($div).find(".skill-type").text().trim(),
        description : skillDescParse($, $($div).find(".description "))
    };
};

const memoryParse = ($, $div) => {
    const result = [];

    $($div).find(".pure-g").each((i, e) => {
        const text = $(e).find(".f-14").text().trim();
        const idx = text.lastIndexOf(" ");

        const key = text.substring(0, idx).trim();
        const value = text.substring(idx).trim().replace("+", "");
        result.push({
            key : key,
            value : value
        });
    });

    return result;
};

module.exports = async (key) => {
    const url = "https://epic7x.com/character/"+key+"/";

    const response = await request(url);
    const $ = cheerio.load(response);
    const result = {};

    const $common = $("#app .pure-u-1 img.character-rarity");

    result.common = {
        name : $("#app h1").text().trim(),
        image : imagePath(response),
        attribute : path.basename($($common[0]).attr("data-src"), ".png").toLocaleLowerCase().replace(" ", "-"),
        sign : path.basename($($common[1]).attr("data-src"), ".png").toLocaleLowerCase().replace(" ", "-"),
        clazz :  path.basename($($common[2]).attr("data-src"), ".png").toLocaleLowerCase().replace(" ", "-"),
        rarity : path.basename($($common[3]).attr("data-src"), ".png").toLocaleLowerCase().replace(" ", "-").replace("-star", "")
    };

    const $status = $(".stats-table");
    const $commonStatus = $($status[2]).find("tbody tr td");
    const $levelStatus = $($status[1]).find("tr").last().find("td");

    result.statusData = {
        "Critical_Hit_Chance" : statusValue($, $commonStatus[0]),
        "Critical_Hit_Damage" : statusValue($, $commonStatus[1]),
        "dual_attack" : statusValue($, $commonStatus[2]),
        "Effectiveness" : statusValue($, $commonStatus[3]),
        "Effect_Resistance" : statusValue($, $commonStatus[4]),
        "Speed" : statusValue($, $commonStatus[5]),
        "Atk" : statusValue($, $levelStatus[3]),
        "HP" : statusValue($, $levelStatus[4]),
        "Def" : statusValue($, $levelStatus[5])
    };

    result.labyrinth = [];
    $("#Labyrinth div.pure-g .pure-g .pure-u-1-2").each((i, e) => {
        const chatName = $(e).find("h4").text().trim();
        const chatScore = parseInt($(e).find("span").text().trim());

        result.labyrinth.push({
            key : chatName,
            score : chatScore
        })
    });

    const $memory = $("#MemoryImprint");
    const $memoryContainer = $memory.find(".pure-g .pure-u-md-1-3");

    if($memory.length != 0) {
        result.memory = {
            potision : path.basename($memory.find("div.pure-g div.pure-u-1-2 img").attr("data-src"), ".png"),
            release : memoryParse($, $memoryContainer[1]),
            concentration : memoryParse($, $memoryContainer[2])
        };
    }

    const $skills = $("#Skills .skill");

    result.skills = [
        skillParse($, $skills[0]),skillParse($, $skills[1]),skillParse($, $skills[2])
    ];

    return result;
};