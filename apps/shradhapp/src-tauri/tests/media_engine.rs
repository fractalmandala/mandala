//! Integration test: exercises media_engine against the real ffmpeg on this
//! machine. Generates fixtures with ffmpeg itself, then runs thumbnail,
//! waveform, cleanup, and a full concat-export, asserting outputs exist and
//! ffprobe reports sane durations.
//!
//! Run: cargo test --test media_engine -- --nocapture

use mom_video_studio_lib::media_engine::{
    ExportOptions, ExportSegment, Ffmpeg, TimelineExportClip, TimelineExportOptions,
    TimelineMediaKind, TimelineTrackKind,
};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

fn assert_duration(eng: &Ffmpeg, path: &Path, lo: f64, hi: f64, what: &str) -> f64 {
    let info = eng
        .probe(path)
        .unwrap_or_else(|e| panic!("probe {what}: {e}"));
    let d = info
        .duration
        .unwrap_or_else(|| panic!("{what}: ffprobe reported no duration"));
    assert!(
        (lo..=hi).contains(&d),
        "{what}: duration {d:.2}s not in expected range {lo}..={hi}"
    );
    println!("  ✓ {what}: {d:.2}s (expected {lo}..={hi})");
    d
}

#[test]
fn full_media_engine_pipeline() {
    let eng = Ffmpeg::locate()
        .expect("ffmpeg/ffprobe not found on this machine — install ffmpeg to run this test");
    println!("ffmpeg: {}", eng.ffmpeg.display());
    println!("ffprobe: {}", eng.ffprobe.display());

    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    let vid = dir.join("clip.mp4");
    let tone = dir.join("tone.wav");
    let img = dir.join("still.png");

    // --- fixtures: 2s video (testsrc + sine), 2s tone, still image ---
    let status = Command::new(&eng.ffmpeg)
        .args([
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc=size=320x240:rate=30",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440:sample_rate=44100",
            "-t",
            "2",
            "-pix_fmt",
            "yuv420p",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-shortest",
        ])
        .arg(&vid)
        .status()
        .unwrap();
    assert!(status.success());
    let status = Command::new(&eng.ffmpeg)
        .args([
            "-y",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=880:sample_rate=44100",
            "-t",
            "2",
        ])
        .arg(&tone)
        .status()
        .unwrap();
    assert!(status.success());
    let status = Command::new(&eng.ffmpeg)
        .args([
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=red:s=640x480",
            "-frames:v",
            "1",
        ])
        .arg(&img)
        .status()
        .unwrap();
    assert!(status.success());
    println!("✓ fixtures generated");

    // --- probe ---
    let info = eng.probe(&vid).expect("probe video");
    assert!(info.has_audio, "test video should have an audio stream");
    assert_eq!(info.width, Some(320));
    assert_eq!(info.height, Some(240));
    assert_duration(&eng, &vid, 1.5, 2.5, "probe test video");

    // --- thumbnails ---
    let thumb = dir.join("thumb.jpg");
    eng.video_thumbnail(&vid, &thumb).expect("video thumbnail");
    assert!(thumb.is_file() && std::fs::metadata(&thumb).unwrap().len() > 500);
    println!(
        "  ✓ video thumbnail: {} bytes",
        thumb.metadata().unwrap().len()
    );

    let img_thumb = dir.join("img-thumb.jpg");
    eng.image_thumbnail(&img, &img_thumb)
        .expect("image thumbnail");
    assert!(img_thumb.is_file() && std::fs::metadata(&img_thumb).unwrap().len() > 100);
    println!("  ✓ image thumbnail");

    // --- waveform ---
    let wave = dir.join("wave.png");
    eng.waveform(&tone, &wave).expect("waveform");
    assert!(wave.is_file() && std::fs::metadata(&wave).unwrap().len() > 100);
    println!("  ✓ audio waveform");

    // --- cleanup chain ---
    let cleaned = dir.join("cleaned.m4a");
    eng.cleanup_audio(&tone, &cleaned).expect("cleanup audio");
    assert_duration(&eng, &cleaned, 0.3, 3.0, "cleanup output");

    // --- tick/click repair chain ---
    let tick_repaired = dir.join("tick-repaired.m4a");
    eng.repair_audio_ticks(&tone, &tick_repaired)
        .expect("tick repair audio");
    assert_duration(&eng, &tick_repaired, 0.3, 3.0, "tick repair output");

    // --- full export: video trim + 2s still + voiceover, keep original audio ---
    let out: PathBuf = dir.join("export.mp4");
    let opts = ExportOptions {
        segments: vec![
            ExportSegment::Video {
                input: vid.clone(),
                trim_start: 0.0,
                trim_end: 2.0,
                has_audio: true,
            },
            ExportSegment::Still {
                input: img.clone(),
                duration: 2.0,
            },
        ],
        voiceover: Some(tone.clone()),
        keep_original_audio: true,
        width: 640,
        height: 360,
        crf: 23,
        output: out.clone(),
    };
    let mut last_pct = 0.0f32;
    let mut stages: Vec<String> = Vec::new();
    eng.export(
        &opts,
        |frac, stage| {
            if frac > last_pct + 0.05 {
                last_pct = frac;
            }
            if stages.last().map(|s| s.as_str()) != Some(stage) {
                stages.push(stage.to_string());
            }
        },
        Arc::new(AtomicBool::new(false)),
    )
    .expect("export pipeline");
    assert!(out.is_file(), "export output missing");
    println!("  ✓ export stages observed: {}", stages.join(" → "));
    assert_duration(
        &eng,
        &out,
        3.2,
        4.8,
        "export duration (2s video + 2s still)",
    );

    let out_info = eng.probe(&out).unwrap();
    assert!(out_info.has_audio, "export should have mixed audio");
    assert_eq!(out_info.width, Some(640));
    assert_eq!(out_info.height, Some(360));

    // --- export without original audio and without voiceover ---
    let out2 = dir.join("export-silent.mov");
    let opts2 = ExportOptions {
        voiceover: None,
        keep_original_audio: false,
        output: out2.clone(),
        ..opts.clone()
    };
    eng.export(&opts2, |_, _| {}, Arc::new(AtomicBool::new(false)))
        .expect("silent export");
    assert_duration(&eng, &out2, 3.2, 4.8, "silent export duration");
    let silent = eng.probe(&out2).unwrap();
    assert!(
        !silent.has_audio,
        "silent export should have no audio stream"
    );
    println!("  ✓ silent MOV export (no audio stream, as expected)");

    // --- v2 timeline export: overlapping visual track plus delayed audio track ---
    let timeline_out = dir.join("timeline-v2.mp4");
    let timeline_opts = TimelineExportOptions {
        clips: vec![
            TimelineExportClip {
                input: vid.clone(),
                track_kind: TimelineTrackKind::Video,
                media_kind: TimelineMediaKind::Video,
                start: 0.0,
                trim_start: 0.0,
                duration: 1.5,
                has_audio: true,
                volume: 0.5,
                muted: false,
            },
            TimelineExportClip {
                input: img.clone(),
                track_kind: TimelineTrackKind::Video,
                media_kind: TimelineMediaKind::Image,
                start: 1.0,
                trim_start: 0.0,
                duration: 2.0,
                has_audio: false,
                volume: 1.0,
                muted: false,
            },
            TimelineExportClip {
                input: tone.clone(),
                track_kind: TimelineTrackKind::Audio,
                media_kind: TimelineMediaKind::Audio,
                start: 0.5,
                trim_start: 0.0,
                duration: 1.5,
                has_audio: true,
                volume: 0.8,
                muted: false,
            },
        ],
        keep_original_audio: true,
        width: 640,
        height: 360,
        crf: 23,
        output: timeline_out.clone(),
    };
    eng.export_timeline_v2(&timeline_opts, |_, _| {}, Arc::new(AtomicBool::new(false)))
        .expect("timeline v2 export");
    assert_duration(&eng, &timeline_out, 2.4, 3.6, "timeline v2 export");
    let timeline_info = eng.probe(&timeline_out).unwrap();
    assert!(
        timeline_info.has_audio,
        "timeline v2 export should have audio"
    );
    assert_eq!(timeline_info.width, Some(640));
    assert_eq!(timeline_info.height, Some(360));
    println!("  ✓ timeline v2 export");

    // --- cancellation path: export then immediately cancel ---
    let cancel = Arc::new(AtomicBool::new(true));
    let out3 = dir.join("should-not-exist.mp4");
    let opts3 = ExportOptions {
        output: out3.clone(),
        ..opts.clone()
    };
    let err = eng.export(&opts3, |_, _| {}, cancel);
    assert!(err.is_err(), "cancelled export should fail");
    println!("  ✓ cancellation honoured: {}", err.unwrap_err());

    println!("\nALL MEDIA ENGINE CHECKS PASSED");
}
