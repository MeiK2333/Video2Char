class V2C {
  constructor(width, height, charset) {
    this.charset = charset;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = "10px monospace";

    this.imageCanvas = document.createElement('canvas');
    this.imageCanvas.width = this.width * 7;
    this.imageCanvas.height = this.height * 7;
    this.imageCtx = this.imageCanvas.getContext('2d');
    this.imageCtx.font = "10px monospace";

    this.colorfulImageCanvas = document.createElement('canvas');
    this.colorfulImageCanvas.width = this.width * 7;
    this.colorfulImageCanvas.height = this.height * 7;
    this.colorfulImageCtx = this.colorfulImageCanvas.getContext('2d');
    this.colorfulImageCtx.font = "10px monospace";
  }
}

class V2CVideo extends V2C {
  constructor(videoElem, width, height, charset) {
    super(width, height, charset);
    this.videoElem = videoElem;
  }
  screenshot(gray = false, colorful = false) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.videoElem, 0, 0, this.canvas.width, this.canvas.height);
    const image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (gray) {
      this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    }
    if (colorful) {
      this.colorfulImageCtx.clearRect(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
    }
    const frame = [];
    let pos = 0;
    for (let i = 0; i < image.height; i++) {
      const line = [];
      for (let j = 0; j < image.width; j++) {
        const r = image.data[pos++];
        const g = image.data[pos++];
        const b = image.data[pos++];
        const a = image.data[pos++];
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const char = this.charset[Math.min(Math.ceil((y + 1) / Math.floor(256 / this.charset.length)), this.charset.length) - 1];
        line.push(char);

        if (gray) {
          this.imageCtx.fillStyle = `red`;
          this.imageCtx.fillText(char, j * 7, 7 * i + 7);
        }
        if (colorful) {
          this.colorfulImageCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          this.colorfulImageCtx.fillText(char, j * 7, 7 * i + 7);
        }
      }
      frame.push(line.join(''));
    }
    const text = frame.join('\n');
    let grayImage = null;
    if (gray) {
      grayImage = this.imageCtx.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    }
    let colorfulImage = null;
    if (colorful) {
      colorfulImage = this.colorfulImageCtx.getImageData(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
    }
    return {
      text: text,
      grayImage: grayImage,
      colorfulImage: colorfulImage
    }
  }
}

function downloadGray(grayImages) {
  // TODO: 生成 GIF 并触发下载
  for (let i = 0; i < grayImages.length; i++) {
    const image = grayImages[i];
  }
}

function downloadText(texts) {
  const a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);

  const html = `
<!doctype html>
<html lang="zh-cn">
<script>
const frames = ${JSON.stringify(texts)};
<\/script>
<style>
pre {
font-size: 10px;
line-height: 7px;
}
<\/style>
<body>
<pre>
<\/pre>
<\/body>
<script>
async function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}
async function play() {
const pre = document.querySelector('pre');
while (1) {
for (frame of frames) {
  pre.innerText = frame;
  await sleep(100);
}
}
}
play();
<\/script>
<\/html>
`;
  const blob = new Blob([html], { type: "octet/stream" }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = 'output.html';
  a.click();
}
