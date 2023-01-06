## ■ はじめに

Smilegateが開発と運営を行っているゲームのエピックセブンに関する非公式Discord Botの管理リポジトリになります。

Discord BOTを導入するとエピックセブンに関する以下のデータをDiscord上で表示することができます。

- 英雄のステータス
- 英雄のビルド画像(主にTwitterより収集)
- 英雄のビルド画像のtwitterへの投稿(投稿元アカウントは @fmnb0516_ep7bot になります)
- アップした装備画像のスコア表示
- BOTの更新履歴の表示
- 英雄のステータスデータの管理

## ■ インストールURL

https://discord.com/api/oauth2/authorize?client_id=1035058107899981854&permissions=2048&scope=applications.commands%20bot

## ■ 基本的な使い方

インストールするとスラッシュコマンドとしてDiscordサーバに登録されます。

```
/ep7-score
/ep7-build
/ep7-st
/ep7-upload
/ep7-info
/ep7-data
```

詳細な利用方法は実際にコマンドは以下URLより確認してください。
https://manabu0516.github.io/ep7manager/bot.html


## 実行環境

Discord BOTはNode.jsにて実装されています。

実行時に必要なモジュール・バージョンは以下の通りです。

- Node.js v16.17.1 以上
- NPM 8.15.0 以上
- tesseract 5.2.0 (日本語モジュール必須)

直下のディレクトリにTwitterとDiscord BOTの認証用情報を定義した[configure.js]を作成する必要があります

```
module.exports = {
    discordToken : "[Discord BOTのトークン]",
    twitterToken : {
        consumer_key: "[Twitterのコンシューマキー]",
        consumer_secret: "[Twitterのコンシューマシークレット]",
        access_token_key: "[Twitterのアクセストークン]",
        access_token_secret: "[Twitterのシークレットトークン]"
    }
};
```

依存ライブラリをnpmコマンドでインストールする必要があります。

```
npm install
```

上記完了後以下のコマンドでDiscord BOTが稼働状態になります。

```
node index.js
```

## 関連モジュールのインストール手順

ubuntu 22.04を前提とした実行に必要な関連モジュールのインストール手順を記載します。

Node.js
```
$ curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

$ sudo apt-get update

$ sudo apt-get install -y nodejs

$ node --version 
v16.17.1
$ npm --version 
8.15.0
```

tesseract
```
$ sudo add-apt-repository ppa:alex-p/tesseract-ocr5

$ sudo apt-get update

$ sudo apt install -y tesseract-ocr

$ tesseract --version 
tesseract 5.2.0 

$ sudo apt -y install tesseract-ocr tesseract-ocr-jpn libtesseract-dev libleptonica-dev tesseract-ocr-script-jpan tesseract-ocr-script-jpan-vert 

$ tesseract --list-langs
List of available languages in "/usr/share/tesseract-ocr/5/tessdata/" (5):
Japanese
Japanese_vert
eng
jpn
osd
```

memcached
```
$ sudo apt -y install memcached

$ memcached --version
memcached 1.5.22

## ■ WEBページ

Discord BOTからアクセスするデータは以下のサイト(GH Pages)で公開しています。

https://manabu0516.github.io/ep7manager/index.html

Discord BOTで管理している英雄の情報は以下のサイトのデータをもとに作成されています。

https://game8.jp/epic-seven

## ■ 最後に

このBOTの管理・運営はすべて https://twitter.com/fmnb0516_ep7bot が行っています。

なので、ご協力頂ける方をお待ちしております。

また日本語しか分からないので今のところ多言語化は無理です。