[(English)](#English) [(ホーム)](../)

# デモプロジェクト (.sb2) とブロック拡張 (.s2e)

## Scratch 2 (Offline) プロジェクトファイル (.sb2)

- [豆猫 (cat.sb2)](cat.sb2)
    - 加速度センサでスクラッチキャットを動かします。
    - X, Y方向の値で位置、z方向が大きさに対応しているので、micro:bitをひっくり返すと猫が大きくなります。
- [飛ぶ (fly.sb2)](fly.sb2)
    - 四角の中を飛びます。micro:bit を、USB端子側を奥にして水平に持ち、飛行機のようにゆっくりと動かしてください。
    - あえて激しく動かすと、波紋っぽくなります。（その場合、四角を丸に変えるのもありかもしれません。）
    - 音楽: [魔王魂](https://maoudamashii.jokersounds.com/)より
- [綿毛と風 (blowball.sb2)](blowball.sb2)
    - 風車（かざぐるま）型コントローラと組み合わせます。ふーっと息を吹くと綿毛が舞っていきます。傾けると風のあたる場所が変わります。
    - [風車とmicro:bitの組み合わせ方](https://paddle.prokids.jp/work/show/239) (この例ではアルミ缶風車ですが、ペットボトル風車などを使うのもありです。）
- [いろいろ (small-tests.sb2)](small-tests.sb2)
    - いろいろなテストです。
    - [ブロックの使い方の解説](https://github.com/memakura/s2microbit-ble/wiki)で使っているプログラムが含まれています。

<iframe width="480" height="270" margin-bottom="4" margin-left="5" vertical-align="top" src="https://www.youtube.com/embed/dTPiU2RnBIc?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<iframe width="270" height="480" margin-bottom="4" margin-left="5" vertical-align="top" src="https://www.youtube.com/embed/eX-tqYTiw4Q?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## Scratch 2 拡張ファイル (.s2e)

上記のデモプロジェクトではなく、新たに作成したプロジェクトや、以前に作成していたプロジェクトにs2microbit-bleのブロックを追加するときは、以下の Scratch 2 拡張ファイルを使います。

- [s2microbit_JA.s2e](s2microbit_JA.s2e)
    - 右クリックを押して「名前を付けてリンク先を保存」などを選び、自分のPCにダウンロードしてください。
    - Scratch 2 オフラインエディタで、シフトを押しながらメニューから**ファイル**を選び、「実験的なHTTP拡張を読み込み」を選んで、ダウンロードした s2e ファイルを読み込みます。

<img width="500" alt="open-extension" src="../images/open-extension_JA.png">

---

<a name="English">

# Demo projects (.sb2) and block extension (.s2e)

## Scratch 2 (Offline) Project files (.sb2)

- [cat_EN.sb2](cat_EN.sb2)
    - Cat can be moved using accelerometer.
- [fly_EN.sb2](fly_EN.sb2)
    - Fly in the infinit loop of squares. 
    - Music: Thanks to [Maoudamashii](https://maoudamashii.jokersounds.com/).
- [blowball_EN.sb2)](blowball_EN.sb2)
    - A project for a scratch controller made with a soda can wind spinner and a micro:bit.
    - [Pictures of the controller (in Japanese)](https://paddle.prokids.jp/work/show/239)
- [small-tests_EN.sb2](small-tests_EN.sb2)
    - A set of simple test codes.

<iframe width="270" height="480" margin-bottom="4" margin-left="5" vertical-align="top" src="https://www.youtube.com/embed/FxhWVQj3drQ?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## Scratch 2 block extension file (.s2e)

- [s2microbit_EN.s2e](s2microbit_EN.s2e)
    - The block extension file can be loaded from Scratch2 File menu. Click **File** with `Shift` key pressed. Then choose **Import experimental HTTP extension**.
