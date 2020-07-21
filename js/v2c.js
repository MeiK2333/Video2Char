class V2C {
  constructor(width, height, charset, grayImageCanvas = null, colorfulImageCanvas = null) {
    this.charset = charset;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = "10px monospace";

    this.grayImageCanvas = grayImageCanvas || document.createElement('canvas');
    this.grayImageCanvas.width = this.width * 7;
    this.grayImageCanvas.height = this.height * 7;
    this.grayImageCtx = this.grayImageCanvas.getContext('2d');
    this.grayImageCtx.font = "10px monospace";

    this.colorfulImageCanvas = colorfulImageCanvas || document.createElement('canvas');
    this.colorfulImageCanvas.width = this.width * 7;
    this.colorfulImageCanvas.height = this.height * 7;
    this.colorfulImageCtx = this.colorfulImageCanvas.getContext('2d');
    this.colorfulImageCtx.font = "10px monospace";
  }
}

class V2CVideo extends V2C {
  constructor(videoElem, width, height, charset, grayImageCanvas = null, colorfulImageCanvas = null) {
    super(width, height, charset, grayImageCanvas, colorfulImageCanvas);
    this.videoElem = videoElem;
  }
  screenshot(gray = false, colorful = false) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.videoElem, 0, 0, this.canvas.width, this.canvas.height);
    const image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (gray) {
      this.grayImageCtx.clearRect(0, 0, this.grayImageCanvas.width, this.grayImageCanvas.height);
      // this.grayImageCtx.fillStyle = '#fff';
      // this.grayImageCtx.fillRect(0, 0, this.grayImageCanvas.width, this.grayImageCanvas.height);
    }
    if (colorful) {
      this.colorfulImageCtx.clearRect(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
      // this.colorfulImageCtx.fillStyle = '#fff';
      // this.colorfulImageCtx.fillRect(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
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
          this.grayImageCtx.fillStyle = `rgba(0, 0, 0, 1)`;
          this.grayImageCtx.fillText(char, j * 7, 7 * i + 7);
        }
        if (colorful) {
          this.colorfulImageCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          this.colorfulImageCtx.fillText(char, j * 7, 7 * i + 7);
        }
      }
      frame.push(line.join(''));
    }
    const text = frame.join('\n');
    return {
      text: text,
      grayImage: this.grayImageCanvas,
      colorfulImage: this.colorfulImageCanvas
    }
  }
}

let ALPHA_THRESHOLD = 128;

function downloadGIF(images) {
  const encoder = new GIFEncoder();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.start();
  for (const image of images) {
    encoder.addFrame(image, true);
  }
  encoder.finish();
  encoder.download("output.gif");
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
