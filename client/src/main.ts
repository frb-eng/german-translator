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
      exampleImage: string;
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
    <img src="${response.exampleImage}" alt="${response.example}">
  `;
  } catch (error) {
    if (error instanceof RESTError) {
      errorDiv.innerHTML = error.message;
      return;
    }

    errorDiv.innerHTML = "Coudn't connect to server";
  } finally {
    loadingDiv.style.display = "none";
  }
});
