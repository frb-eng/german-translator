import "./style.css";

async function fetchData(word: string) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: word }),
  });

  if (!response.ok) {
    throw new Error("Coudn`t fetch api");
  }

  const json = await response.json();
  return json;
}

document.querySelector("form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = (document.getElementById("wordInput") as HTMLInputElement).value;
  const resultDiv = document.getElementById("result");

  if (!resultDiv) {
    return;
  }

  try {
    const response: { translation: string; example: string } = await fetchData(word);
    resultDiv.innerHTML = `
    <h3>Translation:</h3>
    <p>${response.translation}</p>
    <h3>Example Sentence:</h3>
    <p>${response.example}</p>
`;
  } catch(error) {
    console.error(error)
  }
});
