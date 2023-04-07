let mediaRecorder;
let chunks = [];
let audioBlob;

const apiKey = document.getElementById('apiKey');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resultLabel = document.getElementById('result');

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });

    mediaRecorder.addEventListener("dataavailable", event => {
      chunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      audioBlob = new Blob(chunks, { type: "video/webm;codecs=vp9" });
      chunks = [];
    });

    mediaRecorder.start();
  } catch (err) {
    console.error("Unable to get user media", err);
  }
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  // add this block to wait for mediaRecorder to stop
  const checkInterval = setInterval(() => {
    if (mediaRecorder.state === 'inactive') {
      clearInterval(checkInterval);
      callApi();
    }
  }, 100);
});

function callApi(){
  const formData = new FormData();
  formData.append('file', audioBlob, "test.webm");
  formData.append('model', 'whisper-1');
  const authorization = 'Bearer ' + apiKey.value;

  fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': authorization
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => resultLabel.innerText = JSON.stringify(data, null, " "))
  .catch(error => console.error(error));
}
