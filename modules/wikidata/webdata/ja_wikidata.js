const loadHeroData = async (key, url , force, context) => {
    const jsonDir = context.publicDir + '/json/hero';
    const dataFilePath = jsonDir + '/' + key + '.json';

    if(force === false && await fileExist(context.fs, dataFilePath) == true) {
        const text = await context.fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(text);
    }

    const response = await context.request(url);
    const $ = context.cheerio.load(response);

    const image = $(".archive-style-wrapper .a-paragraph img").attr('data-src');

    const common = {};
    const commonElementTable = findElement($, $('h3.a-header--3'), key+'の基本情報');
    common["名前"] = key;
    common["レアリティ"] = $(commonElementTable.find("tr").get(3)).find("td div a").text();
    common["属性"] = $(commonElementTable.find("tr").get(4)).find("td div a").text();
    common["職業"] = $(commonElementTable.find("tr").get(5)).find("td div a").text();

    const status = {};
    const statusElementTable = findElement($, $('h3.a-header--3'), '最大ステータス【入手時 / 覚醒後】');
    statusElementTable.find("tr").each((idx, elm) => {
        const key = $($(elm).find('th').get(0)).text().trim();
        if(key === '-') {
            return;
        }

        const init_val = $($(elm).find('td').get(0)).text().trim();
        const max_val = $($(elm).find('td').get(1)).text().trim();
        status[key] = {'初期値':init_val, '最大値':max_val};
    });

    const formation = {
        '刻印展開' : [],
        '刻印集中' : [],
    };

    const formationElementTable = findElement($, $('h3.a-header--3'), '陣形効果');
    formationElementTable.find("tr").each((idx, elm) => {

        const f1 = $($(elm).find('td').get(0)).text().trim();
        const f2 = $($(elm).find('td').get(1)).text().trim();
        if(f1 === '' || f2 === '') {
            return;
        }

        const f1_entry = f1.split("+");
        const f1_data = {};
        f1_data[f1_entry[0]] = f1_entry[1];
        formation["刻印展開"].push(f1_data);

        const f2_entry = f2.split("+");
        const f2_data = {};
        f2_data[f2_entry[0]] = f2_entry[1];
        formation["刻印集中"].push(f2_data);
    });

    const skil1ElementTable = findElement($, $('h3.a-header--3'), 'スキル');
    const skil2ElementTable = skil1ElementTable.next();
    const skil3ElementTable = skil2ElementTable.next();

    const skills = [];

    [skil1ElementTable, skil2ElementTable, skil3ElementTable].forEach(element => {
        const skillName = $($(element).find("tr").get(0)).find("th").text().trim();
        const skillDesc = $($(element).find("tr").get(0)).find("td").text().trim().replace("【スキル効果】", "");

        const strengthen = $($(element).find("tr").get(1)).find("td").contents();
        const strengthenData = [];
        for (let i = 0; i < strengthen.length; i++) {
            const element = strengthen[i];
            if(element.type !== "text") {
                continue;
            }

            const text = element.data.trim();
            if(text === "") {
                continue;
            }
            strengthenData.push(text.split("：")[1].trim());
        }

        const materialsData = [];

        const materials = $($(element).find("tr").get(2)).find("td div");
        for (let i = 0; i < materials.length; i++) {
            const element = $(materials[i]);
            const text = element.text().split("：")[1].trim();
            const entries = text.split("/");
            
            const listData = {};

            entries.map(e => e.split("×")).forEach(pair => {
                const m_name = pair[0].trim();
                const m_count = pair[1].trim();
                listData[m_name] = m_count;
            });

            materialsData.push(listData);
        }

        skills.push({
            "スキル名":skillName,
            "説明":skillDesc.split("\n").map(t => t.trim()).filter(t => t != ''),
            "強化効果":strengthenData,
            '強化素材':materialsData
        });
    });

    const result = {
        "画像" : image,
        "共通" : common,
        "ステータス" : status,
        "陣形効果" : formation,
        'スキル': skills
    };

    const json = JSON.stringify(result, null , "\t");
    
    await context.fs.mkdir(jsonDir, { recursive: true });
    await context.fs.writeFile(dataFilePath, json, 'utf8');

    return result;
};

const fileExist = async (fs, path) => {
    try {
        await fs.lstat(path);
        return true;
    } catch(e) {
        return false;
    }
};

const findElement = ($, selector, search) => {
    let result = null;
    $(selector).each((idx, elem) => {
        const text = $(elem).text().trim();

        if(text === search) {
            result = $(elem).next();
            return false;
        }
    });
    return result != null ? result : null;
};