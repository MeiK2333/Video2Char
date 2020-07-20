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
    this.texts = [];

    this.imageCanvas = document.createElement('canvas');
    this.imageCanvas.width = this.width * 7;
    this.imageCanvas.height = this.height * 7;
    this.imageCtx = this.imageCanvas.getContext('2d');
    this.imageCtx.font = "10px monospace";
    this.images = [];

    this.colorfulImageCanvas = document.createElement('canvas');
    this.colorfulImageCanvas.width = this.width * 7;
    this.colorfulImageCanvas.height = this.height * 7;
    this.colorfulImageCtx = this.colorfulImageCanvas.getContext('2d');
    this.colorfulImageCtx.font = "10px monospace";
    this.colorfulImages = [];
  }
}

class V2CVideo extends V2C {
  constructor(videoElem, width, height, charset) {
    super(width, height, charset);
    this.videoElem = videoElem;
  }
  screenshot() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.videoElem, 0, 0, this.canvas.width, this.canvas.height);
    const image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    this.colorfulImageCtx.clearRect(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
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

        this.colorfulImageCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.colorfulImageCtx.fillText(char, j * 7, 7 * i + 7);
        this.imageCtx.fillText(char, j * 7, 7 * i + 7);
      }
      frame.push(line.join(''));
    }
    const text = frame.join('\n');
    this.texts.push(text);
    const grayImage = this.imageCtx.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    this.images.push(grayImage);
    const colorfulImage = this.colorfulImageCtx.getImageData(0, 0, this.colorfulImageCanvas.width, this.colorfulImageCanvas.height);
    this.colorfulImages.push(colorfulImage);
    return {
      text: text,
      grayImage: grayImage,
      colorfulImage: colorfulImage
    }
  }
}
