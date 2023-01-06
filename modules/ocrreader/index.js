

const localize = {};

localize["ja_jp"] = (() => {
    const filterData = {
        "クリ発" : t => t.indexOf("%") === -1 ? t.replace("96", "%") : t,
        "クリダメ" : t => t.indexOf("%") === -1 ? t.replace("96", "%") : t,
        "効果命中" : t => t.indexOf("%") === -1 ? t.replace("96", "%") : t,
        "効果抵抗" : t => t.indexOf("%") === -1 ? t.replace("96", "%") : t,
    };

    const checkValue = (text, label) => {
        const filter = filterData[label] ? filterData[label] : t => t;

        const data = filter(text.replace(/[^0-9]/g, ''));
        return data + (text.indexOf("%") !== -1 ? '%' : "");
    };

    const checkData = (text) => {
        if(text.indexOf("連携") !== -1) {
            return "連携";
        }
        if(text.indexOf("攻撃") !== -1) {
            return text.indexOf("%") !== -1 ? "攻撃力" : "攻撃力_実数"; 
        }
        if(text.indexOf("生命") !== -1) {
            return text.indexOf("%") !== -1 ? "生命力" : "生命力_実数"; 
        }
        if(text.indexOf("防御") !== -1) {
            return text.indexOf("%") !== -1 ? "防御力" : "防御力_実数"; 
        }
        if(text.indexOf("スピ") !== -1 || text.indexOf("ピード") !== -1) {
            return "スピード";
        }
        if(text.indexOf("クリ") !== -1 && text.indexOf("発") !== -1) {
            return "クリ発";
        }
        if(text.indexOf("クリ") !== -1 && text.indexOf("ダメ") !== -1) {
            return "クリダメ";
        }
        if(text.indexOf("命中") !== -1) {
            return "効果命中";
        }
        if(text.indexOf("抵抗") !== -1) {
            return "効果抵抗";
        }
    
        return null;
    };

    return {
        parseData : (text, sliceCount) => {
            const result = [];
        
            const data = text.split("\n")
                .map(e => e.trim().replace(/\s+/g, ""))
                .filter(e => e !== "");
        
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                if(d.indexOf("/4") !== -1 || d.indexOf("/2") !== -1) {
                    break;
                }
                const checked = checkData(d);
                if(checked === null) {
                    continue;
                }
        
                result.push({
                    key : checked,
                    value : checkValue(d, checked)
                });
            }
            return result.slice(sliceCount);
        },
        tesseract_conf_lang : "jpn+eng",
        tesseract__whitelist: '力攻撃防御生命スピード効果命中抵抗クリティカルダメージ発生率0987654321%/',
    };
})();

module.exports = async (parameter) => {
    const builder = parameter.instance();
    const tesseract =  parameter.lib.tesseract_ocr;

    builder.addApi('score', async (result, statusData) => {
        const scoreData = {score : 0, resultData : []};

        statusData = statusData !== undefined && statusData !== null ? statusData : {
            "攻撃力" : "1000",
            "生命力" : "5000",
            "防御力" : "600"
        };

        Object.keys(result).forEach(key => {
            const value = result[key];

            if(key === "スピード") {
                const score = Math.floor(parseInt(value) * 2);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(key === "クリ発") {
                const score = Math.floor(parseInt(value.replace("%", "")) * 1.6);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            } else if(key === "クリダメ") {
                const score = Math.floor(parseInt(value.replace("%", "")) * 1.14);
                
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
                const statusValue = parseInt(statusData[key.replace("_実数", "")]);
                const score = Math.floor((fixValue / statusValue) * 100);
                
                scoreData.resultData.push({key:key, value:value, score:score});
                scoreData.score += score;
            }
        });

        return scoreData;
    });

    builder.addApi('prepareDot', async (data) => {
        Object.keys(data).forEach(k => {
            const value = data[k];
            if(value.endsWith("%")) {
                const startData = value.substring(0, value.length-2);
                const endData = value.substring(value.length-2);
                data[k] = startData + '.' + endData;
            }
        });
    });

    builder.addApi('recognize', async (data, optionData, lang) => {
        const resultData = {};
        const prepareData = {};

        const localizer = (lang === undefined || lang === null || localize[lang] === undefined)
            ? localize["ja_jp"] : localize[lang];

        const resizeList = [600,700,800,900,1000,1100,1200];
        for (let i = 0; i < resizeList.length; i++) {
            const size = resizeList[i];

            const imageData = await parameter.lib.sharp(data).resize(size,null).normalise().toBuffer()
            const buffer = Buffer.from(imageData.toString('base64'), "base64");
            const result1 = await tesseract.recognize(buffer, {
                lang: localizer.tesseract_conf_lang,
                tessedit_char_whitelist: localizer.tesseract__whitelist,
            });
            const result2 = await tesseract.recognize(buffer, {
                lang: localizer.tesseract_conf_lang,
            });

            const parsed1 = localizer.parseData(result1, optionData.sliceCount);
            const parsed2 = localizer.parseData(result2, optionData.sliceCount);

            parsed1.concat(parsed2).forEach(e => {
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

        const dataKeys = Object.keys(prepareData).sort((k1, k2) => {
            const a1 = prepareData[k1];
            const a2 = prepareData[k2];
            return a2.length - a1.length;
        });

        if(dataKeys.length < optionData.dataCount) {
            return resultData;
        }

        dataKeys.slice(0,optionData.dataCount).forEach(k => {
            const arr = prepareData[k];
            resultData[k] = arr.mode();
        });
        return resultData;
    });

    return builder;
};