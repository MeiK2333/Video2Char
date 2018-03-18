# coding=utf-8
import os
import json
from PIL import Image

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


def gif2char(gif, width, height, charset):
    gif = Image.open(gif)
    gif.seek(1)

    char_set = []
    count = 0

    try:
        while True:
            char_set.append(CHAR_TEMP % image2char(gif, width, height, charset))
            if count % 10 == 0:
                print('生成 %d S 字符画' % (count / 10))
            count += 1
            gif.seek(gif.tell() + 1)
    except EOFError:
        return ''.join(char_set)


def video2gif(video, width, height):
    os.system('ffmpeg -i %s -s %d*%d -r 10 %s.gif' %
              (video, width, height, video))


if __name__ == '__main__':
    with open('config.json') as fr:
        data = json.loads(fr.read())
    charset = charset256(data['charset'])
    width = data['width']
    height = data['height']
    file = data['file']
    video2gif(file, width, height)
    char = gif2char(file + '.gif', width, height, charset)
    with open(file + '.html', 'w') as fr:
        fr.write(JAVASCRIPT + STYLE + char)
