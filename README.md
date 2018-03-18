# Video2Char


## 依赖

- Python3
- Python - PIL
- ffmpeg


## 用法

通过 config.json 来配置

- width: 生成的字符画的宽度
- height: 生成的字符画的高度
- charset: 生成字符画所用的字符集
- file: 要生成字符画的视频文件

然后直接 ``` python3 video2char.py ``` 即可


## 注意事项

- file 必须合法且没有空格


## 已知问题

- 某些视频文件会被错误的转换（尚未发现规律）
- 我的字符集转换出来的字符画偏暗


## Todo

- <del>有颜色的选项</del>(电脑崩了，不更新了)