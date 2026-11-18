"""ปรับเสียงหลังสร้าง: pitch (ครึ่งเสียง) + tempo (ความเร็ว) ด้วย ffmpeg — ใช้ทำเสียงเด็ก/คนแก่จากเสียงผู้ใหญ่"""
import pathlib, subprocess


def apply(path: pathlib.Path, pitch: float = 0.0, tempo: float = 1.0) -> pathlib.Path:
    if not pitch and abs(tempo - 1.0) < 1e-3:
        return path
    r = 2 ** (pitch / 12.0)
    at = tempo / r
    chain = []
    while at > 2.0: chain.append("atempo=2.0"); at /= 2.0
    while at < 0.5: chain.append("atempo=0.5"); at /= 0.5
    chain.append(f"atempo={at:.5f}")
    af = f"asetrate={44100 * r:.1f},aresample=44100," + ",".join(chain)
    tmp = path.with_name(path.stem + "_fx.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-af", af, "-b:a", "160k", str(tmp)], check=True)
    tmp.replace(path)
    return path
