# coding=utf-8
import os
import json
from PIL import Image

STYLE = '<style>pre{font-size: 10px;line-height: 6px;}</style>\r\n'
CHAR_TEMP = '<pre>\r\n%s</pre>'
JAVASCRIPT = '''<script>
window.onload = function() {
    var frames = document.getElementsByTagName('pre');
    var length = frames.length;
    var current = 0;
    for (var i = 1; i < length; i++) {
        frames[i].style.display = 'none';
    }
    var doframe = function() {
        if (length <= 1)
            return;
        frames[current].style.display = 'block';
        if (current > 0)
            frames[current - 1].style.display = 'none';
        else
            frames[length - 1].style.display = 'none';
        if (current < length - 1)
            current = current + 1;
        else
            current = 0;
    }
    setInterval(doframe, %d);
}
</script>'''


def charset256(charset):
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
    image = image.convert('L').resize((width, height))
    pix = image.load()

    char_set = []

    for i in range(height):
        for j in range(width):
            char = charset[pix[j, i]]
            char_set.append(char)
        char_set.append('\r\n')
    return ''.join(char_set)


def gif2char(gif, width, height, charset, frame):
    gif = Image.open(gif)
    gif.seek(1)

    char_set = []
    count = 0

    try:
        while True:
            char_set.append(CHAR_TEMP % image2char(gif, width, height, charset))
            if count % frame == 0:
                print('生成 %d S 字符画' % (count / frame))
            count += 1
            gif.seek(gif.tell() + 1)
    except EOFError:
        return ''.join(char_set)


def video2gif(video, width, height, frame):
    os.system('ffmpeg -i %s -s %d*%d -r %d %s.gif' %
              (video, width, height, frame, video))


if __name__ == '__main__':
    with open('config.json') as fr:
        data = json.loads(fr.read())
    image = Image.open('test.jpg')
    charset = charset256(data['charset'])
    width = data['width']
    height = data['height']
    frame = 1000 // data['frame']
    file = data['file']
    video2gif(file, width, height, frame)
    char = gif2char(file + '.gif', width, height, charset, frame)
    with open(file + '.html', 'w') as fr:
        fr.write(JAVASCRIPT % frame + STYLE + char)
