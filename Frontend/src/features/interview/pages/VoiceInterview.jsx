import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { useVoiceInterview } from "../hooks/useVoiceInterview"
import "../style/VoiceInterview.scss"

const LEVELS = [
    { value: "intern", label: "Intern" },
    { value: "junior", label: "Junior" },
    { value: "mid", label: "Mid-level" },
]

const MicIcon = () => (
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
)

const StopIcon = () => (
    <svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
)

export default function VoiceInterview() {
    const { interviewId } = useParams() // route: /interview/:interviewId/voice
    const [level, setLevel] = useState("junior")
    const { status, transcript, liveCaption, speaking, muted, error, start, stop, toggleMute } = useVoiceInterview()
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [transcript, liveCaption])

    const connecting = status === "connecting"
    const live = status === "live"
    const inCall = connecting || live

    // one value drives the button color, ring animation and status text
    const orbState =
        connecting ? "connecting" :
        live ? (speaking ? "speaking" : muted ? "muted" : "listening") :
        "idle"

    const statusText = {
        idle: status === "ended" ? "Interview ended" : "Ready when you are",
        connecting: "Connecting…",
        speaking: "Interviewer is speaking",
        listening: "Listening — answer out loud",
        muted: "Mic muted",
    }[orbState]

    const handleTalk = () => {
        if (connecting) return
        if (live) stop()
        else start({ interviewReportId: interviewId, level })
    }

    const buttonLabel = live ? "End interview" : connecting ? "Connecting" : "Start interview"
    const hint = live ? "Tap to end the interview" : connecting ? "Setting things up…" : status === "ended" ? "Tap to start again" : "Tap to start"

    const who = (role) => (role === "assistant" ? "Interviewer" : "You")

    return (
        <main className="vi-page">
            <header className="vi-header">
                <h1>Voice Interview</h1>
                <span className={`vi-status vi-status--${orbState}`} aria-live="polite">
                    <span className="vi-dot" />
                    {statusText}
                </span>
            </header>

            {!inCall && (
                <div className="vi-levels" role="radiogroup" aria-label="Interview level">
                    {LEVELS.map((l) => (
                        <button
                            key={l.value}
                            type="button"
                            role="radio"
                            aria-checked={level === l.value}
                            className={`vi-chip ${level === l.value ? "is-active" : ""}`}
                            onClick={() => setLevel(l.value)}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            )}

            <section className="vi-stage">
                <button
                    type="button"
                    className={`talk-btn talk-btn--${orbState} ${live ? "is-live" : ""}`}
                    onClick={handleTalk}
                    disabled={connecting}
                    aria-label={buttonLabel}
                >
                    <span className="ring ring-1" />
                    <span className="ring ring-2" />
                    {connecting ? <span className="spinner" /> : live ? <StopIcon /> : <MicIcon />}
                </button>

                <p className="vi-hint">{hint}</p>

                {live && (
                    <button type="button" className="vi-mute" onClick={toggleMute}>
                        {muted ? "Unmute mic" : "Mute mic"}
                    </button>
                )}
            </section>

            {error && <p className="vi-error" role="alert">{error}</p>}

            <section className="vi-chat" aria-label="Interview transcript">
                {transcript.length === 0 && !liveCaption && (
                    <p className="vi-empty">
                        Your conversation will appear here. Use headphones so the interviewer doesn't hear itself.
                    </p>
                )}

                {transcript.map((line, i) => (
                    <div key={i} className={`vi-msg vi-msg--${line.role === "assistant" ? "ai" : "me"}`}>
                        <span className="vi-who">{who(line.role)}</span>
                        <p>{line.text}</p>
                    </div>
                ))}

                {liveCaption && (
                    <div className={`vi-msg vi-msg--${liveCaption.role === "assistant" ? "ai" : "me"} is-partial`}>
                        <span className="vi-who">{who(liveCaption.role)}</span>
                        <p>{liveCaption.text}…</p>
                    </div>
                )}

                <div ref={chatEndRef} />
            </section>

            {status === "ended" && (
                <p className="vi-footer">
                    Interview complete. <Link to={`/interview/${interviewId}`}>Back to your report</Link>
                </p>
            )}
        </main>
    )
}
