
const request = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');

module.exports = () => {

    const urlmap = {};

    HERO_LIST.split("\n").map(e => e.trim())
        .filter(e => e != '')
        .forEach(e => {
            const entries = e.split(",");

            urlmap[entries[0].trim()] = entries[1].trim();
        });

    return async (alias, data) => {
        const localizeName = alias.localize["ja"];

        const dataUrl = urlmap[localizeName];
        if(dataUrl === "none") {
            return data;
        }

        if(dataUrl === undefined) {
            throw "notfound url : " + localizeName + ':' + dataUrl;
        }
        
        await requestHeroData(dataUrl, data, localizeName);
        return data;
    };
};

const requestHeroData = async (url , data, localizeName) => {

    const response = await request(url);
    const $ = cheerio.load(response);

    data.common.name_ja = localizeName;

    const skil1ElementTable = findElement($, $('h3.a-header--3'), 'スキル');
    const skil2ElementTable = skil1ElementTable.next();
    const skil3ElementTable = skil2ElementTable.next();

    const skills = [];
    [skil1ElementTable, skil2ElementTable, skil3ElementTable].forEach(element => {
        const skillName = $($(element).find("tr").get(0)).find("th").text().trim();
        const skillDesc = $($(element).find("tr").get(0)).find("td").text().trim().replace("【スキル効果】", "");
        const soulBurn = $($(element).find("tr").last()).find("td").text().trim();

        const burnText = soulBurn.indexOf("魂力解放効果") != -1 ? soulBurn.replace("魂力解放効果", "").replace("】", "").replace("【", "") : "";

        skills.push({
            "title":prepareskillTitle(skillName),
            "description":prepareskillDesc(skillDesc.split("\n").map(t => t.trim()).filter(t => t != '').join("\r\n")),
            "burn" : burnText
        });
    });

    data.skills[0].title_ja = skills[0].title;
    data.skills[0].description.text_ja = skills[0].description;
    data.skills[0].description.burn_ja = skills[0].burn;

    data.skills[1].title_ja = skills[1].title;
    data.skills[1].description.text_ja = skills[1].description;
    data.skills[1].description.burn_ja = skills[1].burn;

    data.skills[2].title_ja = skills[2].title;
    data.skills[2].description.text_ja = skills[2].description;
    data.skills[2].description.burn_ja = skills[2].burn;
};

const prepareskillTitle = (text) => {
    const idx = text.indexOf("(スキルターン");
    if(idx !== -1) {
        text = text.substring(0, idx);
    }
    return text.trim();
};

const prepareskillDesc = (text) => {
    const idx = text.indexOf("(魂力");
    if(idx !== -1) {
        text = text.substring(0, idx);
    }
    return text.trim();
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

const HERO_LIST = `
森の賢者ヴィヴィアン,https://game8.jp/epic-seven/465747
ユーリ,https://game8.jp/epic-seven/421347
支配者リリアス,https://game8.jp/epic-seven/417598
イートン,https://game8.jp/epic-seven/336323
獅子王チェルミア,https://game8.jp/epic-seven/422799
焼尽のディンゴ,https://game8.jp/epic-seven/322021
光の天使アンジェリカ,https://game8.jp/epic-seven/399647
白銀のアラミンタ,https://game8.jp/epic-seven/322020
雪国のソリタリア,https://game8.jp/epic-seven/383972
ソニア,https://game8.jp/epic-seven/368601
カミラ,https://game8.jp/epic-seven/398350
旅逸のディエリア,https://game8.jp/epic-seven/338890
実験体セズ,https://game8.jp/epic-seven/314756
メイド・クロエ,https://game8.jp/epic-seven/311736
野心家タイウィン,https://game8.jp/epic-seven/339707
慈愛のローマン,https://game8.jp/epic-seven/339674
不信者リディカ,https://game8.jp/epic-seven/339673
リコリス ,https://game8.jp/epic-seven/304468
砂漠の宝石バサール,https://game8.jp/epic-seven/336898
魔法学者ドリス,https://game8.jp/epic-seven/359051
ミルサ,https://game8.jp/epic-seven/304465
ドリス,https://game8.jp/epic-seven/304457
キキラトV.2,https://game8.jp/epic-seven/339708
ラストライダークラウ,https://game8.jp/epic-seven/349797
セレスト,https://game8.jp/epic-seven/304447
グルーミー・レイン,https://game8.jp/epic-seven/304445
ギュンター,https://game8.jp/epic-seven/304443
若き女王シャルロッテ,https://game8.jp/epic-seven/339709
エルソン,https://game8.jp/epic-seven/304439
風雲のスーリン,https://game8.jp/epic-seven/339713
アロウェル,https://game8.jp/epic-seven/304435
ヴェリアン,https://game8.jp/epic-seven/402795
流浪者シルク,https://game8.jp/epic-seven/304429
勇将ファジス,https://game8.jp/epic-seven/304427
戦闘人形マヤ,https://game8.jp/epic-seven/304424
紅焔のアーミン,https://game8.jp/epic-seven/304422
求道者アイテール,https://game8.jp/epic-seven/304420
監視者シュリ,https://game8.jp/epic-seven/304419
先遣部隊長リコリス,https://game8.jp/epic-seven/329766
霊眼のセリン,https://game8.jp/epic-seven/409630
神光のルエル,https://game8.jp/epic-seven/304386
審判者キセ,https://game8.jp/epic-seven/304385
賢者バアル＆セザン,https://game8.jp/epic-seven/327191
リリベット,https://game8.jp/epic-seven/339724
パヴェル,https://game8.jp/epic-seven/339725
ヴェローナ,https://game8.jp/epic-seven/305554
オリーナ,https://game8.jp/epic-seven/421345
ランディ,https://game8.jp/epic-seven/351355
人形作家パール・ホライゾン,https://game8.jp/epic-seven/357178
エインズ,https://game8.jp/epic-seven/336320
グレン,https://game8.jp/epic-seven/368604
レイ,https://game8.jp/epic-seven/339726
クリスティ,https://game8.jp/epic-seven/398352
自警団長グレン,https://game8.jp/epic-seven/441964
新緑のアーディン,https://game8.jp/epic-seven/441965
ラム,https://game8.jp/epic-seven/398355
ロエンナ,https://game8.jp/epic-seven/339727
エルバレン,https://game8.jp/epic-seven/354714
ヴィヴィアン,https://game8.jp/epic-seven/339728
義賊のルージッド,https://game8.jp/epic-seven/322022
鷹狩のクルリ,https://game8.jp/epic-seven/312915
ルージット,https://game8.jp/epic-seven/304472
ムカチャ,https://game8.jp/epic-seven/304466
ヘルガ,https://game8.jp/epic-seven/304463
パール・ホライゾン,https://game8.jp/epic-seven/304459
ジェクト,https://game8.jp/epic-seven/304449
クルリ,https://game8.jp/epic-seven/304446
キリス,https://game8.jp/epic-seven/304444
アーディン,https://game8.jp/epic-seven/411702
ザハーク,https://game8.jp/epic-seven/415804
アドレー,https://game8.jp/epic-seven/304433
レオ,https://game8.jp/epic-seven/304413
リン,https://game8.jp/epic-seven/304412
ラッツ,https://game8.jp/epic-seven/304411
モルト,https://game8.jp/epic-seven/364531
ファジス,https://game8.jp/epic-seven/304408
ミュイ,https://game8.jp/epic-seven/343617
シルク,https://game8.jp/epic-seven/304402
セリン,https://game8.jp/epic-seven/339505
シダー,https://game8.jp/epic-seven/304400
カルトゥハ,https://game8.jp/epic-seven/304394
リムル,https://game8.jp/epic-seven/409634
指揮型ライカ,https://game8.jp/epic-seven/420175
シェナ,https://game8.jp/epic-seven/385602
アーミン,https://game8.jp/epic-seven/304390
ルートヴィヒ,https://game8.jp/epic-seven/304382
ユピネ ,https://game8.jp/epic-seven/304380
バサール ,https://game8.jp/epic-seven/304377
デスティーナ,https://game8.jp/epic-seven/304373
チャールズ,https://game8.jp/epic-seven/304372
ヴィルドレッド,https://game8.jp/epic-seven/304362
ヴィオレタ,https://game8.jp/epic-seven/304361
イセリア,https://game8.jp/epic-seven/304360
ルシ,https://game8.jp/epic-seven/371614
梅喧,https://game8.jp/epic-seven/333943
アレンシア,https://game8.jp/epic-seven/339722
自由な傭兵ヘルガ,https://game8.jp/epic-seven/339723
メルヘンテネブレア,https://game8.jp/epic-seven/365412
ラン,https://game8.jp/epic-seven/407769
ムーム,https://game8.jp/epic-seven/421341
アリア,https://game8.jp/epic-seven/446437
ペイラ,https://game8.jp/epic-seven/422798
レナ,https://game8.jp/epic-seven/336321
ルルカ,https://game8.jp/epic-seven/336319
プラン,https://game8.jp/epic-seven/360358
ディエネ,https://game8.jp/epic-seven/308499
イアン,https://game8.jp/epic-seven/368606
ヘレン,https://game8.jp/epic-seven/398353
ディズィー,https://game8.jp/epic-seven/334475
エミリア,https://game8.jp/epic-seven/398356
レム,https://game8.jp/epic-seven/398357
ミューズリマ,https://game8.jp/epic-seven/377613
バスク,https://game8.jp/epic-seven/309104
リマ,https://game8.jp/epic-seven/304471
モンモランシー,https://game8.jp/epic-seven/304467
ルナ,https://game8.jp/epic-seven/323066
ミスティー・チェイン,https://game8.jp/epic-seven/304464
タラノル近衛隊員,https://game8.jp/epic-seven/304455
タラノル王宮衛兵,https://game8.jp/epic-seven/304454
ジェナ,https://game8.jp/epic-seven/304450
エノット,https://game8.jp/epic-seven/304438
アレクサ,https://game8.jp/epic-seven/304434
アイテール,https://game8.jp/epic-seven/304431
セリス,https://game8.jp/epic-seven/339717
エダ,https://game8.jp/epic-seven/374639
ロゼ,https://game8.jp/epic-seven/304416
ローマン,https://game8.jp/epic-seven/304414
エレナ,https://game8.jp/epic-seven/339718
ドミニエル,https://game8.jp/epic-seven/304407
ゼラト,https://game8.jp/epic-seven/304404
コリー ,https://game8.jp/epic-seven/304398
クロゼ,https://game8.jp/epic-seven/304397
クラリッサ,https://game8.jp/epic-seven/304395
カリン,https://game8.jp/epic-seven/304393
アンジェリカ,https://game8.jp/epic-seven/304392
フューリオス,https://game8.jp/epic-seven/339719
ユナ,https://game8.jp/epic-seven/304379
海辺のヴェローナ(SSB),https://game8.jp/epic-seven/339720
守護天使モンモランシー,https://game8.jp/epic-seven/323939
タイウィン,https://game8.jp/epic-seven/304371
セズ,https://game8.jp/epic-seven/304370
セクレット,https://game8.jp/epic-seven/304369
シュー,https://game8.jp/epic-seven/347302
クロエ,https://game8.jp/epic-seven/304367
クラウ,https://game8.jp/epic-seven/304365
キセ,https://game8.jp/epic-seven/304364
ゼノ,https://game8.jp/epic-seven/339721
バカンスのユピネ,https://game8.jp/epic-seven/345073
ジャスタ,https://game8.jp/epic-seven/421340
カワナ,https://game8.jp/epic-seven/336327
ハタン,https://game8.jp/epic-seven/336322
南国のイセリア,https://game8.jp/epic-seven/399646
ゴッドマザー,https://game8.jp/epic-seven/368602
カワズ,https://game8.jp/epic-seven/338889
キズナアイ,https://game8.jp/epic-seven/338891
メラニー,https://game8.jp/epic-seven/398354
カーウェリック,https://game8.jp/epic-seven/339729
伝道師カーマイン・ローズ,https://game8.jp/epic-seven/368491
ポリティス,https://game8.jp/epic-seven/368493
リディカ,https://game8.jp/epic-seven/319495
チェルミア,https://game8.jp/epic-seven/315618
生徒会広報ヘイゼル,https://game8.jp/epic-seven/314758
ラス,https://game8.jp/epic-seven/304469
ヘイゼル,https://game8.jp/epic-seven/304462
ネムナス,https://game8.jp/epic-seven/304458
ディエリア,https://game8.jp/epic-seven/304456
ジュディス,https://game8.jp/epic-seven/304451
キャロット,https://game8.jp/epic-seven/304442
爆撃型カノン,https://game8.jp/epic-seven/380171
カーマイン・ローズ,https://game8.jp/epic-seven/304441
エクスキューショナー,https://game8.jp/epic-seven/304437
アゼリア,https://game8.jp/epic-seven/304432
イリーナブ,https://game8.jp/epic-seven/388641
メルセデス,https://game8.jp/epic-seven/304410
マヤ,https://game8.jp/epic-seven/304409
ディンゴ,https://game8.jp/epic-seven/304406
セリラ,https://game8.jp/epic-seven/304405
スーリン,https://game8.jp/epic-seven/304403
シュリ ,https://game8.jp/epic-seven/304401
コルヴス ,https://game8.jp/epic-seven/304399
リリアス,https://game8.jp/epic-seven/339730
シュナ,https://game8.jp/epic-seven/409631
ミリム,https://game8.jp/epic-seven/409633
メリッサ,https://game8.jp/epic-seven/339731
ジャック・オー,https://game8.jp/epic-seven/444316
アカテス,https://game8.jp/epic-seven/304391
冒険者ラス,https://game8.jp/epic-seven/339732
カオス教団執行追跡者,https://game8.jp/epic-seven/327193
ラヴィ,https://game8.jp/epic-seven/304381
エルフェルト,https://game8.jp/epic-seven/334944
ヘイスト,https://game8.jp/epic-seven/304378
バアル＆セザン,https://game8.jp/epic-seven/304375
テネブレア,https://game8.jp/epic-seven/304374
ケン,https://game8.jp/epic-seven/304368
シャルロッテ,https://game8.jp/epic-seven/304366
カイロン,https://game8.jp/epic-seven/304363
アラミンタ,https://game8.jp/epic-seven/304359
セシリア,https://game8.jp/epic-seven/304274
研究者キャロット,https://game8.jp/epic-seven/331578
ソル,https://game8.jp/epic-seven/333944
ルリ,https://game8.jp/epic-seven/328310
狂炎のカワズ,https://game8.jp/epic-seven/388691
残影のヴィオレタ,https://game8.jp/epic-seven/345071
灰森のイセリア,https://game8.jp/epic-seven/345072
不敵のゼラト,https://game8.jp/epic-seven/345070
ソリア,https://game8.jp/epic-seven/421346
バータス,https://game8.jp/epic-seven/336325
海賊船長プラン,https://game8.jp/epic-seven/441957
アイノス,https://game8.jp/epic-seven/368607
赤月の貴族ヘイスト,https://game8.jp/epic-seven/339705
ペネロペ,https://game8.jp/epic-seven/398345
最強モデルルルカ,https://game8.jp/epic-seven/354715
オペレーターセクレット,https://game8.jp/epic-seven/362240
飼い猫クラリッサ,https://game8.jp/epic-seven/314757
暗殺者シダー,https://game8.jp/epic-seven/311738
指揮官ロリーナ,https://game8.jp/epic-seven/308090
ワンダ,https://game8.jp/epic-seven/304475
ロリーナ,https://game8.jp/epic-seven/304474
レクイエム・ロア,https://game8.jp/epic-seven/304473
無法者クロゼ,https://game8.jp/epic-seven/336899
ヒュラド,https://game8.jp/epic-seven/304461
ピィリス,https://game8.jp/epic-seven/304460
スヴェン,https://game8.jp/epic-seven/304453
黒騎士ピィリス,https://game8.jp/epic-seven/411701
オティーリエ,https://game8.jp/epic-seven/304440
カオス教団重斧総長,https://game8.jp/epic-seven/318331
イリオス教団斧兵,https://game8.jp/epic-seven/304436
戮力のラッツ,https://game8.jp/epic-seven/304430
ストラゼス,https://game8.jp/epic-seven/393782
流れ星☆アカテス,https://game8.jp/epic-seven/304428
天穹のメルセデス,https://game8.jp/epic-seven/304426
挑戦者ドミニエル,https://game8.jp/epic-seven/304425
静寂のコリー,https://game8.jp/epic-seven/304423
血剣のカリン,https://game8.jp/epic-seven/304421
暗躍のロゼ,https://game8.jp/epic-seven/304418
大族長カワナ,https://game8.jp/epic-seven/374641
暗幕殺法カルトゥハ,https://game8.jp/epic-seven/304417
終結者チャールズ,https://game8.jp/epic-seven/398343
調整者カーウェリック,https://game8.jp/epic-seven/386287
幻影のテネブレア,https://game8.jp/epic-seven/304389
破壊者コルヴス,https://game8.jp/epic-seven/304388
覇者ケン,https://game8.jp/epic-seven/304387
三日月の舞姫リン,https://game8.jp/epic-seven/327192
執行人ヴィルドレッド,https://game8.jp/epic-seven/304384
放浪勇者レオ,https://game8.jp/epic-seven/334945
奈落のセシリア,https://game8.jp/epic-seven/334947
罪悪のアンジェリカ,https://game8.jp/epic-seven/331476
黙示録のラヴィ,https://game8.jp/epic-seven/331475
魔神の影,https://game8.jp/epic-seven/366922
デザイナーリリベット,https://game8.jp/epic-seven/371625
万能解決士ワンダ,https://game8.jp/epic-seven/333936
ルア,https://game8.jp/epic-seven/484321
フィナス,https://game8.jp/epic-seven/440604
シャルン,https://game8.jp/epic-seven/467789
月うさぎドミニエル,https://game8.jp/epic-seven/469397
ロイ・マスタング,https://game8.jp/epic-seven/472394
リザ・ホークアイ,https://game8.jp/epic-seven/472389
司令官パヴェル,https://game8.jp/epic-seven/472396
夏休みのシャルロッテ,https://game8.jp/epic-seven/468476
ユルハ,https://game8.jp/epic-seven/461776
エドワード・エルリック,https://game8.jp/epic-seven/472395
ティル,https://game8.jp/epic-seven/453044
バッドキャットアーミン,https://game8.jp/epic-seven/439293
ルア,https://game8.jp/epic-seven/484321
神託のエレナ,https://game8.jp/epic-seven/484322
自由騎士アロウェル,none
アルンカ,https://game8.jp/epic-seven/490810
夏の弟子アレクサ,https://game8.jp/epic-seven/466088
救済者アーディン,none
清冽のアーディン,none
ジオ,https://game8.jp/epic-seven/493212
ae−WINTER,https://game8.jp/epic-seven/499442
ae−NINGNING,https://game8.jp/epic-seven/499443
`