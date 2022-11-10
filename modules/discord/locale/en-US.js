
const scoreDef = {
    "スコア" : "Score",
    "攻撃力" : "Attack",
    "生命力" : "Health",
    "防御力" : "Defence",
    "攻撃力_実数" : "Attack_fix",
    "生命力_実数" : "Health_fix",
    "防御力_実数" : "Defence_fix",
    "スピード" : "Speed",
    "クリ発生率" : "Critical Chance",
    "クリダメ" : "Critical Damage",
    "効果命中" : "Effectiveness",
    "効果抵抗" :  "Effect Resistance"
}

module.exports = {
    upload_tweetText : () => "#ep7build #Epicseven",
    
    score_label : (key) =>  scoreDef[key] === undefined ? key : scoreDef[key],

    build_nodfound : (name) => "Nofound data : " + name,
    build_notpage : (pageNo,heroName) => 'Notfoud data :' + heroName + ', '+pageNo+'page',
    build_page_label : (pageNo, pageMax) => pageNo + '/' + pageMax+' page',
    build_count_label : (idx) => 'Count :' +idx + ' ,',

    st_attack : () => "Attack",
    st_health : () => "Health",
    st_defence : () => "Defence",
    st_speed : () => "Speed",
    st_crt_chance : () => "Critical Chance",
    st_crt_damage : () => "Critical Damage",
    st_teameffort : () => "Dual Attack Chance",
    st_effect_hit : () => "Effectiveness",
    st_effect_resist : () => "Effect Resistance",

    info_label_1 : () => "Content",
};