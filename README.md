# Bookroll auto crawler

## 概要

Bookrollシステムであなたがとっている全ての講座の講義資料を持って来ます。

京都大学は一部の授業でEbookの形態で学校のコンテンツが提供されていますが、ユーザービリティがあまり良くないと思ったため、自分のファイルとして管理できるようにしました。

## 使用

### 1. 必要な環境

すでに、環境上、インストールされてないといけないものです。

- Nodejs
- Npm or Yarn

### 2. 方法

1. `yarn (もしくは npm install)`を実行
2. `index.js`でのあなたのbookrollアカウントを入力してください。
3. `node index.js`を実行
4. ブラウザーが出てくるのですが、これはSessionを維持するためですので安心してください。
5. ブラウザーを閉じてもいいよというメッセージが出てくると、ブラウザーを閉じてください。

## 使用技術

- Nightmare.js(Electornが入ってます)
- request-promise / request
- htmlparser2

## 課題

- `semester`変数で、学期設定を指定しないといけない。