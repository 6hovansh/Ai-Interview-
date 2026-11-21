import VapiImport from "@vapi-ai/web"
import { useCallback, useEffect, useRef, useState } from "react"
import { startVoiceInterview } from "../services/interview.api"

// @vapi-ai/web is a CommonJS package; under Vite the constructor can arrive as .default
const Vapi = VapiImport.default ?? VapiImport

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY
const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID

// Vapi can send errors as objects like { type, msg, details }; React can't render objects,
// so always turn an error into plain text before storing it in state.
function toErrorText(e, fallback = "Voice connection error. Please try again.") {
    const candidates = [e?.error?.message, e?.error?.msg, e?.error, e?.message, e?.msg, e]
    for (const c of candidates) {
        if (!c) continue
        if (typeof c === "string") return c
        if (typeof c === "object") {
            const text = typeof c.msg === "string" ? c.msg : typeof c.message === "string" ? c.message : null
            if (text) {
                const d = c.details
                return d ? `${text} — ${typeof d === "string" ? d : JSON.stringify(d)}` : text
            }
        }
    }
    try { return JSON.stringify(e) } catch { return fallback }
}

export function useVoiceInterview() {
    const vapiRef = useRef(null)
    const busyRef = useRef(false) // blocks double clicks on Start

    const [status, setStatus] = useState("idle") // idle | connecting | live | ended
    const [transcript, setTranscript] = useState([]) // [{ role, text }]
    const [liveCaption, setLiveCaption] = useState(null) // partial text while someone is talking
    const [speaking, setSpeaking] = useState(false) // true while the AI is speaking
    const [muted, setMuted] = useState(false)
    const [error, setError] = useState("")
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
        if (!PUBLIC_KEY) return

        const vapi = new Vapi(PUBLIC_KEY)
        vapiRef.current = vapi

        vapi.on("call-start", () => {
            busyRef.current = false
            setStatus("live")
        })

        vapi.on("call-end", () => {
            busyRef.current = false
            setSpeaking(false)
            setLiveCaption(null)
            setStatus("ended")
        })

        vapi.on("speech-start", () => setSpeaking(true))
        vapi.on("speech-end", () => setSpeaking(false))

        vapi.on("message", (m) => {
            if (m.type !== "transcript") return
            if (m.transcriptType === "partial") {
                setLiveCaption({ role: m.role, text: m.transcript })
            } else if (m.transcriptType === "final") {
                setLiveCaption(null)
                setTranscript((t) => [...t, { role: m.role, text: m.transcript }])
            }
        })

        vapi.on("error", (e) => {
            console.error("Vapi error:", e)
            busyRef.current = false
            setStatus((s) => (s === "live" ? s : "idle"))
            setError(toErrorText(e))
        })

        return () => {
            vapi.removeAllListeners()
            try { vapi.stop() } catch { /* no active call */ }
        }
    }, [])

    const start = useCallback(async ({ interviewReportId, level }) => {
        if (busyRef.current) return
        if (!PUBLIC_KEY || !ASSISTANT_ID) {
            setError("Missing VITE_VAPI_PUBLIC_KEY or VITE_VAPI_ASSISTANT_ID in the frontend .env")
            return
        }

        busyRef.current = true
        setError("")
        setTranscript([])
        setLiveCaption(null)
        setMuted(false)
        setStatus("connecting")

        try {
            // 1. backend creates the session and builds the interview context
            const data = await startVoiceInterview({ interviewReportId, level })
            setSessionId(data.sessionId)

            // 2. start the voice call; variableValues fill the {{placeholders}} in the assistant prompt
            await vapiRef.current.start(ASSISTANT_ID, { variableValues: data.variableValues })
        } catch (err) {
            busyRef.current = false
            setStatus("idle")
            setError(err?.response?.data?.message || toErrorText(err, "Could not start the interview."))
        }
    }, [])

    const stop = useCallback(() => {
        try { vapiRef.current?.stop() } catch { /* ignore */ }
    }, [])

    const toggleMute = useCallback(() => {
        const vapi = vapiRef.current
        if (!vapi) return
        const next = !vapi.isMuted()
        vapi.setMuted(next)
        setMuted(next)
    }, [])

    return { status, transcript, liveCaption, speaking, muted, error, sessionId, start, stop, toggleMute }
}