//! media_engine — the ONLY module that shells out to ffmpeg/ffprobe.
//!
//! Every ffmpeg invocation in the app goes through the typed functions here.
//! The frontend never constructs command lines; Phase 3's AI layer will drive
//! these same functions through the same Tauri commands as the UI.

use serde::{Deserialize, Serialize};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

// ---------------------------------------------------------------- locations

#[derive(Debug, Clone)]
pub struct Ffmpeg {
    pub ffmpeg: PathBuf,
    pub ffprobe: PathBuf,
}

fn exe_name(base: &str) -> String {
    if cfg!(windows) {
        format!("{base}.exe")
    } else {
        base.to_string()
    }
}

fn find_on_path(base: &str) -> Option<PathBuf> {
    let name = exe_name(base);
    let paths = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&paths) {
        let candidate = dir.join(&name);
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

/// Platform-typical install locations, tried after PATH.
fn fallback_dirs() -> Vec<PathBuf> {
    if cfg!(target_os = "macos") {
        vec![
            PathBuf::from("/opt/homebrew/bin"),
            PathBuf::from("/usr/local/bin"),
            PathBuf::from("/usr/bin"),
        ]
    } else if cfg!(windows) {
        let mut v = vec![
            PathBuf::from(r"C:\ffmpeg\bin"),
            PathBuf::from(r"C:\Program Files\ffmpeg\bin"),
            PathBuf::from(r"C:\Program Files (x86)\ffmpeg\bin"),
        ];
        if let Some(local) = std::env::var_os("LOCALAPPDATA") {
            v.push(PathBuf::from(&local).join(r"ffmpeg\bin"));
            v.push(PathBuf::from(&local).join(r"Programs\ffmpeg\bin"));
        }
        if let Some(pd) = std::env::var_os("ProgramData") {
            v.push(PathBuf::from(pd).join(r"chocolatey\bin"));
        }
        v
    } else {
        vec![
            PathBuf::from("/usr/bin"),
            PathBuf::from("/usr/local/bin"),
            PathBuf::from("/snap/bin"),
        ]
    }
}

/// Returns the directory containing bundled ffmpeg binaries shipped with the app.
///
/// In Tauri 2, bundled resources are placed relative to the executable.
/// We look for a `ffmpeg/` subdirectory next to the running executable.
fn bundled_ffmpeg_dir() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let exe_dir = exe.parent()?;
    // Tauri 2 maps "bundler/ffmpeg/" -> "ffmpeg/" inside the installed app.
    let bundled = exe_dir.join("ffmpeg");
    if bundled.is_dir() {
        Some(bundled)
    } else {
        None
    }
}

const FFMPEG_MISSING: &str = "Couldn't find ffmpeg on this computer. \
     Please install it (for example with Homebrew: `brew install ffmpeg`) and restart the app.";

impl Ffmpeg {
    /// Locate ffmpeg + ffprobe. Search order:
    /// 1. Bundled binaries shipped with the app (resources/ffmpeg/)
    /// 2. System PATH
    /// 3. Platform-typical fallback directories
    pub fn locate() -> Result<Self, String> {
        // 1. Try bundled ffmpeg next to the executable
        let bundled = bundled_ffmpeg_dir();
        let ffmpeg = bundled
            .as_ref()
            .map(|d| d.join(exe_name("ffmpeg")))
            .filter(|p| p.is_file())
            .or_else(|| find_on_path("ffmpeg"))
            .or_else(|| {
                fallback_dirs()
                    .into_iter()
                    .map(|d| d.join(exe_name("ffmpeg")))
                    .find(|p| p.is_file())
            });
        let ffprobe = bundled
            .as_ref()
            .map(|d| d.join(exe_name("ffprobe")))
            .filter(|p| p.is_file())
            .or_else(|| find_on_path("ffprobe"))
            .or_else(|| {
                fallback_dirs()
                    .into_iter()
                    .map(|d| d.join(exe_name("ffprobe")))
                    .find(|p| p.is_file())
            });
        match (ffmpeg, ffprobe) {
            (Some(ffmpeg), Some(ffprobe)) => Ok(Self { ffmpeg, ffprobe }),
            (Some(f), None) => {
                // ffprobe usually lives next to ffmpeg
                let sibling = f.with_file_name(exe_name("ffprobe"));
                if sibling.is_file() {
                    Ok(Self {
                        ffmpeg: f,
                        ffprobe: sibling,
                    })
                } else {
                    Err(FFMPEG_MISSING.to_string())
                }
            }
            _ => Err(FFMPEG_MISSING.to_string()),
        }
    }

    // ------------------------------------------------------------ probing

    pub fn probe(&self, input: &Path) -> Result<ProbeInfo, String> {
        let out = Command::new(&self.ffprobe)
            .args([
                "-v",
                "error",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
            ])
            .arg(input)
            .output()
            .map_err(|e| format!("Could not run ffprobe: {e}"))?;
        if !out.status.success() {
            return Err(format!(
                "ffprobe could not read {}: {}",
                input.display(),
                String::from_utf8_lossy(&out.stderr).trim()
            ));
        }
        let v: serde_json::Value =
            serde_json::from_slice(&out.stdout).map_err(|e| format!("Bad ffprobe output: {e}"))?;
        let duration = v
            .pointer("/format/duration")
            .and_then(|d| d.as_str())
            .and_then(|s| s.parse::<f64>().ok());
        let mut width = None;
        let mut height = None;
        let mut has_audio = false;
        if let Some(streams) = v.get("streams").and_then(|s| s.as_array()) {
            for s in streams {
                match s.get("codec_type").and_then(|t| t.as_str()) {
                    Some("video") => {
                        // ignore attached cover-art pictures for dimensions
                        if s.pointer("/disposition/attached_pic")
                            .and_then(|x| x.as_i64())
                            != Some(1)
                        {
                            if width.is_none() {
                                width = s.get("width").and_then(|w| w.as_u64()).map(|w| w as u32);
                                height = s.get("height").and_then(|h| h.as_u64()).map(|h| h as u32);
                            }
                        }
                    }
                    Some("audio") => has_audio = true,
                    _ => {}
                }
            }
        }
        Ok(ProbeInfo {
            duration,
            width,
            height,
            has_audio,
        })
    }

    // -------------------------------------------------------- thumbnails

    /// Grab a frame at ~1s (falls back to the first frame for short clips).
    pub fn video_thumbnail(&self, input: &Path, out_jpg: &Path) -> Result<(), String> {
        let status = run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-ss", "1", "-i"])
                .arg(input)
                .args(["-frames:v", "1", "-vf", "scale=320:-2", "-q:v", "4"])
                .arg(out_jpg),
        );
        if status.is_err() {
            // very short clip: retry without the seek
            run_quiet(
                Command::new(&self.ffmpeg)
                    .args(["-y", "-i"])
                    .arg(input)
                    .args(["-frames:v", "1", "-vf", "scale=320:-2", "-q:v", "4"])
                    .arg(out_jpg),
            )?;
        }
        Ok(())
    }

    /// Scaled-down copy of an image for grid display.
    pub fn image_thumbnail(&self, input: &Path, out_jpg: &Path) -> Result<(), String> {
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args(["-frames:v", "1", "-vf", "scale=320:-2", "-q:v", "4"])
                .arg(out_jpg),
        )
    }

    /// Waveform PNG for audio files.
    pub fn waveform(&self, input: &Path, out_png: &Path) -> Result<(), String> {
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args([
                    "-filter_complex",
                    "showwavespic=s=320x120:split_channels=0:colors=0xd96f4e",
                    "-frames:v",
                    "1",
                ])
                .arg(out_png),
        )
    }

    // ---------------------------------------------------- audio cleanup

    /// Gentle voiceover cleanup: rumble filter, light denoise, silence trim,
    /// loudness normalisation. Output is AAC in .m4a.
    pub fn cleanup_audio(&self, input: &Path, out_m4a: &Path) -> Result<(), String> {
        let chain = "highpass=f=80,\
                     afftdn=nf=-25,\
                     silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25:stop_periods=-1:stop_threshold=-45dB:stop_silence=0.4,\
                     loudnorm=I=-16:TP=-1.5:LRA=11"
            .replace([' ', '\n'], "");
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args(["-af", &chain, "-c:a", "aac", "-b:a", "160k"])
                .arg(out_m4a),
        )
    }

    /// Detect and repair impulsive clicks/ticks without touching the source file.
    /// `adeclick` identifies short impulsive noise, then the normal voice cleanup
    /// chain produces a separate AAC copy for review.
    pub fn repair_audio_ticks(&self, input: &Path, out_m4a: &Path) -> Result<(), String> {
        let chain = "highpass=f=80,adeclick=t=2:w=55:o=75,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11"
            .replace([' ', '\n'], "");
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args(["-af", &chain, "-c:a", "aac", "-b:a", "160k"])
                .arg(out_m4a),
        )
    }

    // ---------------------------------------------------- proxy generation

    /// Create a 480p low-quality proxy copy for smooth preview playback.
    pub fn generate_proxy(&self, input: &Path, output: &Path) -> Result<(), String> {
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args([
                    "-vf", "scale=-2:480",
                    "-c:v", "libx264",
                    "-preset", "fast",
                    "-crf", "28",
                    "-c:a", "aac",
                    "-b:a", "128k",
                ])
                .arg(output),
        )
    }

    // ------------------------------------------------------------ export

    /// Render a whole project to `output`. `progress` receives (0.0..=1.0, stage).
    /// Set `cancel` to abort; ffmpeg is killed and an error is returned.
    pub fn export<F>(
        &self,
        opts: &ExportOptions,
        mut progress: F,
        cancel: Arc<AtomicBool>,
    ) -> Result<(), String>
    where
        F: FnMut(f32, &str),
    {
        if opts.segments.is_empty() {
            return Err("Nothing to export — add at least one clip.".into());
        }
        let check = |cancel: &Arc<AtomicBool>| -> Result<(), String> {
            if cancel.load(Ordering::SeqCst) {
                Err("Export cancelled".into())
            } else {
                Ok(())
            }
        };

        let tmp = std::env::temp_dir().join(format!("mvs-export-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        std::fs::create_dir_all(&tmp).map_err(|e| format!("Cannot create temp folder: {e}"))?;
        let result = self.export_inner(opts, &tmp, &mut progress, &check, &cancel);
        let _ = std::fs::remove_dir_all(&tmp);
        result
    }

    /// Render a v2 timeline to `output`. This keeps the v1 sequential export path
    /// intact while allowing multi-track projects to compile into one FFmpeg graph.
    pub fn export_timeline_v2<F>(
        &self,
        opts: &TimelineExportOptions,
        mut progress: F,
        cancel: Arc<AtomicBool>,
    ) -> Result<(), String>
    where
        F: FnMut(f32, &str),
    {
        let plan = TimelineExportPlan::compile(opts)?;
        let mut cmd = self.timeline_command(opts, &plan)?;
        progress(0.0, "Preparing timeline");
        self.run_with_progress(&mut cmd, plan.duration, &cancel, |frac| {
            progress(frac, "Rendering timeline");
        })?;
        progress(1.0, "Done");
        Ok(())
    }

    fn export_inner<F>(
        &self,
        opts: &ExportOptions,
        tmp: &Path,
        progress: &mut F,
        check: &dyn Fn(&Arc<AtomicBool>) -> Result<(), String>,
        cancel: &Arc<AtomicBool>,
    ) -> Result<(), String>
    where
        F: FnMut(f32, &str),
    {
        let total_dur: f64 = opts
            .segments
            .iter()
            .map(|s| s.duration())
            .sum::<f64>()
            .max(0.1);
        let mut seg_files: Vec<PathBuf> = Vec::new();
        let mut done_dur = 0.0;

        // Step 1 — normalise every clip to the same canvas/codec (0% → 90%)
        for (i, seg) in opts.segments.iter().enumerate() {
            check(cancel)?;
            let seg_path = tmp.join(format!("seg-{i:03}.mp4"));
            let seg_dur = seg.duration();
            let mut cmd = self.segment_command(seg, opts, &seg_path)?;
            let seg_dur_c = seg_dur;
            let done_c = done_dur;
            self.run_with_progress(&mut cmd, seg_dur, cancel, |frac| {
                let overall = 0.9 * (done_c + f64::from(frac) * seg_dur_c) / total_dur;
                progress(overall.min(0.9) as f32, "Preparing clips");
            })?;
            seg_files.push(seg_path);
            done_dur += seg_dur;
        }

        // Step 2 — concat (same codec everywhere → stream copy) (90% → 94%)
        progress(0.9, "Joining clips");
        check(cancel)?;
        let list_path = tmp.join("concat.txt");
        let list = seg_files
            .iter()
            .map(|p| format!("file '{}'", p.display().to_string().replace('\'', "'\\''")))
            .collect::<Vec<_>>()
            .join("\n");
        std::fs::write(&list_path, list).map_err(|e| format!("Cannot write concat list: {e}"))?;
        let joined = tmp.join("joined.mp4");
        let copy_ok = run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-f", "concat", "-safe", "0", "-i"])
                .arg(&list_path)
                .args(["-c", "copy"])
                .arg(&joined),
        );
        if copy_ok.is_err() {
            // Fallback: re-encode the join (slower but robust)
            run_quiet(
                Command::new(&self.ffmpeg)
                    .args(["-y", "-f", "concat", "-safe", "0", "-i"])
                    .arg(&list_path)
                    .args([
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-c:a", "aac",
                        "-ar", "44100", "-ac", "2",
                    ])
                    .arg(&joined),
            )?;
        }

        // Step 3 — audio finishing + final container (94% → 100%)
        progress(0.94, "Mixing audio");
        check(cancel)?;
        let mut cmd = Command::new(&self.ffmpeg);
        cmd.arg("-y").arg("-i").arg(&joined);
        match (&opts.voiceover, opts.keep_original_audio) {
            (Some(vo), true) => {
                cmd.arg("-i").arg(vo).args([
                    "-filter_complex",
                    "[0:a]volume=0.35[a0];[1:a]loudnorm[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=3[outa]",
                    "-map", "0:v", "-map", "[outa]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                ]);
            }
            (Some(vo), false) => {
                let joined_dur = self.probe(&joined).ok().and_then(|p| p.duration);
                cmd.arg("-i")
                    .arg(vo)
                    .args(["-af", "loudnorm", "-map", "0:v", "-map", "1:a"]);
                if let Some(d) = joined_dur {
                    cmd.args(["-t", &format!("{d:.3}")]);
                }
                cmd.args(["-c:v", "copy", "-c:a", "aac", "-b:a", "160k"]);
            }
            (None, true) => {
                cmd.args(["-c", "copy"]);
            }
            (None, false) => {
                cmd.args(["-map", "0:v", "-an", "-c:v", "copy"]);
            }
        }
        cmd.arg(&opts.output);
        let mut final_cmd = cmd;
        self.run_with_progress(&mut final_cmd, total_dur, cancel, |frac| {
            progress(0.94 + 0.06 * frac, "Finishing up");
        })?;

        progress(1.0, "Done");
        Ok(())
    }

    /// Build the ffmpeg command that renders one normalised segment.
    fn segment_command(
        &self,
        seg: &ExportSegment,
        opts: &ExportOptions,
        out: &Path,
    ) -> Result<Command, String> {
        let (w, h) = (opts.width, opts.height);
        let vf = format!(
            "scale={w}:{h}:force_original_aspect_ratio=decrease,\
             pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p"
        );
        let mut cmd = Command::new(&self.ffmpeg);
        cmd.arg("-y");

        match seg {
            ExportSegment::Video {
                input,
                trim_start,
                trim_end,
                has_audio,
            } => {
                let dur = (trim_end - trim_start).max(0.1);
                cmd.args(["-ss", &format!("{trim_start:.3}")])
                    .arg("-i")
                    .arg(input)
                    .args(["-t", &format!("{dur:.3}")]);
                if *has_audio && opts.keep_original_audio {
                    cmd.args(["-map", "0:v:0", "-map", "0:a:0?"]);
                } else {
                    cmd.args([
                        "-f",
                        "lavfi",
                        "-t",
                        &format!("{dur:.3}"),
                        "-i",
                        "anullsrc=r=44100:cl=stereo",
                    ])
                    .args(["-map", "0:v:0", "-map", "1:a:0", "-shortest"]);
                }
            }
            ExportSegment::Still { input, duration } => {
                let dur = duration.max(0.1);
                cmd.args(["-loop", "1", "-t", &format!("{dur:.3}")])
                    .arg("-i")
                    .arg(input)
                    .args([
                        "-f",
                        "lavfi",
                        "-t",
                        &format!("{dur:.3}"),
                        "-i",
                        "anullsrc=r=44100:cl=stereo",
                    ])
                    .args(["-map", "0:v:0", "-map", "1:a:0", "-shortest"]);
            }
            ExportSegment::AudioOnly {
                input,
                trim_start,
                trim_end,
            } => {
                // Black canvas with the (trimmed) audio — lets audio clips join a sequence.
                let dur = (trim_end - trim_start).max(0.1);
                cmd.args([
                    "-f",
                    "lavfi",
                    "-t",
                    &format!("{dur:.3}"),
                    "-i",
                    &format!("color=black:s={w}x{h}:r=30"),
                ])
                .args(["-ss", &format!("{trim_start:.3}")])
                .arg("-i")
                .arg(input)
                .args(["-map", "0:v:0", "-map", "1:a:0", "-shortest"]);
            }
        }

        cmd.args([
            "-vf",
            &vf,
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            &opts.crf.to_string(),
            "-c:a",
            "aac",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-movflags",
            "+faststart",
        ]);
        cmd.arg(out);
        Ok(cmd)
    }

    fn timeline_command(
        &self,
        opts: &TimelineExportOptions,
        plan: &TimelineExportPlan,
    ) -> Result<Command, String> {
        let mut cmd = Command::new(&self.ffmpeg);
        cmd.arg("-y");
        cmd.args([
            "-f",
            "lavfi",
            "-t",
            &format!("{:.3}", plan.duration),
            "-i",
            &format!("color=black:s={}x{}:r=30", opts.width, opts.height),
        ]);

        for clip in &opts.clips {
            if clip.media_kind == TimelineMediaKind::Image {
                cmd.args(["-loop", "1", "-t", &format!("{:.3}", clip.duration)]);
            }
            cmd.arg("-i").arg(&clip.input);
        }

        if plan.has_audio {
            cmd.args([
                "-filter_complex",
                &plan.filter_complex,
                "-map",
                &plan.video_label,
                "-map",
                &plan.audio_label,
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                &opts.crf.to_string(),
                "-c:a",
                "aac",
                "-ar",
                "44100",
                "-ac",
                "2",
                "-t",
                &format!("{:.3}", plan.duration),
                "-movflags",
                "+faststart",
            ]);
        } else {
            cmd.args([
                "-filter_complex",
                &plan.filter_complex,
                "-map",
                &plan.video_label,
                "-an",
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                &opts.crf.to_string(),
                "-t",
                &format!("{:.3}", plan.duration),
                "-movflags",
                "+faststart",
            ]);
        }
        cmd.arg(&opts.output);
        Ok(cmd)
    }

    /// Run ffmpeg with `-progress pipe:1`, calling `on_frac(0..1)` from
    /// `out_time_us` / `expected_secs`. Kills the process if `cancel` flips.
    fn run_with_progress<F>(
        &self,
        cmd: &mut Command,
        expected_secs: f64,
        cancel: &Arc<AtomicBool>,
        mut on_frac: F,
    ) -> Result<(), String>
    where
        F: FnMut(f32),
    {
        use std::io::{BufRead, BufReader};
        cmd.args(["-progress", "pipe:1", "-nostats"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        let mut child = cmd
            .spawn()
            .map_err(|e| format!("Could not start ffmpeg: {e}"))?;
        let stdout = child.stdout.take().expect("piped stdout");
        // Drain stderr on a separate thread so a full pipe can never block ffmpeg.
        let stderr_handle = child.stderr.take().map(|mut s| {
            std::thread::spawn(move || {
                use std::io::Read;
                let mut buf = String::new();
                let _ = s.read_to_string(&mut buf);
                buf
            })
        });
        let reader = BufReader::new(stdout);
        let expected = expected_secs.max(0.05);
        let mut killed = false;
        for line in reader.lines() {
            if cancel.load(Ordering::SeqCst) {
                let _ = child.kill();
                killed = true;
                break;
            }
            let line = match line {
                Ok(l) => l,
                Err(_) => break,
            };
            if let Some(us) = line
                .strip_prefix("out_time_us=")
                .or_else(|| line.strip_prefix("out_time_ms="))
                .and_then(|s| s.trim().parse::<f64>().ok())
            {
                // out_time_ms is actually microseconds in ffmpeg's progress output
                on_frac(((us / 1_000_000.0) / expected).clamp(0.0, 1.0) as f32);
            }
        }
        let status = child.wait().map_err(|e| e.to_string())?;
        let stderr = stderr_handle
            .and_then(|h| h.join().ok())
            .unwrap_or_default();
        if killed {
            return Err("Export cancelled".into());
        }
        if !status.success() {
            let tail: String = stderr.lines().rev().take(4).collect::<Vec<_>>().join(" | ");
            return Err(format!(
                "ffmpeg failed{}",
                if tail.is_empty() {
                    String::new()
                } else {
                    format!(": {tail}")
                }
            ));
        }
        Ok(())
    }

    // --------------------------------------------------- audio editing ops

    /// Generate normalised peak sample data for frontend waveform rendering.
    /// Converts to raw PCM f32 at 8 kHz mono, then downsamples to `samples` peaks.
    pub fn waveform_data(&self, input: &Path, samples: usize) -> Result<Vec<f32>, String> {
        let mut child = Command::new(&self.ffmpeg)
            .args(["-i"])
            .arg(input)
            .args(["-af", "aresample=8000", "-f", "f32le", "-ac", "1", "-"])
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Could not start ffmpeg for waveform data: {e}"))?;

        let mut stdout = child.stdout.take().expect("piped stdout");
        let mut raw_bytes: Vec<u8> = Vec::new();
        stdout
            .read_to_end(&mut raw_bytes)
            .map_err(|e| format!("Could not read ffmpeg waveform output: {e}"))?;
        let _ = child.wait();

        if raw_bytes.is_empty() {
            return Err("ffmpeg produced no waveform data.".into());
        }

        // Interpret as little-endian f32 samples
        let sample_count = raw_bytes.len() / 4;
        let pcm: Vec<f32> = raw_bytes
            .chunks_exact(4)
            .map(|chunk| f32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]))
            .collect();

        let target = samples.max(1);
        if sample_count <= target {
            // Already fewer samples than requested — just return abs values
            return Ok(pcm.iter().map(|s| s.abs()).collect());
        }

        // Downsample: take the peak (max abs) in each window
        let window = sample_count / target;
        let mut peaks = Vec::with_capacity(target);
        for i in 0..target {
            let start = i * window;
            let end = if i + 1 == target {
                sample_count
            } else {
                (i + 1) * window
            };
            let peak = pcm[start..end]
                .iter()
                .map(|s| s.abs())
                .fold(0.0f32, f32::max);
            peaks.push(peak);
        }
        Ok(peaks)
    }

    /// Trim a time range to a new AAC file.
    pub fn extract_region(
        &self,
        input: &Path,
        start: f64,
        end: f64,
        output: &Path,
    ) -> Result<(), String> {
        let duration = (end - start).max(0.01);
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-ss", &format!("{start:.3}")])
                .arg("-i")
                .arg(input)
                .args([
                    "-t",
                    &format!("{duration:.3}"),
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                ])
                .arg(output),
        )
    }

    /// Remove a region and join the remainder (non-destructive).
    pub fn cut_region(
        &self,
        input: &Path,
        start: f64,
        end: f64,
        output: &Path,
    ) -> Result<(), String> {
        let tmp = std::env::temp_dir().join(format!("mvs-cut-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        std::fs::create_dir_all(&tmp)
            .map_err(|e| format!("Cannot create temp folder for cut: {e}"))?;

        let result = (|| -> Result<(), String> {
            let total_dur = self
                .probe(input)
                .ok()
                .and_then(|p| p.duration)
                .unwrap_or(0.0);

            let part_a = tmp.join("part_a.m4a");
            let part_b = tmp.join("part_b.m4a");

            // Extract [0..start]
            if start > 0.01 {
                run_quiet(
                    Command::new(&self.ffmpeg)
                        .args(["-y", "-ss", "0", "-i"])
                        .arg(input)
                        .args([
                            "-t",
                            &format!("{:.3}", start),
                            "-c:a",
                            "aac",
                            "-b:a",
                            "160k",
                        ])
                        .arg(&part_a),
                )?;
            }

            // Extract [end..total_dur]
            if end < total_dur - 0.01 {
                let remaining = (total_dur - end).max(0.01);
                run_quiet(
                    Command::new(&self.ffmpeg)
                        .args(["-y", "-ss", &format!("{:.3}", end), "-i"])
                        .arg(input)
                        .args([
                            "-t",
                            &format!("{:.3}", remaining),
                            "-c:a",
                            "aac",
                            "-b:a",
                            "160k",
                        ])
                        .arg(&part_b),
                )?;
            }

            // Concat the parts
            let mut parts = Vec::new();
            if part_a.is_file() {
                parts.push(part_a.clone());
            }
            if part_b.is_file() {
                parts.push(part_b.clone());
            }
            if parts.is_empty() {
                return Err("Cut operation removed the entire audio.".into());
            }
            if parts.len() == 1 {
                std::fs::copy(&parts[0], output)
                    .map_err(|e| format!("Could not write output: {e}"))?;
                return Ok(());
            }

            let list_path = tmp.join("concat.txt");
            let list = parts
                .iter()
                .map(|p| format!("file '{}'", p.display().to_string().replace('\'', "'\\''")))
                .collect::<Vec<_>>()
                .join("\n");
            std::fs::write(&list_path, list)
                .map_err(|e| format!("Cannot write concat list: {e}"))?;

            run_quiet(
                Command::new(&self.ffmpeg)
                    .args(["-y", "-f", "concat", "-safe", "0", "-i"])
                    .arg(&list_path)
                    .args(["-c", "copy"])
                    .arg(output),
            )
        })();

        let _ = std::fs::remove_dir_all(&tmp);
        result
    }

    /// Replace a region with silence (non-destructive).
    pub fn silence_region(
        &self,
        input: &Path,
        start: f64,
        end: f64,
        output: &Path,
    ) -> Result<(), String> {
        // Use volume=0 to mute the region while preserving the rest
        let filter = format!(
            "volume=enable='between(t,{start:.3},{end:.3})':volume=0"
        );
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args([
                    "-af",
                    &filter,
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                ])
                .arg(output),
        )
    }

    /// Apply fade in or fade out.
    pub fn fade_audio(
        &self,
        input: &Path,
        start: f64,
        duration: f64,
        fade_in: bool,
        output: &Path,
    ) -> Result<(), String> {
        let fade_type = if fade_in { "in" } else { "out" };
        let filter = format!(
            "afade=t={fade_type}:ss={start:.3}:d={duration:.3}"
        );
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args(["-af", &filter, "-c:a", "aac", "-b:a", "160k"])
                .arg(output),
        )
    }

    /// Loudness normalisation (EBU R128, same parameters as the cleanup chain).
    pub fn normalize_audio(&self, input: &Path, output: &Path) -> Result<(), String> {
        run_quiet(
            Command::new(&self.ffmpeg)
                .args(["-y", "-i"])
                .arg(input)
                .args([
                    "-af",
                    "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                ])
                .arg(output),
        )
    }

    /// Detect silent stretches using ffmpeg's `silencedetect` filter.
    /// Returns a list of (start, end) time pairs in seconds.
    pub fn detect_silence(
        &self,
        input: &Path,
        threshold_db: f64,
        min_duration: f64,
    ) -> Result<Vec<(f64, f64)>, String> {
        let filter = format!(
            "silencedetect=noise={threshold_db}dB:d={min_duration:.3}"
        );
        let out = Command::new(&self.ffmpeg)
            .args(["-i"])
            .arg(input)
            .args(["-af", &filter, "-f", "null", "-"])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| format!("Could not run ffmpeg for silence detection: {e}"))?;

        let stderr = String::from_utf8_lossy(&out.stderr);
        let mut regions: Vec<(f64, f64)> = Vec::new();
        let mut current_start: Option<f64> = None;

        for line in stderr.lines() {
            if let Some(pos) = line.find("silence_start:") {
                let val_str = &line[pos + "silence_start:".len()..];
                if let Ok(val) = val_str.trim().split_whitespace().next().unwrap_or("").parse::<f64>() {
                    current_start = Some(val);
                }
            }
            if let Some(pos) = line.find("silence_end:") {
                let val_str = &line[pos + "silence_end:".len()..];
                if let Ok(val) = val_str.trim().split_whitespace().next().unwrap_or("").parse::<f64>() {
                    if let Some(s) = current_start.take() {
                        regions.push((s, val));
                    }
                }
            }
        }

        // If a silence_start was found but no matching end, it extends to EOF
        if let Some(s) = current_start {
            let total = self.probe(input).ok().and_then(|p| p.duration).unwrap_or(s);
            regions.push((s, total));
        }

        Ok(regions)
    }
}

// ------------------------------------------------------------------ types

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbeInfo {
    pub duration: Option<f64>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub has_audio: bool,
}

#[derive(Debug, Clone)]
pub enum ExportSegment {
    Video {
        input: PathBuf,
        trim_start: f64,
        trim_end: f64,
        has_audio: bool,
    },
    Still {
        input: PathBuf,
        duration: f64,
    },
    AudioOnly {
        input: PathBuf,
        trim_start: f64,
        trim_end: f64,
    },
}

impl ExportSegment {
    pub fn duration(&self) -> f64 {
        match self {
            ExportSegment::Video {
                trim_start,
                trim_end,
                ..
            } => (trim_end - trim_start).max(0.1),
            ExportSegment::Still { duration, .. } => duration.max(0.1),
            ExportSegment::AudioOnly {
                trim_start,
                trim_end,
                ..
            } => (trim_end - trim_start).max(0.1),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ExportOptions {
    pub segments: Vec<ExportSegment>,
    pub voiceover: Option<PathBuf>,
    pub keep_original_audio: bool,
    pub width: u32,
    pub height: u32,
    pub crf: u32,
    pub output: PathBuf,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimelineTrackKind {
    Video,
    Audio,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimelineMediaKind {
    Video,
    Image,
    Audio,
}

#[derive(Debug, Clone)]
pub struct TimelineExportClip {
    pub input: PathBuf,
    pub track_kind: TimelineTrackKind,
    pub media_kind: TimelineMediaKind,
    pub start: f64,
    pub trim_start: f64,
    pub duration: f64,
    pub has_audio: bool,
    pub volume: f64,
    pub muted: bool,
}

#[derive(Debug, Clone)]
pub struct TimelineExportOptions {
    pub clips: Vec<TimelineExportClip>,
    pub keep_original_audio: bool,
    pub width: u32,
    pub height: u32,
    pub crf: u32,
    pub output: PathBuf,
}

#[derive(Debug, Clone)]
pub struct TimelineExportPlan {
    pub duration: f64,
    pub filter_complex: String,
    pub video_label: String,
    pub audio_label: String,
    pub has_audio: bool,
}

impl TimelineExportPlan {
    pub fn compile(opts: &TimelineExportOptions) -> Result<Self, String> {
        if opts.clips.is_empty() {
            return Err("Add at least one clip before exporting.".into());
        }
        let duration = opts
            .clips
            .iter()
            .map(|clip| clip.start.max(0.0) + clip.duration.max(0.1))
            .fold(0.0, f64::max)
            .max(0.1);
        let mut filters = vec![format!(
            "[0:v]trim=duration={duration:.3},setpts=PTS-STARTPTS,format=yuv420p[base]"
        )];
        let mut current_video = "base".to_string();
        let mut audio_labels = Vec::new();

        for (idx, clip) in opts.clips.iter().enumerate() {
            let input_idx = idx + 1;
            let clip_duration = clip.duration.max(0.1);
            let start = clip.start.max(0.0);
            let trim_start = clip.trim_start.max(0.0);
            match (clip.track_kind, clip.media_kind) {
                (TimelineTrackKind::Video, TimelineMediaKind::Video)
                | (TimelineTrackKind::Video, TimelineMediaKind::Image) => {
                    let visual = format!("v{idx}");
                    filters.push(format!(
                        "[{input_idx}:v]trim=start={trim_start:.3}:duration={clip_duration:.3},\
                         setpts=PTS-STARTPTS,\
                         scale={}:{}:force_original_aspect_ratio=decrease,\
                         pad={}:{}:(ow-iw)/2:(oh-ih)/2,\
                         setsar=1,fps=30,format=yuv420p,setpts=PTS+{start:.3}/TB[{visual}]",
                        opts.width, opts.height, opts.width, opts.height
                    ));
                    let next_video = format!("ov{idx}");
                    filters.push(format!(
                        "[{current_video}][{visual}]overlay=shortest=0:eof_action=pass:enable='between(t,{start:.3},{:.3})'[{next_video}]",
                        start + clip_duration
                    ));
                    current_video = next_video;

                    if opts.keep_original_audio
                        && clip.media_kind == TimelineMediaKind::Video
                        && clip.has_audio
                        && !clip.muted
                    {
                        let audio = format!("a{idx}");
                        filters.push(audio_filter(
                            input_idx,
                            idx,
                            trim_start,
                            clip_duration,
                            start,
                            clip.volume,
                        ));
                        audio_labels.push(audio);
                    }
                }
                (TimelineTrackKind::Audio, TimelineMediaKind::Audio)
                | (TimelineTrackKind::Audio, TimelineMediaKind::Video) => {
                    if !clip.muted {
                        let audio = format!("a{idx}");
                        filters.push(audio_filter(
                            input_idx,
                            idx,
                            trim_start,
                            clip_duration,
                            start,
                            clip.volume,
                        ));
                        audio_labels.push(audio);
                    }
                }
                (TimelineTrackKind::Audio, TimelineMediaKind::Image) => {}
                (TimelineTrackKind::Video, TimelineMediaKind::Audio) => {
                    if !clip.muted {
                        let audio = format!("a{idx}");
                        filters.push(audio_filter(
                            input_idx,
                            idx,
                            trim_start,
                            clip_duration,
                            start,
                            clip.volume,
                        ));
                        audio_labels.push(audio);
                    }
                }
            }
        }

        let (audio_label, has_audio) = if audio_labels.is_empty() {
            (String::new(), false)
        } else if audio_labels.len() == 1 {
            (format!("[{}]", audio_labels[0]), true)
        } else {
            let label = "amixout";
            filters.push(format!(
                "{}amix=inputs={}:duration=longest:dropout_transition=2:normalize=0[{label}]",
                audio_labels
                    .iter()
                    .map(|label| format!("[{label}]"))
                    .collect::<String>(),
                audio_labels.len()
            ));
            (format!("[{label}]"), true)
        };

        Ok(Self {
            duration,
            filter_complex: filters.join(";"),
            video_label: format!("[{current_video}]"),
            audio_label,
            has_audio,
        })
    }
}

fn audio_filter(
    input_idx: usize,
    clip_idx: usize,
    trim_start: f64,
    duration: f64,
    start: f64,
    volume: f64,
) -> String {
    let delay_ms = (start.max(0.0) * 1000.0).round() as u64;
    format!(
        "[{input_idx}:a]atrim=start={trim_start:.3}:duration={duration:.3},\
         asetpts=PTS-STARTPTS,volume={:.3},adelay={delay_ms}:all=1[a{clip_idx}]",
        volume.max(0.0)
    )
}

// ---------------------------------------------------------------- helpers

/// Run ffmpeg quietly; Ok on success, Err with stderr tail otherwise.
fn run_quiet(cmd: &mut Command) -> Result<(), String> {
    let out = cmd
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Could not run ffmpeg: {e}"))?;
    if out.status.success() {
        Ok(())
    } else {
        let tail: String = String::from_utf8_lossy(&out.stderr)
            .lines()
            .rev()
            .take(4)
            .collect::<Vec<_>>()
            .join(" | ");
        Err(format!("ffmpeg failed: {tail}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn clip(
        track_kind: TimelineTrackKind,
        media_kind: TimelineMediaKind,
        start: f64,
        duration: f64,
    ) -> TimelineExportClip {
        TimelineExportClip {
            input: PathBuf::from("/tmp/input.mp4"),
            track_kind,
            media_kind,
            start,
            trim_start: 0.25,
            duration,
            has_audio: media_kind == TimelineMediaKind::Video,
            volume: 0.75,
            muted: false,
        }
    }

    #[test]
    fn compiles_visual_tracks_into_overlay_graph() {
        let opts = TimelineExportOptions {
            clips: vec![clip(
                TimelineTrackKind::Video,
                TimelineMediaKind::Video,
                2.0,
                4.0,
            )],
            keep_original_audio: false,
            width: 1920,
            height: 1080,
            crf: 18,
            output: PathBuf::from("/tmp/out.mp4"),
        };

        let plan = TimelineExportPlan::compile(&opts).unwrap();

        assert_eq!(plan.duration, 6.0);
        assert_eq!(plan.video_label, "[ov0]");
        assert!(!plan.has_audio);
        assert!(plan.filter_complex.contains("scale=1920:1080"));
        assert!(plan
            .filter_complex
            .contains("overlay=shortest=0:eof_action=pass:enable='between(t,2.000,6.000)'"));
    }

    #[test]
    fn compiles_audio_tracks_into_delayed_mix_graph() {
        let opts = TimelineExportOptions {
            clips: vec![
                clip(TimelineTrackKind::Audio, TimelineMediaKind::Audio, 1.5, 3.0),
                clip(TimelineTrackKind::Audio, TimelineMediaKind::Audio, 4.0, 2.0),
            ],
            keep_original_audio: true,
            width: 1280,
            height: 720,
            crf: 28,
            output: PathBuf::from("/tmp/out.mp4"),
        };

        let plan = TimelineExportPlan::compile(&opts).unwrap();

        assert_eq!(plan.duration, 6.0);
        assert!(plan.has_audio);
        assert_eq!(plan.audio_label, "[amixout]");
        assert!(plan.filter_complex.contains("adelay=1500:all=1[a0]"));
        assert!(plan.filter_complex.contains("adelay=4000:all=1[a1]"));
        assert!(plan.filter_complex.contains("amix=inputs=2"));
    }
}
