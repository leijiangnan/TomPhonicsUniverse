import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { stopAudio } from "../lib/audio";

export function TemporaryRecording({ onPlay }: { onPlay: (src: string) => void }) {
  const [status, setStatus] = useState<"ready" | "requesting" | "recording" | "saved">("ready");
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const url = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current) {
        recorder.current.ondataavailable = null;
        recorder.current.onstop = null;
        recorder.current.onerror = null;
        if (recorder.current.state !== "inactive") recorder.current.stop();
      }
      stream.current?.getTracks().forEach((track) => track.stop());
      stopAudio();
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, []);

  async function start() {
    stopAudio();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("ready");
      setMessage("暂时无法录音，请检查浏览器和安全连接，或请家长帮忙。");
      return;
    }
    setStatus("requesting");
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) {
        input.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = input;
      const recording = new MediaRecorder(input);
      const chunks: Blob[] = [];
      recorder.current = recording;
      recording.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recording.onerror = () => {
        input.getTracks().forEach((track) => track.stop());
        if (timer.current) clearTimeout(timer.current);
        recording.onstop = null;
        if (active.current) {
          setStatus("ready");
          setMessage("录音没有完成，请再试一次，或请家长帮忙。");
        }
      };
      recording.onstop = () => {
        input.getTracks().forEach((track) => track.stop());
        if (timer.current) clearTimeout(timer.current);
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
      stream.current?.getTracks().forEach((track) => track.stop());
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
          <button onClick={() => recorder.current?.stop()}><Square size={20} /> 说好了</button>
        ) : (
          <button onClick={start} disabled={status === "requesting"}>
            <Mic size={20} /> {status === "requesting" ? "正在打开麦克风…" : status === "saved" ? "再说一次" : "我来说"}
          </button>
        )}
        {status === "saved" && <button onClick={() => url.current && onPlay(url.current)}><Volume2 size={20} /> 听听我说的</button>}
      </div>
      <p role="status">{status === "recording" ? "正在听，请说一句话。" : message}</p>
    </div>
  );
}
