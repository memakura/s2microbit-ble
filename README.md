# s2microbit-ble
BBC micro:bit を Scratch 2 オフライン版から Bluetooth 接続で使うための拡張ブロック  
(English follows)

<img alt="s2microbit-ble" src="https://github.com/memakura/s2microbit-ble/blob/master/images/s2microbit-ble.png" width=256>

<img alt="blocks" src="https://github.com/memakura/s2microbit-ble/blob/master/images/blocks.png" width=800>

（図はバージョン1です。バージョン2では大幅にブロックが追加されています。）

## 準備
1. Bluetooth 4.0 以上に対応した PC（なければ USBのBluetoothアダプタなどが使えます。）
1. Windows 10 build 10.0.15063 以上（OSビルド 15063以上）
    - Windows の画面左下の「ここに入力して検索」に winver といれると確認できます。
    - バージョンが古い場合は Windows をアップデートしておきます。
1. Microsoft Visual C++ 2015 再頒布可能パッケージをインストールしておきます。
    - [ここから](https://www.microsoft.com/ja-jp/download/details.aspx?id=52685)ダウンロードできます。
    - 多くの場合 Windows 10 (64bit) なので、その場合は vc_redist.x64.exe を選びます。
    - すでに入っている場合は不要です。よくわからない場合は先に進んで、もしエラーが起きたらこれを入れてください。
1. Windows のファイル拡張子を表示するようにしておくと便利です。
    - ファイルエクスプローラーで「表示」>「ファイル名拡張子」にチェックしておきます。

## インストール方法
1. [Release](https://github.com/memakura/s2microbit-ble/releases) の最新バージョンをダウンロード、インストールします。
    - s2microbit-ble_installer-v(バージョン番号).exe という名前です。
    - 「Windows によって PC が保護されました」と出た場合は「詳細情報」をクリックしてから「実行」を選びます。
1. インストールした s2microbit-ble を立ち上げておきます。
    - 「The specified module could not be found」というエラーが出る場合は、準備のところで説明した再頒布可能パッケージが入っていない可能性があります。
1. [00scratch](https://github.com/memakura/s2microbit-ble/tree/master/00scratch) からScratch2のサンプルプロジェクトをダウンロードして開きます（例えば [fly.sb2](https://github.com/memakura/s2microbit-ble/raw/master/00scratch/fly.sb2)など）。
1. [このページ](https://github.com/jaafreitas/scratch-microbit-extension/tree/master/firmware)にある[HEXファイル](https://github.com/jaafreitas/scratch-microbit-extension/raw/master/firmware/makecode-microbit-scratch-extension.hex)をダウンロードしてMicrobitへ転送しておきます。
    - s2microbit-ble が立ち上がっていると自動で接続されます。"Console" というタブ（"Elements" の右）をクリックすると、メッセージや進行状況が表示されます。
    - 「その他」のブロックのところにある赤丸が緑丸になっていれば s2microbit-ble と Scratch 2 が接続できています。

## サンプルプログラム (fly.sb2)
- 飛行機のような感じで動かしてください。
- AやBボタンを押すと何か起こります。（押し続けてもいいです。）

## 新たに Scratch 2 プロジェクトを作る場合
以下の二つのうちどちらかで行います。
- サンプルプログラムを元にプログラム作っていき「名前をつけて保存」で別の名前にします。
- 拡張ブロック用のファイル[s2microbit_JA.s2e](https://github.com/memakura/s2microbit-ble/raw/master/00scratch/s2microbit_JA.s2e)を[00scratch](https://github.com/memakura/s2microbit-ble/tree/master/00scratch)からダウンロードしておきます。新たにプロジェクトを作成し、シフトを押しながら「ファイル」>「実験的なHTTP拡張を読み込み」でダウンロードしたファイルをを選ぶと拡張ブロックが追加されます。

## 注意点
- 最初に見つかった microbit と接続します。
- 近くに複数の電源の入った microbit があるとうまく接続できないかもしれません。
- 途中で止まる可能性もあります。s2microbit-ble を立ち上げる、microbit のリセットボタンを押す、一度電池を外して入れなおす、などを試してください。

## s2m との違い

いろいろありますが、特に以下の点は注意してください。

- LED　の明るさは段階的に指定できない（点灯か消灯かのみ）
- アナログピンの値は 0-1023 ではなく、0-255
- 文字列をスクロールしたあとは、元の画像に戻す（ここの仕様は変わるかもしれません）

## 参考URLやライセンス情報
- このプログラムを作るうえでいくつかのコードを参考にしたり一部利用したりしています。
- 参考にしたURLを下の英語版にリストします。

---

# s2microbit-ble
Scratch 2 (offline) extension for BBC micro:bit bluetooth connection

## Requirements
1. Bluetooth 4.0 or later
1. Windows 10 build 10.0.15063 or later
1. Microsoft Visual C++ 2015 Redistributable

## Installation
1. Download and install the latest version from [Release](https://github.com/memakura/s2microbit-ble/releases).
    - For Windows: s2microbit-ble_installer.exe
1. Download and open a demo project (e.g., [fly.sb2](https://github.com/memakura/s2microbit-ble/raw/master/00scratch/fly.sb2)) from [00scratch](https://github.com/memakura/s2microbit-ble/tree/master/00scratch).
    - For English blocks: Download and open [s2microbit_EN.s2e](https://github.com/memakura/s2microbit-ble/blob/master/00scratch/s2microbit_EN.s2e) from Scratch 2 Offline Editor to overwrite the original language (open "File" menu by pressing `Shift` key).
1. Download [a firmware hex file](https://github.com/jaafreitas/scratch-microbit-extension/raw/master/firmware/makecode-microbit-scratch-extension.hex) from [this page](https://github.com/jaafreitas/scratch-microbit-extension/tree/master/firmware) and write it to your microbit.

## Demo: fly.sb2
- Move your microbit like a plane.
- Press A or B button for some change.

## References
- https://github.com/sandeepmistry/node-bbc-microbit
- https://github.com/jasongin/noble-uwp
- https://github.com/jaafreitas/scratch-microbit-extension
- https://github.com/MrYsLab/s2m

## License
- GPL
