document.addEventListener("DOMContentLoaded", () => {
    addMessage("bot", "Hi! I can help you book an event. Ask me about upcoming events!");
  });
  
  function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;
    addMessage("user", userInput);
    document.getElementById("user-input").value = "";
  
    fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    })
      .then((res) => res.json())
      .then((data) => addMessage("bot", data.reply));
  }
  
  function addMessage(sender, text) {
    let chatBox = document.getElementById("chat-box");
    let messageDiv = document.createElement("div");
    messageDiv.className = sender === "bot" ? "bot-msg" : "user-msg";
    messageDiv.innerHTML = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }
  