function create () {
  /** @type { AudioContext } */
  let audioCtx;
  /** @type {AnalyserNode} */
  let analyser;
  /** @type { Float32Array } */
  let buffer;

  let animationId;

  const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

  function getRMS () {
    if (!analyser) {
      console.error('no analyzer object created. Probably called getRMS in a bad state');
      return;
    }
    analyser.getFloatTimeDomainData(buffer);
    const sum = buffer.reduce((acc, sample, index) => {
      // console.log('sample:', sample, 'doubled:', sample * sample);
    // console.log(index, ': ', acc);
      return acc + (sample * sample);
    }, 0);
    // const avg = sum / buffer.length;
    // console.log(sum);
    // return avg;
    const rmsAmplitude = Math.sqrt(sum / buffer.length);
    return map(rmsAmplitude, 0, 0.5, 0, 1);
  // return 20 * Math.log10(rmsAmplitude);
  // return sum / buffer.length;
  // console.log(buffer);
  }

  const attachStream = async stream => {
    await detachStream();
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; // 2048;

    const bufferLength = analyser.frequencyBinCount;

    buffer = new Float32Array(bufferLength);

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
  };
  const detachStream = async function () {
    if (audioCtx && audioCtx.state !== 'closed') {
      detachCallback();
      await audioCtx.close();
    }
  };
  const attachCallback = function (fn) {
    console.log('attaching RMS Callback');
    detachCallback();
    function loop () {
      fn(getRMS());
      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);
  };
  const detachCallback = function () {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  // clearTimeout(animationId);
  };
  return {
    attachStream, detachStream, attachCallback, detachCallback,
  };
}

export default create;
