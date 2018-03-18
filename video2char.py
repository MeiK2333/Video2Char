# coding=utf-8
import os
import json
from PIL import Image

STYLE = '<style>pre{font-size: 10px;line-height: 6px;}</style>\r\n'
CHAR_TEMP = '<pre>\r\n{}</pre>'

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
    char = image2char(image, width, height, charset)
    with open('test.html', 'w') as fr:
        fr.write(STYLE + CHAR_TEMP.format(char))
