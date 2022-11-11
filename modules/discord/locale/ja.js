
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
};

const clazzDef = {
    "soul-weaver" : "プリースト",
    "thief" : "アサシン",
    "warrior" : "ウォリアー",
    "mage" : "メイジ",
    "knight" : "ナイト",
    "ranger" : "アーチャー"
};

const typeDef = {
    "fire" : "火",
    "earth" : "木",
    "ice" : "氷",
    "dark" : "闇",
    "light" : "光"
};


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
    st_label_passive : () => 'パッシブ',
    st_label_soulburn : () => '魂力解放',
    st_label_enhance : () => '強化',
    st_label_multipliers: () => '倍率',
    st_label_rarity: (key) => '★'+key,
    st_label_clazz: (key) => clazzDef[key] === undefined ? key : clazzDef[key],
    st_label_type: (key) => typeDef[key] === undefined ? key : typeDef[key],
    st_label_soul: (key) => key.replace("soul", "魂力").replace("focus", "集中").replace("consume", "闘志"),
    st_label_enhance_type : (key) => key.replace("damage received", "被ダメージ").replace("damage dealt", "ダメージ")
        .replace("Health recovered when revived", "復活時の生命力")
        .replace("effect chance", "効果発生率")
        .replace("max Health", "最大生命力")
        .replace("turn cooldown", "スキルターン")
        .replace("Combat Readiness", "アクションゲージ")
        .replace("Attack increase", "攻撃力アップ")
        .replace("all stats", "各ステータス")
        .replace("stat increase", "追加ステータス")
        .replace("counterattack chance", "反撃発生率")
        .replace("trigger chance", "発動率")
        .replace("activation chance", "発生率")
        .replace("by additional skill", "(追加スキル)")
        .replace("barrier strength", "シールド効果")
        .replace("Critical Hit Resistance", "クリティカル低効率")
        .replace("healing", "回復量")
        .replace("Attack", "攻撃力")
        .replace("Consume", "消費量")
        .replace("Acquire", "獲得量")
        .replace("acquired", "獲得アップ")
        .replace("decrease", "ダウン効果")
        .replace("Soul", "魂力")
        .replace("Additional", "追加")
        .replace("Fighting Spirit", "闘志"),

    info_label_1 : () => "内容",
};