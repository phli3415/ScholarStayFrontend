import React, { useState, useRef, useEffect, useCallback } from 'react';
import HouseCard from '../components/HouseCard';
import { API_BASE_URL } from '../config';
import './ChatPage.css';

const SESSION_STORAGE_KEY = 'scholarstay_chat_session_id';
const REQUEST_TIMEOUT_MS = 30000;

const EXAMPLE_PROMPTS = [
  'Find me a house under $1000 near campus',
  'What listings have parking and a kitchen?',
  'Show me the cheapest available places',
];

const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
};

let messageIdCounter = 0;
const nextMessageId = () => `msg-${Date.now()}-${messageIdCounter++}`;

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi! I'm the ScholarStay AI assistant. Ask me about student housing near your campus — budget, amenities, distance, anything — and I'll search live listings for you.",
};

const ChatPage = () => {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const sessionIdRef = useRef(null);
  const listEndRef = useRef(null);

  if (sessionIdRef.current === null) {
    sessionIdRef.current = getSessionId();
  }

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, error]);

  const sendQuery = useCallback(async (query) => {
    setError(null);
    setIsThinking(true);
    setMessages((prev) => [...prev, { id: nextMessageId(), role: 'user', content: query }]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sessionIdRef.current }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `The assistant is unavailable right now (${response.status}).`
        );
      }

      const data = await response.json();

      let houses = [];
      if (Array.isArray(data.house_ids) && data.house_ids.length > 0) {
        const results = await Promise.all(
          data.house_ids.map((id) =>
            fetch(`${API_BASE_URL}/houses/${id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        houses = results.filter(Boolean);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          role: 'assistant',
          content: data.reply,
          recommendation: Array.isArray(data.recommendation) ? data.recommendation : [],
          houses,
        },
      ]);
      setLastFailedQuery(null);
    } catch (err) {
      const message =
        err.name === 'AbortError'
          ? 'The assistant took too long to respond. Please try again.'
          : err.message || 'Something went wrong talking to the assistant.';
      setError(message);
      setLastFailedQuery(query);
    } finally {
      clearTimeout(timeoutId);
      setIsThinking(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isThinking) return;
    setInput('');
    sendQuery(query);
  };

  const handleRetry = () => {
    if (lastFailedQuery && !isThinking) {
      sendQuery(lastFailedQuery);
    }
  };

  const handleExampleClick = (prompt) => {
    if (isThinking) return;
    sendQuery(prompt);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>AI Housing Assistant</h1>
        <p>
          Ask about listings, budget, amenities, or distance to campus — the agent
          searches live listings and recommends matches.
        </p>
      </div>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message-${msg.role}`}>
              <div className="chat-bubble">
                <p>{msg.content}</p>
                {msg.recommendation && msg.recommendation.length > 0 && (
                  <ul className="chat-recommendation-list">
                    {msg.recommendation.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              {msg.houses && msg.houses.length > 0 && (
                <div className="chat-house-grid">
                  {msg.houses.map((house) => (
                    <HouseCard key={house.id} house={house} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-bubble chat-thinking" aria-label="Assistant is thinking">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {messages.length <= 1 && !isThinking && (
          <div className="chat-examples">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chat-example-chip"
                onClick={() => handleExampleClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about student housing..."
            disabled={isThinking}
          />
          <button type="submit" disabled={isThinking || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
