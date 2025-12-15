import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Send message
  const sendMessage = async () => {
    if (!message) return;
    setChat(prev => [...prev, { sender: "You", text: message }]);
    const userMessage = message;
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/chat", { message: userMessage });
      const botMessage = response.data.reply;
      setChat(prev => [...prev, { sender: "Bot", text: botMessage }]);

      // Speak bot message
      const utterance = new SpeechSynthesisUtterance(botMessage);
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { sender: "Bot", text: "Error: Could not get response." }]);
    } finally {
      setLoading(false);
    }
  };

  // Speech-to-text
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setMessage(speech);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>VoiceGPT Chatbot</h1>
      <div style={{ border: "1px solid black", padding: "10px", height: "400px", overflowY: "scroll", marginBottom: "10px", backgroundColor: "#f4f4f8" }}>
        {chat.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: c.sender === "You" ? "flex-end" : "flex-start", marginBottom: "8px" }}>
            <div style={{ maxWidth: "70%", padding: "10px", borderRadius: "10px", backgroundColor: c.sender === "You" ? "#0084ff" : "#e4e6eb", color: c.sender === "You" ? "white" : "black" }}>
              <b>{c.sender}:</b> {c.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div style={{ display: "flex", gap: "5px" }}>
        <input
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type or speak..."
        />
        <button style={{ padding: "10px", borderRadius: "5px" }} onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
        <button style={{ padding: "10px", borderRadius: "5px" }} onClick={startListening}>🎤</button>
      </div>
    </div>
  );
}

export default App;
