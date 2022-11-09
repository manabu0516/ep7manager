
const scoreDef = {
    "スコア" : "スコア",
    "攻撃力" : "攻撃力",
    "生命力" : "生命力",
    "防御力" : "防御力",
    "攻撃力_実数" : "攻撃力_実数",
    "生命力_実数" : "生命力_実数",
    "防御力_実数" : "防御力_実数",
    "スピード" : "スピード",
    "クリ発生率" : "クリ発生率",
    "クリダメ" : "クリダメ",
    "効果命中" : "効果命中",
    "効果抵抗" :  "効果抵抗"
}

module.exports = {
    upload_tweetText : () => "#ep7build #エピックセブン",
    
    score_label : (key) =>  scoreDef[key] === undefined ? key : scoreDef[key],

    build_nodfound : (name) => name + "のデータは存在しません",
    build_notpage : (pageNo,heroName) => pageNo + 'ページ目の' + heroName + 'のデータは存在しません',
    build_page_label : (pageNo, pageMax) => pageNo + '/' + pageMax+'ページ',
    build_count_label : (idx) => idx + '件目',

    st_attack : () => "攻撃力",
    st_health : () => "生命力",
    st_defence : () => "防御力",
    st_speed : () => "速度",
    st_crt_chance : () => "クリティカル発生率",
    st_crt_damage : () => "クリティカルダメージ",
    st_teameffort : () => "連携攻撃率",
    st_effect_hit : () => "効果命中率",
    st_effect_resist : () => "効果抵抗率",

    info_label_1 : () => "内容",
};