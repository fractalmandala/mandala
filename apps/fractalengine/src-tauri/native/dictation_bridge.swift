import AVFoundation
import Foundation
import Speech

private final class DictationBridge: NSObject {
	private var audioEngine: AVAudioEngine?
	private var request: SFSpeechAudioBufferRecognitionRequest?
	private var task: SFSpeechRecognitionTask?
	private var listening = false

	private func emit(_ type: String, _ payload: [String: Any] = [:]) {
		var message = payload
		message["type"] = type
		guard let data = try? JSONSerialization.data(withJSONObject: message),
			let text = String(data: data, encoding: .utf8) else { return }
		print(text)
		fflush(stdout)
	}

	func start(localeIdentifier: String) {
		stop(finalize: false)
		SFSpeechRecognizer.requestAuthorization { [weak self] status in
			DispatchQueue.main.async {
				guard let self else { return }
				guard status == .authorized else {
					self.emit("error", ["code": "speech-permission-denied"])
					return
				}
				let locale = Locale(identifier: localeIdentifier)
				guard let recognizer = SFSpeechRecognizer(locale: locale), recognizer.isAvailable else {
					self.emit("error", ["code": "locale-unavailable"])
					return
				}
				guard recognizer.supportsOnDeviceRecognition else {
					self.emit("error", ["code": "on-device-unavailable"])
					return
				}
				self.begin(recognizer: recognizer)
			}
		}
	}

	private func begin(recognizer: SFSpeechRecognizer) {
		let request = SFSpeechAudioBufferRecognitionRequest()
		request.requiresOnDeviceRecognition = true
		request.shouldReportPartialResults = true
		self.request = request

		let engine = AVAudioEngine()
		let input = engine.inputNode
		let format = input.outputFormat(forBus: 0)
		input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak request] buffer, _ in
			request?.append(buffer)
		}

		do {
			engine.prepare()
			try engine.start()
			self.audioEngine = engine
			self.listening = true
			self.emit("state", ["phase": "listening"])
			self.task = recognizer.recognitionTask(with: request) { [weak self] result, error in
				guard let self else { return }
				if let result {
					let text = result.bestTranscription.formattedString
					self.emit(result.isFinal ? "final" : "partial", ["text": text])
				}
				if let error {
					self.emit("error", ["code": "recognition-failed", "detail": error.localizedDescription])
					self.stop(finalize: false)
				}
			}
		} catch {
			input.removeTap(onBus: 0)
			self.emit("error", ["code": "microphone-unavailable", "detail": error.localizedDescription])
		}
	}

	func stop(finalize: Bool = true) {
		guard listening || request != nil else { return }
		listening = false
		if let engine = audioEngine {
			engine.inputNode.removeTap(onBus: 0)
			engine.stop()
		}
		audioEngine = nil
		if finalize {
			request?.endAudio()
			task?.finish()
		} else {
			task?.cancel()
		}
		request = nil
		task = nil
		emit("state", ["phase": "idle"])
	}
}

private let bridge = DictationBridge()
DispatchQueue.global(qos: .userInitiated).async {
	while let line = readLine() {
		guard let data = line.data(using: .utf8),
			let command = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
			let action = command["action"] as? String else { continue }
		DispatchQueue.main.async {
			switch action {
			case "start": bridge.start(localeIdentifier: (command["locale"] as? String) ?? "en-US")
			case "stop": bridge.stop()
			case "cancel": bridge.stop(finalize: false)
			default: break
			}
		}
	}
}
RunLoop.main.run()
