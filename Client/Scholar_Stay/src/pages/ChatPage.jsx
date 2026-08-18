import React, { useState, useRef, useEffect, useCallback } from 'react';
import HouseCard from '../components/HouseCard';
import { API_BASE_URL } from '../config';
import './ChatPage.css';

const SESSION_STORAGE_KEY = 'scholarstay_chat_session_id';
// The agentic workflow can chain several LLM calls (intent parsing, search,
// recommendation) before replying, so this is generously long — it's a safety
// net against a truly hung request, not a realistic expected latency.
const REQUEST_TIMEOUT_MS = 180000;

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
  const textareaRef = useRef(null);

  if (sessionIdRef.current === null) {
    sessionIdRef.current = getSessionId();
  }

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, error]);

  // Auto-grow the input with its content, up to the CSS max-height cap (past
  // that, the textarea's own overflow-y: auto takes over with a scrollbar).
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  const sendQuery = useCallback(async (query, { appendUserMessage = true } = {}) => {
    setError(null);
    setIsThinking(true);
    if (appendUserMessage) {
      setMessages((prev) => [...prev, { id: nextMessageId(), role: 'user', content: query }]);
    }

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

  const handleInputKeyDown = (e) => {
    // Enter sends the message; Shift+Enter inserts a newline like most chat apps.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery && !isThinking) {
      sendQuery(lastFailedQuery, { appendUserMessage: false });
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
                {msg.recommendation && msg.recommendation.length > 0 ? (
                  // The backend's `reply` text is the same content as
                  // `recommendation`, just concatenated into one paragraph
                  // instead of split per-listing — showing both duplicates it,
                  // so prefer the more scannable bullet-point form.
                  <ul className="chat-recommendation-list">
                    {msg.recommendation.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{msg.content}</p>
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
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask about student housing..."
            disabled={isThinking}
            rows={1}
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
