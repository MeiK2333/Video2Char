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

    pic_set = []

    for i in range(height):
        for j in range(width):
            char = charset[pix[j, i]]
            pic_set.append(char)
        pic_set.append('\r\n')
    return ''.join(pic_set)


if __name__ == '__main__':
    with open('config.json') as fr:
        data = json.loads(fr.read())
    image = Image.open('test.jpg')
    charset = charset256(data['charset'])
    width = data['width']
    height = data['height']
    frame = 1000 // data['frame']
    char = image2char(image, width, height, charset)
    with open('test.html', 'w') as fr:
        fr.write(JAVASCRIPT % frame + STYLE + CHAR_TEMP % char)
