import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = ({ userRole = "NGO" }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        userRole === "RESTAURANT"
          ? "👋 Hi! I'm FoodBridge AI. I can help you manage food donations, check requests, and reduce waste. What would you like to know?"
          : "👋 Hi! I'm FoodBridge AI. I can help you find food, track requests, plan routes, and more. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(-7).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await axios.post("http://localhost:5000/chat", {
        message: text,
        role: userRole,
        history,
      });

      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies =
    userRole === "RESTAURANT"
      ? ["How do I list food?", "Check my requests", "Tips to reduce waste"]
      : ["What food is available?", "Track my requests", "Plan pickup route"];

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-fab ${open ? "chatbot-fab--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Chat"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="chatbot-fab__badge">{unread}</span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <p className="chatbot-header__name">FoodBridge AI</p>
                <p className="chatbot-header__status">
                  <span className="chatbot-online-dot" /> Online
                </p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                {msg.role === "bot" && (
                  <div className="chatbot-msg__avatar">🤖</div>
                )}
                <div className="chatbot-msg__bubble">{msg.text}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg chatbot-msg--bot">
                <div className="chatbot-msg__avatar">🤖</div>
                <div className="chatbot-msg__bubble chatbot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies — only show at start */}
          {messages.length <= 1 && (
            <div className="chatbot-quick">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  className="chatbot-quick__btn"
                  onClick={() => {
                    setInput(q);
                    setTimeout(sendMessage, 100);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
