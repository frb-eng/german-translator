import "./style.css";

class RESTError extends Error {}

async function fetchData(word: string, model: string) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: word, model: model }),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new RESTError(json.detail);
  }

  const json = await response.json();
  return json;
}

async function fetchSpeechData(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/speech-input", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const json = await response.json();
    throw new RESTError(json.detail);
  }

  const json = await response.json();
  return json;
}

document.querySelector("form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = (document.getElementById("wordInput") as HTMLInputElement).value;
  const model = (document.getElementById("modelSelect") as HTMLSelectElement)
    .value;
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");

  if (!resultDiv || !errorDiv || !loadingDiv) {
    return;
  }

  resultDiv.innerHTML = "";
  errorDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  try {
    const response: {
      translation: string;
      example: string;
      translationSpeech: string;
      exampleSpeech: string;
    } = await fetchData(word, model);
    resultDiv.innerHTML = `
    <h3>Translation:</h3>
    <p>${response.translation}</p>
    <audio id="translationSpeech" controls autoplay>
      <source src="${response.translationSpeech}">
      Your browser does not support the audio element.
    </audio>
    <h3>Example Sentence:</h3>
    <p>${response.example}</p>
    <audio id="exampleSpeech" controls>
      <source src="${response.exampleSpeech}">
      Your browser does not support the audio element.
    </audio>
    <button type="button" id="generateImageButton" class="generate-image-button">Generate Image</button>
    <div id="imageContainer"></div>
  `;

    document.getElementById("generateImageButton")?.addEventListener("click", async () => {
      const imageContainer = document.getElementById("imageContainer");
      if (imageContainer) {
        imageContainer.innerHTML = '<div class="skeleton-loader"></div>';
      }
      try {
        const imageResponse = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: response.example }),
        });

        if (!imageResponse.ok) {
          throw new RESTError("Failed to generate image");
        }

        const imageData = await imageResponse.json();
        if (imageContainer) {
          imageContainer.innerHTML = `<img src="${imageData.imageUrl}" alt="${response.example}">`;
        }
      } catch (error) {
        errorDiv.innerHTML = "Failed to generate image";
      }
    });
  } catch (error) {
    if (error instanceof RESTError) {
      errorDiv.innerHTML = error.message;
      return;
    }

    errorDiv.innerHTML = "Couldn't connect to server";
  } finally {
    loadingDiv.style.display = "none";
  }
});

document.getElementById("speechInputButton")?.addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");

  if (!resultDiv || !errorDiv || !loadingDiv) {
    return;
  }

  resultDiv.innerHTML = "";
  errorDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
      const response = await fetchSpeechData(audioFile);
      resultDiv.innerHTML = `
        <h3>Translation:</h3>
        <p>${response.translation}</p>
        <audio id="translationSpeech" controls autoplay>
          <source src="${response.translationSpeech}">
          Your browser does not support the audio element.
        </audio>
        <h3>Example Sentence:</h3>
        <p>${response.example}</p>
        <audio id="exampleSpeech" controls>
          <source src="${response.exampleSpeech}">
          Your browser does not support the audio element.
        </audio>
      `;
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // Stop recording after 5 seconds
  } catch (error) {
    if (error instanceof RESTError) {
      errorDiv.innerHTML = error.message;
      return;
    }

    errorDiv.innerHTML = "Couldn't connect to server";
  } finally {
    loadingDiv.style.display = "none";
  }
});
