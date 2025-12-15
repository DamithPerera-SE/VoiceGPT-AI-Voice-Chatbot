import React, { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    // Show user message
    setChat(prev => [...prev, { sender: "User", text: message }]);
    const userMessage = message;
    setMessage("");

    try {
      // Send message to backend
      const response = await axios.post("http://localhost:5000/chat", { message: userMessage });
      const botMessage = response.data.reply; // <-- Correct key

      // Show bot message
      setChat(prev => [...prev, { sender: "Bot", text: botMessage }]);

      // Optional: speak bot message
      const utterance = new SpeechSynthesisUtterance(botMessage);
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { sender: "Bot", text: "Error: Could not get response." }]);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>VoiceGPT Chatbot</h1>
      <div style={{ border: "1px solid black", padding: "10px", height: "400px", overflowY: "scroll", marginBottom: "10px" }}>
        {chat.map((c, i) => (
          <p key={i}><b>{c.sender}:</b> {c.text}</p>
        ))}
      </div>
      <input
        style={{ width: "80%", padding: "10px" }}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        placeholder="Type or speak..."
      />
      <button style={{ padding: "10px" }} onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
