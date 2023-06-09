let mediaRecorder;
let chunks = [];
let audioBlob;

const apiKey = document.getElementById('apiKey');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const transcriptionsResult = document.getElementById('transcriptionsResult');
const translationsResult = document.getElementById('translationsResult');

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", event => {
      chunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      audioBlob = new Blob(chunks, { type: "audio/mp3" });
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
      callTranscriptionsApi();
      callTranslationsApi();
    }
  }, 100);
});

function callTranscriptionsApi(){
  const formData = new FormData();
  formData.append('file', audioBlob, "test.mp3");
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
  .then(data => transcriptionsResult.innerText = JSON.stringify(data, null, " "))
  .catch(error => console.error(error));
}

function callTranslationsApi(){
  const formData = new FormData();
  formData.append('file', audioBlob, "test.mp3");
  formData.append('model', 'whisper-1');
  const options = {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey.value}`
    },
    body: formData
  };

  const url = new URL('https://api.openai.com/v1/audio/translations');

  fetch(url, options)
    .then(res => res.json())
    .then(data => translationsResult.innerText = JSON.stringify(data, null, " "))
    .catch(error => console.error(error));
}