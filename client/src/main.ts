import './style.css'

document.querySelector("form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = (document.getElementById("wordInput") as HTMLInputElement).value;
  const translation = getTranslation(word);
  const exampleSentence = getExampleSentence(word);

  const resultDiv = document.getElementById("result");

  if (!resultDiv) {
    return
  }

  resultDiv.innerHTML = `
          <h3>Translation:</h3>
          <p>${translation}</p>
          <h3>Example Sentence:</h3>
          <p>${exampleSentence}</p>
      `;
});

function getTranslation(word: string) {
  // Placeholder translation logic
  const translations: Record<string, string> = {
    hello: "hallo",
    cat: "Katze",
    dog: "Hund",
    friend: "Freund",
  }
  return translations[word.toLowerCase()] || "Translation not found";
}

function getExampleSentence(word: string) {
  // Placeholder example sentences
  const examples: Record<string, string> = {
    hello: 'Sagen Sie "hallo", wenn Sie jemanden treffen.',
    cat: "Die Katze sitzt auf dem Dach.",
    dog: "Der Hund läuft im Park.",
    friend: "Mein Freund ist sehr nett.",
  };
  return examples[word.toLowerCase()] || "Example sentence not found.";
}