import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { acquireRecordingLock, stopAudio } from "../lib/audio";

export function TemporaryRecording({ onPlay, onBusyChange }: {
  onPlay: (src: string) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [status, setStatus] = useState<"ready" | "requesting" | "recording" | "saved">("ready");
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const url = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);
  const busy = useRef(false);
  const release = useRef<(() => void) | null>(null);
  const request = useRef(0);
  const busyChange = useRef(onBusyChange);
  busyChange.current = onBusyChange;

  function releaseCapture() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    release.current?.();
    release.current = null;
    if (busy.current) {
      busy.current = false;
      busyChange.current?.(false);
    }
  }

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current++;
      if (recorder.current) {
        recorder.current.ondataavailable = null;
        recorder.current.onstop = null;
        recorder.current.onerror = null;
        if (recorder.current.state !== "inactive") recorder.current.stop();
      }
      recorder.current = null;
      releaseCapture();
      stopAudio();
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, []);

  async function start() {
    // A ref closes the gap before React has disabled the button.
    if (busy.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("暂时无法录音，请检查浏览器和安全连接，或请家长帮忙。");
      return;
    }
    const unlock = acquireRecordingLock();
    if (!unlock) {
      setMessage("麦克风正在使用，请稍后再试。");
      return;
    }
    busy.current = true;
    release.current = unlock;
    busyChange.current?.(true);
    const currentRequest = ++request.current;
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setMessage("");
    setStatus("requesting");
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current || currentRequest !== request.current) {
        input.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = input;
      const recording = new MediaRecorder(input);
      const chunks: Blob[] = [];
      recorder.current = recording;
      recording.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recording.onerror = () => {
        recording.onstop = null;
        recording.ondataavailable = null;
        if (recording.state !== "inactive") recording.stop();
        recorder.current = null;
        releaseCapture();
        if (active.current) {
          setStatus("ready");
          setMessage("录音没有完成，请再试一次，或请家长帮忙。");
        }
      };
      recording.onstop = () => {
        recorder.current = null;
        releaseCapture();
        if (!active.current) return;
        const blob = new Blob(chunks, { type: recording.mimeType });
        if (!blob.size) {
          setStatus("ready");
          setMessage("没有录到声音，请再试一次。");
          return;
        }
        url.current = URL.createObjectURL(blob);
        setStatus("saved");
        setMessage("录好啦，听听自己的声音吧！");
      };
      recording.start();
      setStatus("recording");
      timer.current = setTimeout(() => {
        if (recording.state === "recording") recording.stop();
      }, 30000);
    } catch {
      if (currentRequest !== request.current) return;
      recorder.current = null;
      releaseCapture();
      if (active.current) {
        setStatus("ready");
        setMessage("无法使用麦克风，请检查权限后重试，或请家长帮忙。");
      }
    }
  }

  return (
    <div className="temporary-recording" aria-label="跟读录音">
      <div className="recording-buttons">
        {status === "recording" ? (
          <button onClick={() => { if (recorder.current?.state === "recording") recorder.current.stop(); }}><Square size={20} /> 说好了</button>
        ) : (
          <button onClick={start} disabled={status === "requesting"}>
            <Mic size={20} /> {status === "requesting" ? "正在打开麦克风…" : status === "saved" ? "再说一次" : "我来说"}
          </button>
        )}
        {status === "saved" && <button onClick={() => url.current && onPlay(url.current)}><Volume2 size={20} /> 听听我说的</button>}
      </div>
      <p role="status">{status === "recording" ? "正在听，示范已暂停。说完请点「说好了」。" : status === "requesting" ? "正在打开麦克风，示范已暂停。" : message}</p>
    </div>
  );
}
