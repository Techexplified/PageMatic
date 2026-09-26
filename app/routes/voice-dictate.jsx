import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  X,
} from "lucide-react";

export const meta = () => {
  return [
    { title: "PageMatic Voice Dictation" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export const loader = () => {
  return null;
};

export default function VoiceDictatePopup() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState("prompt"); // "prompt" | "granted" | "denied"

  const recognitionRef = useRef(null);
  const channelRef = useRef(null);

  // Setup BroadcastChannel for cross-window communication
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("pagematic_voice_sync");
    }
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        setTranscript((prev) => (prev ? `${prev.trim()} ${final.trim()}` : final.trim()));
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition event:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionState("denied");
        setError("Microphone permission was denied. Please allow microphone access in this popup's address bar.");
        setIsListening(false);
      } else if (event.error === "no-speech") {
        // Just silent timeout, continue listening
      } else {
        setError(`Speech recognition notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we are supposed to be listening
      if (recognitionRef.current && isListening) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    // Auto-start listening on popup open
    startListening();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = async () => {
    setError(null);
    setPermissionState("prompt");

    // Explicitly request microphone stream in top-level context
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionState("granted");
      } catch (err) {
        console.warn("Microphone access error:", err);
        setPermissionState("denied");
        setError("Microphone access was denied. Click the lock/camera icon in this browser address bar to allow.");
        setIsListening(false);
        return;
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Recognition might already be running
        setIsListening(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimText("");
  };

  const handleDone = () => {
    stopListening();
    const fullText = [transcript, interimText].filter(Boolean).join(" ").trim();

    if (fullText) {
      // 1. Send via BroadcastChannel
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "PAGEMATIC_VOICE_TRANSCRIPT",
          text: fullText,
        });
      }

      // 2. Also send via postMessage to opener
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "PAGEMATIC_VOICE_TRANSCRIPT",
            text: fullText,
          },
          "*"
        );
      }
    }

    // Close the popup window
    setTimeout(() => {
      window.close();
    }, 150);
  };

  const handleCancel = () => {
    stopListening();
    window.close();
  };

  const fullDisplay = transcript + (interimText ? (transcript ? " " : "") + interimText : "");

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>
            <Mic size={18} color="#0052FF" />
          </div>
          <div>
            <h1 style={styles.title}>Voice Dictation</h1>
            <p style={styles.subtitle}>Dictate directions for PageMatic AI</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={styles.statusBadge(isListening)}>
          <span style={styles.statusDot(isListening)} />
          <span style={styles.statusText(isListening)}>
            {isListening ? "Listening..." : "Paused"}
          </span>
        </div>
      </div>

      {/* Visual Audio Waveform */}
      {isListening && (
        <div style={styles.waveformContainer}>
          <div style={{ ...styles.waveBar, animationDelay: "0ms", height: "16px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "150ms", height: "26px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "300ms", height: "36px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "450ms", height: "22px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "200ms", height: "30px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "350ms", height: "18px" }} />
          <div style={{ ...styles.waveBar, animationDelay: "100ms", height: "12px" }} />
        </div>
      )}

      {/* Error / Alert Banner */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1 }}>
            <div style={styles.errorText}>{error}</div>
            {permissionState === "denied" && (
              <button style={styles.retryBtn} onClick={startListening} type="button">
                <RefreshCw size={11} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transcript Text Area */}
      <div style={styles.transcriptCard}>
        <div style={styles.transcriptHeader}>
          <span style={styles.transcriptLabel}>Live Transcript</span>
          {fullDisplay && (
            <button style={styles.clearBtn} onClick={handleClear} type="button">
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          style={styles.textarea}
          value={fullDisplay}
          onChange={(e) => {
            setTranscript(e.target.value);
            setInterimText("");
          }}
          placeholder={
            isListening
              ? "Start speaking your custom directions, tone, key selling points..."
              : "Click 'Resume' or 'Start Listening' to begin dictating..."
          }
        />
      </div>

      {/* Footer Controls */}
      <div style={styles.footer}>
        <button
          type="button"
          style={styles.btnSecondary}
          onClick={handleCancel}
        >
          <X size={14} />
          <span>Cancel</span>
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          {isSupported && (
            <button
              type="button"
              style={styles.btnToggle(isListening)}
              onClick={toggleListening}
            >
              {isListening ? (
                <>
                  <Pause size={14} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Resume</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            style={styles.btnPrimary(Boolean(fullDisplay))}
            onClick={handleDone}
            disabled={!fullDisplay}
          >
            <span>Done & Insert</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        body {
          margin: 0;
          overflow: hidden;
        }
        @keyframes pmWavePulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        @keyframes pmRadar {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "16px",
    background: "#F8FAFC",
    height: "100vh",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    color: "#0F172A",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoBadge: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "1px solid #BFDBFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: 0,
    fontSize: "11.5px",
    color: "#64748B",
  },
  statusBadge: (isListening) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11.5px",
    fontWeight: "500",
    background: isListening ? "#DCFCE7" : "#F1F5F9",
    color: isListening ? "#166534" : "#64748B",
    border: `1px solid ${isListening ? "#BBF7D0" : "#E2E8F0"}`,
  }),
  statusDot: (isListening) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: isListening ? "#22C55E" : "#94A3B8",
    animation: isListening ? "pmRadar 1.5s ease-in-out infinite" : "none",
  }),
  statusText: (isListening) => ({
    fontWeight: "600",
  }),
  waveformContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    height: "38px",
    background: "linear-gradient(135deg, #0052FF 0%, #2563EB 100%)",
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow: "0 3px 10px rgba(0, 82, 255, 0.15)",
  },
  waveBar: {
    width: "4px",
    background: "#FFFFFF",
    borderRadius: "4px",
    animation: "pmWavePulse 1.2s ease-in-out infinite",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 10px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    color: "#991B1B",
    fontSize: "12px",
    marginBottom: "10px",
  },
  errorText: {
    lineHeight: "1.4",
  },
  retryBtn: {
    marginTop: "5px",
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: "600",
    background: "#FFFFFF",
    border: "1px solid #FCA5A5",
    borderRadius: "4px",
    color: "#B91C1C",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  transcriptCard: {
    flex: 1,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    minHeight: 0,
  },
  transcriptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  transcriptLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#94A3B8",
  },
  clearBtn: {
    background: "none",
    border: "none",
    fontSize: "11.5px",
    color: "#64748B",
    cursor: "pointer",
    padding: "2px 4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    borderRadius: "4px",
  },
  textarea: {
    width: "100%",
    flex: 1,
    border: "none",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#1E293B",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid #E2E8F0",
  },
  btnSecondary: {
    padding: "7px 12px",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    color: "#475569",
    fontSize: "12.5px",
    fontWeight: "500",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
  btnToggle: (isListening) => ({
    padding: "7px 12px",
    background: isListening ? "#FEF3C7" : "#F1F5F9",
    border: `1px solid ${isListening ? "#FDE68A" : "#CBD5E1"}`,
    borderRadius: "8px",
    color: isListening ? "#92400E" : "#334155",
    fontSize: "12.5px",
    fontWeight: "500",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  }),
  btnPrimary: (hasContent) => ({
    padding: "7px 14px",
    background: hasContent ? "linear-gradient(180deg, #0052FF 0%, #0045D8 100%)" : "#94A3B8",
    border: "none",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: hasContent ? "pointer" : "not-allowed",
    boxShadow: hasContent ? "0 2px 6px rgba(0, 82, 255, 0.25)" : "none",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  }),
};
