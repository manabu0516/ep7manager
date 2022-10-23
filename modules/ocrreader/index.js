
const parseData = (text) => {
    const result = [];

    const data = text.split("\n")
        .map(e => e.trim().replace(/\s+/g, ""))
        .filter(e => e !== "");

    for (let i = 0; i < data.length; i++) {
        const d = data[i];
        if(d.indexOf("0/4") !== -1 || d.indexOf("0/2") !== -1) {
            break;
        }
        const checked = checkData(d);
        if(checked === null) {
            continue;
        }

        result.push({
            key : checked,
            value : checkValue(d)
        });
    }
    return result.length == 5 ? result.slice(1) : null;
};

const checkValue = (text) => {
    const data = text.replace(/[^0-9]/g, '');
    return data + (text.indexOf("%") !== -1 ? '%' : "");
};

const checkData = (text) => {

    if(text.indexOf("攻撃") !== -1) {
        return "攻撃力";
    }
    if(text.indexOf("生命") !== -1) {
        return "生命力";
    }
    if(text.indexOf("防御") !== -1) {
        return "防御力";
    }
    if(text.indexOf("スピ") !== -1) {
        return "スピード";
    }
    if(text.indexOf("クリ") !== -1 && text.indexOf("発") !== -1) {
        return "クリティカル発生率";
    }
    if(text.indexOf("クリ") !== -1 && text.indexOf("ダメ") !== -1) {
        return "クリティカルダメージ";
    }
    if(text.indexOf("命中") !== -1) {
        return "効果命中";
    }
    if(text.indexOf("命中") !== -1) {
        return "効果抵抗";
    }

    return null;
};

module.exports = async (parameter) => {
    const builder = parameter.instance();
    const tesseract = parameter.lib.tesseract;

    const worker = tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage("jpn");
    await worker.initialize("jpn");
    await worker.setParameters({
        tessedit_char_whitelist: '攻撃防御生命スピード効果命中抵抗クリティカルダメージ発生率0123456789%/',
    });

    builder.addApi('score', async (result, statusData) => {
        const scoreData = {score : 0, resultData : []};

        statusData = statusData !== undefined && statusData !== null ? statusData : {
            "攻撃力" : "",
            "生命力" : "",
            "防御力" : ""
        };

        Object.keys(result).forEach(key => {
            const value = result[key];

            if(key === "スピード") {
                const score = Math.floor(parseInt(value) * 2);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(key === "クリティカル発生率") {
                const score = Math.floor(parseInt(value.replace("%", "")) * 1.5);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(key === "クリティカルダメージ") {
                const score = Math.floor(parseInt(value.replace("%", "")) * 1.33);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(key === "効果命中" || key === "効果抵抗") {
                const score = Math.floor(parseInt(value.replace("%", "")));

                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(value.indexOf("%") !== -1) {
                const score = Math.floor(parseInt(value.replace("%", "")));

                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else {
                const fixValue = parseInt(value);
                const statusValue = parseInt(statusData[key]);
                const score = Math.floor((fixValue / statusValue) * 100);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            }

        });

        return scoreData;
    });

    builder.addApi('recognize', async (data) => {

        const prepareData = {};
        
        const resizeList = [600,700,800,900,1000,1100,1200];
        for (let i = 0; i < resizeList.length; i++) {
            const size = resizeList[i];

            const imageData = await parameter.lib.sharp(data).resize(null,size).toBuffer()
            const buffer = Buffer.from(imageData.toString('base64'), "base64");
            const result = await worker.recognize(buffer);

            const parsed = parseData(result.data.text);
            if(parsed === null) {
                continue;
            }

            parsed.forEach(e => {
                const k = e.key;
                const v = e.value;
                if(v === '') {
                    return;
                }

                if(prepareData[k] == undefined) {
                    prepareData[k] = [];
                }
                prepareData[k].push(v);
            });
        }

        const resultData = {};

        Object.keys(prepareData).forEach(k => {
            const arr = prepareData[k];
            resultData[k] = arr.mode();
        });
        return resultData;
    });

    return builder;
};