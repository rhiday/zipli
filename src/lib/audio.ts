import lamejs from 'lamejs';

export const convertToMp3 = (audioData: Float32Array, sampleRate: number): Blob => {
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const mp3Data: Int8Array[] = [];

  // Convert Float32Array to Int16Array
  const samples = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    samples[i] = audioData[i] < 0 ? audioData[i] * 0x8000 : audioData[i] * 0x7FFF;
  }

  // Encode to MP3
  const sampleBlockSize = 1152;
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  // Get the last buffer of MP3 data
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  // Combine all MP3 data into a single Blob
  const blob = new Blob(mp3Data, { type: 'audio/mp3' });
  return blob;
};

export const processAudioData = async (stream: MediaStream): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const audioData: Float32Array[] = [];

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      audioData.push(new Float32Array(inputData));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    setTimeout(() => {
      // Disconnect and cleanup
      processor.disconnect();
      source.disconnect();
      audioContext.close();

      // Combine all audio data
      const combinedData = new Float32Array(audioData.reduce((acc, curr) => acc + curr.length, 0));
      let offset = 0;
      audioData.forEach(data => {
        combinedData.set(data, offset);
        offset += data.length;
      });

      // Convert to MP3
      const mp3Blob = convertToMp3(combinedData, audioContext.sampleRate);
      resolve(mp3Blob);
    }, 1000); // Process 1 second of audio
  });
};