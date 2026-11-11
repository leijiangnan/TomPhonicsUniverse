import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";

export function SoundPanel({ muted, musicAllowed, musicIntent, musicPlaying, musicLoading, musicError, onToggleSound, onToggleMusic }: {
  muted: boolean;
  musicAllowed: boolean;
  musicIntent: boolean;
  musicPlaying: boolean;
  musicLoading: boolean;
  musicError: string;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}) {
  const status = musicError || (muted && musicIntent
    ? "声音已关闭，开启声音后继续。"
    : !musicAllowed
      ? "上课时音乐暂停，回到地图后可以听。"
      : musicPlaying ? "正在轻轻播放。"
        : musicLoading ? "正在准备音乐。"
        : musicIntent ? "已暂停，示范结束后继续。" : "还没有播放，点下面的按钮听一听。"
  );
  return <div className="sound-panel">
    <section className="sound-section" aria-label="声音开关">
      <div className="sound-section-heading">
        {muted ? <VolumeX size={30} aria-hidden="true" /> : <Volume2 size={30} aria-hidden="true" />}
        <div><h3>{muted ? "声音已关闭" : "声音已开启"}</h3><p>点字母、图片或句子，听对应的示范。</p></div>
      </div>
      <button className="button secondary full" aria-pressed={!muted} onClick={onToggleSound}>
        {muted ? <Volume2 size={22} /> : <VolumeX size={22} />}{muted ? "开启声音" : "关闭声音"}
      </button>
    </section>
    <section className="sound-section music-section" aria-label="背景音乐">
      <div className="sound-section-heading"><Music2 size={30} aria-hidden="true" /><div><h3>宇宙轻音乐</h3><p>原创无歌词音乐，陪你看看星球。</p></div></div>
      <p className="music-status" role={musicError ? "alert" : "status"}>{status}</p>
      <button className="button primary full" disabled={!musicAllowed && !musicIntent} aria-pressed={musicIntent} aria-busy={musicLoading} onClick={onToggleMusic}>
        {musicIntent && !musicError ? <Pause size={22} /> : <Play size={22} />}
        {musicError ? "重试播放音乐" : musicIntent ? "暂停背景音乐" : !musicAllowed ? "回到地图后可播放" : muted ? "开启声音并播放音乐" : "播放背景音乐"}
      </button>
      <p className="sound-note">音乐默认关闭。上课、录音和切到后台时暂停，点读示范会优先播放。</p>
    </section>
    <p className="sound-note">音量可在「家长」面板或设备音量键中调整。</p>
  </div>;
}
