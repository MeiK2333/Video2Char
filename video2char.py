# coding=utf-8
import os
import json
from PIL import Image

# 写入的 HTML 的配置
STYLE = '<style>pre{font-size: 10px;line-height: 7px;}</style>\r\n'
CHAR_TEMP = '<pre style="display:none">\r\n%s</pre>'
JAVASCRIPT = '''<script>
    var body;
    var first;
    var init = function() {
        body = document.getElementsByTagName("body")[0];
        first = body.firstChild;
    }
    var doframe = function() {
        body.removeChild(first);
        first = body.firstChild;
        first.style.display = 'block';
    }
    setTimeout(init, 1);
    setInterval(doframe, 100);
</script>'''


def charset256(charset):
    # 将字符集长度扩展为 256
    charset_len = len(charset)
    if charset_len > 256:
        return charset[:256]
    r = 256 // charset_len
    m = 256 % charset_len
    s = ''
    for i in charset[:m]:
        s += i * (r + 1)
    for i in charset[m:]:
        s += i * r
    return s


def image2char(image, width, height, charset):
    # 将图片转换为字符画
    image = image.convert('L').resize((width, height))  # 将图片转换为灰度模式
    pix = image.load()

    char_set = []

    for i in range(height):
        for j in range(width):
            # 读取每一个像素的值，找出对应的字符
            char = charset[pix[j, i]]
            char_set.append(char)
        char_set.append('\r\n')
    # 返回合并后的字符画
    return ''.join(char_set)


def gif2char(gif, width, height, charset):
    gif = Image.open(gif)
    gif.seek(1)

    char_set = []
    count = 0

    try:
        # 逐帧将 GIF 转换
        while True:
            char_set.append(CHAR_TEMP % image2char(gif, width, height, charset))
            if count % 10 == 0:
                print('生成 %d S 字符画' % (count / 10))
            count += 1
            gif.seek(gif.tell() + 1)
    except EOFError:
        # 合并所有帧
        return ''.join(char_set)


def video2gif(video, width, height):
    # 调用 FFmpeg ，将视频转换为指定大小的 GIF
    os.system('ffmpeg -i %s -s %d*%d -r 10 %s.gif' %
              (video, width, height, video))


if __name__ == '__main__':
    # 从 config.json 中读取 json 格式的配置
    with open('config.json') as fr:
        data = json.loads(fr.read())
    # 将配置的字符集长度扩展为 256
    charset = charset256(data['charset'])
    width = data['width']  # 要生成的字符画的宽度
    height = data['height']  # 要生成的字符画的高度
    file = data['file']  # 要转换的视频文件

    # 将视频文件转换为 GIF
    video2gif(file, width, height)

    # 逐帧将 GIF 转换为字符画
    char = gif2char(file + '.gif', width, height, charset)

    # 将生成的字符画写入文件
    with open(file + '.html', 'w') as fr:
        fr.write(JAVASCRIPT + STYLE + char)
