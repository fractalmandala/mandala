/**
 * OpenReel ↔ Tauri bridge injection script.
 *
 * This runs before the React application loads. It assembles the
 * `window.openreel` object that OpenReel's desktop-mode code expects,
 * delegating every method to Tauri IPC commands via `window.__TAURI_INTERNALS__.invoke()`.
 *
 * Reference: apps/shradhapp/openreel/apps/web/src/types/global.d.ts
 * defines the full interface contract.
 */
(function () {
  "use strict";

  // In Tauri 2, the raw IPC is on window.__TAURI_INTERNALS__.invoke().
  // withGlobalTauri also exposes window.__TAURI__.core.invoke as a wrapper.
  var internals = window.__TAURI_INTERNALS__;
  var tauri = window.__TAURI__;

  if (!internals && !tauri) return;

  var invoke = (internals && internals.invoke)
    || (tauri && tauri.core && tauri.core.invoke)
    || (tauri && tauri.invoke);
  if (typeof invoke !== "function") return;

  var listen = (tauri && tauri.event && tauri.event.listen)
    || (internals && function (eventName, handler) {
         return invoke("plugin:event|listen", {
           event: eventName,
           target: { kind: "Any" },
           handler: internals.transformCallback(handler),
         }).then(function (eventId) {
           return function () {
             invoke("plugin:event|unlisten", { event: eventName, eventId: eventId });
           };
         });
       });

  // --- callback-based event bridges ---
  function eventCallback(eventName) {
    return function (cb) {
      let unlisten = null;
      listen(eventName, function (event) {
        cb(event.payload);
      }).then(function (fn) {
        unlisten = fn;
      });
      return function () {
        if (unlisten) unlisten();
      };
    };
  }

  // --- export path (set by the save dialog before export starts) ---
  var currentExportPath = "";

  window.openreel = {
    platform: "desktop",
    publicOrigin: window.location.origin,

    // ---- hardware ----
    probeHardware: function () {
      return invoke("or_probe_hardware");
    },

    // ---- menu actions (undo/redo/new/open/export/settings) ----
    onMenuAction: eventCallback("openreel-menu-action"),

    // ---- webview downloads (Wavacity export handoff) ----
    onDownloadFinished: eventCallback("shradhapp:download-finished"),

    // ---- file system ----
    fs: {
      showSaveDialog: function (opts) {
        return invoke("or_fs_show_save_dialog", { opts: opts });
      },
      showOpenDialog: function (opts) {
        return invoke("or_fs_show_open_dialog", { opts: opts });
      },
      showOpenDialogMulti: function (opts) {
        return invoke("or_fs_show_open_dialog_multi", { opts: opts });
      },
      readFile: function (path) {
        return invoke("or_fs_read_file", { path: path });
      },
      readFileBytes: function (path) {
        return invoke("or_fs_read_file_bytes", { path: path });
      },
      tempFilePath: function (ext) {
        return invoke("or_fs_temp_file_path", { ext: ext });
      },
      writeFile: function (path, data) {
        return invoke("or_fs_write_file", { path: path, data: data });
      },
      openWrite: function (ext) {
        return invoke("or_fs_open_write", { ext: ext });
      },
      writeChunk: function (handleId, data, position) {
        // Convert ArrayBuffer/Uint8Array to array for Tauri IPC
        var arr = data instanceof Uint8Array ? Array.from(data) : Array.from(new Uint8Array(data));
        return invoke("or_fs_write_chunk", {
          handleId: handleId,
          data: arr,
          position: position,
        });
      },
      closeWrite: function (handleId) {
        return invoke("or_fs_close_write", { handleId: handleId });
      },
      abortWrite: function (handleId) {
        return invoke("or_fs_abort_write", { handleId: handleId });
      },
      revealInFolder: function (path) {
        return invoke("or_fs_reveal_in_folder", { path: path });
      },
    },

    // ---- keychain ----
    keychain: {
      get: function (id) {
        return invoke("or_keychain_get", { id: id });
      },
      set: function (id, value) {
        return invoke("or_keychain_set", { id: id, value: value });
      },
      delete: function (id) {
        return invoke("or_keychain_delete", { id: id });
      },
    },

    // ---- export ----
    export: {
      start: function (args) {
        currentExportPath = args.outputPath || "";
        window.__openreelExportPath = currentExportPath;
        return invoke("or_export_start", { args: args });
      },
      writeAudioWav: function (jobId, wav) {
        var arr = wav instanceof Uint8Array ? Array.from(wav) : Array.from(new Uint8Array(wav));
        return invoke("or_export_write_audio_wav", { jobId: jobId, wav: arr });
      },
      writeAudioChunk: function (jobId, chunk, position) {
        var arr = chunk instanceof Uint8Array ? Array.from(chunk) : Array.from(new Uint8Array(chunk));
        return invoke("or_export_write_audio_chunk", {
          jobId: jobId,
          chunk: arr,
          position: position,
        });
      },
      finishAudio: function (jobId) {
        return invoke("or_export_finish_audio", { jobId: jobId });
      },
      cancel: function (jobId) {
        return invoke("or_export_cancel", { jobId: jobId });
      },
    },

    // ---- window controls ----
    win: {
      minimize: function () {
        return invoke("or_win_minimize");
      },
      toggleMaximize: function () {
        return invoke("or_win_toggle_maximize");
      },
      close: function () {
        return invoke("or_win_close");
      },
      isMaximized: function () {
        return invoke("or_win_is_maximized");
      },
    },

    // ---- lifecycle ----
    lifecycle: {
      onQueryUnsaved: eventCallback("openreel-lifecycle-query-unsaved"),
      onFlush: function (handler) {
        var unlisten = null;
        listen("openreel-lifecycle-flush", function () {
          handler().then(function () {
            invoke("or_lifecycle_flush_done");
          });
        }).then(function (fn) {
          unlisten = fn;
        });
        return function () {
          if (unlisten) unlisten();
        };
      },
    },

    // ---- updater (no-op for Tauri; handled by Tauri's updater plugin) ----
    updater: {
      onStatus: function (cb) {
        cb({ state: "none" });
        return function () {};
      },
      download: function () {
        return Promise.resolve();
      },
      install: function () {
        return Promise.resolve();
      },
    },

    // ---- crash reporting ----
    crash: {
      report: function (payload) {
        invoke("or_crash_report", { payload: payload }).catch(function () {});
      },
    },

    // ---- media operations ----
    media: {
      generateProxy: function (args) {
        return invoke("or_media_generate_proxy", { args: args });
      },
      transcode: function (args) {
        return invoke("or_media_transcode", { args: args });
      },
      extractAudioWav: function (args) {
        return invoke("or_media_extract_audio_wav", { args: args });
      },
      probeAudioStreams: function (args) {
        return invoke("or_media_probe_audio_streams", { args: args });
      },
      fetchUrl: function (args) {
        return invoke("or_media_fetch_url", { args: args }).then(function (result) {
          // Decode base64 body back to ArrayBuffer
          if (result.body) {
            var binary = atob(result.body);
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            result.body = bytes.buffer;
          }
          return result;
        });
      },
    },

    // ---- desktop file picker → File objects ----
    pickMediaFiles: function () {
      var filters = [
        { name: "Media", extensions: ["mp4", "mov", "webm", "mkv", "avi", "mp3", "wav", "aac", "ogg", "flac", "png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"] },
      ];
      return invoke("or_fs_show_open_dialog_multi", { opts: { filters: filters } })
        .then(function (paths) {
          return Promise.all(paths.map(function (filePath) {
            return invoke("or_fs_read_file_bytes", { path: filePath }).then(function (bytes) {
              var arr = new Uint8Array(bytes);
              var ext = filePath.split(".").pop().toLowerCase();
              var mime = "application/octet-stream";
              if (["mp4", "mov", "webm", "mkv", "avi"].indexOf(ext) !== -1) mime = "video/" + ext;
              if (["mp3", "wav", "aac", "ogg", "flac"].indexOf(ext) !== -1) mime = "audio/" + ext;
              if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].indexOf(ext) !== -1) mime = "image/" + (ext === "jpg" ? "jpeg" : ext === "svg" ? "svg+xml" : ext);
              var name = filePath.split("/").pop() || filePath.split("\\").pop() || "file";
              return new File([arr], name, { type: mime });
            });
          }));
        });
    },

    // ---- cloud (proxy through Rust for API key safety) ----
    cloud: {
      fetch: function (service, path, options) {
        // For now, fall back to direct fetch from the renderer
        var url = "https://api." + service + ".com" + path;
        return fetch(url, {
          method: (options && options.method) || "GET",
          headers: (options && options.headers) || {},
          body: (options && options.body) || undefined,
        }).then(function (response) {
          return response.arrayBuffer().then(function (body) {
            var headers = {};
            response.headers.forEach(function (v, k) {
              headers[k] = v;
            });
            return {
              status: response.status,
              statusText: response.statusText,
              headers: headers,
              body: body,
            };
          });
        });
      },
    },

    // ---- GPU jobs (stub — not available in Tauri) ----
    gpu: {
      uploadMedia: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      uploadExport: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      submitJob: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      jobStatus: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      fetchManifest: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      downloadArtifact: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
      cancelJob: function () {
        return Promise.reject("GPU cloud not available in desktop mode");
      },
    },
  };

  console.info("[shradhapp] OpenReel desktop bridge injected (Tauri)");
})();
