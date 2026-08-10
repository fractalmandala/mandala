<script lang="ts">
	import {
		ArrowClockwiseIcon,
		CheckCircleIcon,
		CopyIcon,
		DatabaseIcon,
		GearSixIcon,
		MonitorIcon,
		MoonIcon,
		SlidersHorizontalIcon,
		SpeakerHighIcon,
		SunIcon,
		VideoCameraIcon,
		WifiHighIcon
	} from 'phosphor-svelte';
	import { settingsStore } from '$lib/settings.svelte';
	import type {
		AudioRepairMode,
		DensitySetting,
		ExportPreset,
		MotionSetting,
		ProjectPhaseSetting,
		StartViewSetting,
		ThemeSetting
	} from '$lib/backend/types';

	let copied = $state('');

	function copyValue(label: string, value: string) {
		if (typeof navigator === 'undefined') return;
		void navigator.clipboard?.writeText(value);
		copied = label;
		setTimeout(() => {
			if (copied === label) copied = '';
		}, 1400);
	}
</script>

<section class="settings-page">
	<div class="settings-grid">
		<section class="settings-section">
			<div class="settings-section-header">
				<MonitorIcon size={22} />
				<div>
					<h2>Appearance</h2>
					<p>Keep the app comfortable for long editing sessions.</p>
				</div>
			</div>
			<label class="settings-field">
				<span>Theme</span>
				<select
					value={settingsStore.settings.appearance.theme}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.appearance.theme = event.currentTarget.value as ThemeSetting)
						)}>
					<option value="dark">Dark</option>
					<option value="light">Light</option>
					<option value="system">System</option>
				</select>
			</label>
			<label class="settings-field">
				<span>Motion</span>
				<select
					value={settingsStore.settings.appearance.reducedMotion}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.appearance.reducedMotion = event.currentTarget.value as MotionSetting)
						)}>
					<option value="system">Follow system</option>
					<option value="reduce">Reduce motion</option>
					<option value="full">Full motion</option>
				</select>
			</label>
			<label class="settings-field">
				<span>Density</span>
				<select
					value={settingsStore.settings.appearance.density}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.appearance.density = event.currentTarget.value as DensitySetting)
						)}>
					<option value="comfortable">Comfortable</option>
					<option value="compact">Compact</option>
				</select>
			</label>
		</section>

		<section class="settings-section">
			<div class="settings-section-header">
				<SlidersHorizontalIcon size={22} />
				<div>
					<h2>Workflow</h2>
					<p>Choose how projects open and how much saving status is shown.</p>
				</div>
			</div>
			<label class="settings-field">
				<span>Start screen</span>
				<select
					value={settingsStore.settings.workflow.startView}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.workflow.startView = event.currentTarget.value as StartViewSetting)
						)}>
					<option value="home">Home</option>
					<option value="lastProject">Last project</option>
				</select>
			</label>
			<label class="settings-field">
				<span>Default project phase</span>
				<select
					value={settingsStore.settings.workflow.defaultProjectPhase}
					onchange={(event) =>
						settingsStore.patch(
							(next) =>
								(next.workflow.defaultProjectPhase = event.currentTarget
									.value as ProjectPhaseSetting)
						)}>
					<option value="gather">Gather</option>
					<option value="story">Tell the story</option>
					<option value="sound">Polish sound</option>
					<option value="finish">Finish</option>
				</select>
			</label>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.workflow.showAutosaveStatus}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.workflow.showAutosaveStatus = event.currentTarget.checked)
						)} />
				<span>Show autosave status</span>
			</label>
		</section>

		<section class="settings-section">
			<div class="settings-section-header">
				<SpeakerHighIcon size={22} />
				<div>
					<h2>Audio</h2>
					<p>Audio repair is non-destructive and keeps originals safe.</p>
				</div>
			</div>
			<label class="settings-field">
				<span>Voice repair</span>
				<select
					value={settingsStore.settings.audio.defaultRepairMode}
					onchange={(event) =>
						settingsStore.patch(
							(next) =>
								(next.audio.defaultRepairMode = event.currentTarget.value as AudioRepairMode)
						)}>
					<option value="manual">Manual review</option>
					<option value="autoAfterRecording">Auto after recording</option>
				</select>
			</label>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.audio.keepOriginals}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.audio.keepOriginals = event.currentTarget.checked)
						)} />
				<span>Always keep original audio</span>
			</label>
		</section>

		<section class="settings-section">
			<div class="settings-section-header">
				<VideoCameraIcon size={22} />
				<div>
					<h2>Export</h2>
					<p>Set the defaults used when finishing a video.</p>
				</div>
			</div>
			<label class="settings-field">
				<span>Default preset</span>
				<select
					value={settingsStore.settings.export.defaultPreset}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.export.defaultPreset = event.currentTarget.value as ExportPreset)
						)}>
					<option value="mp4-full">MP4 full quality</option>
					<option value="mp4-small">MP4 small</option>
					<option value="mov">MOV</option>
				</select>
			</label>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.export.keepOriginalAudio}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.export.keepOriginalAudio = event.currentTarget.checked)
						)} />
				<span>Keep original clip audio by default</span>
			</label>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.export.showExportProgress}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.export.showExportProgress = event.currentTarget.checked)
						)} />
				<span>Show export progress</span>
			</label>
		</section>

		<section class="settings-section">
			<div class="settings-section-header">
				<WifiHighIcon size={22} />
				<div>
					<h2>Channel and privacy</h2>
					<p>The channel view uses the internet. Editing and export stay offline.</p>
				</div>
			</div>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.channel.enabled}
					onchange={(event) =>
						settingsStore.patch((next) => (next.channel.enabled = event.currentTarget.checked))} />
				<span>Enable Channel view</span>
			</label>
		</section>

		<section class="settings-section settings-section-advanced">
			<div class="settings-section-header">
				<GearSixIcon size={22} />
				<div>
					<h2>Advanced</h2>
					<p>Diagnostics and local storage details.</p>
				</div>
			</div>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.advanced.showDiagnostics}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.advanced.showDiagnostics = event.currentTarget.checked)
						)} />
				<span>Show diagnostics</span>
			</label>
			<label class="settings-toggle">
				<input
					type="checkbox"
					checked={settingsStore.settings.advanced.confirmDestructiveCommands}
					onchange={(event) =>
						settingsStore.patch(
							(next) => (next.advanced.confirmDestructiveCommands = event.currentTarget.checked)
						)} />
				<span>Confirm destructive palette commands</span>
			</label>
			{#if settingsStore.runtimeInfo}
				<div class="settings-paths">
					<button
						class="settings-path"
						onclick={() => copyValue('App data', settingsStore.runtimeInfo?.appDataDir ?? '')}>
						<DatabaseIcon size={18} />
						<span>
							<strong>App data</strong>
							<small>{settingsStore.runtimeInfo.appDataDir}</small>
						</span>
						<CopyIcon size={16} />
					</button>
					<button
						class="settings-path"
						onclick={() => copyValue('Library', settingsStore.runtimeInfo?.libraryDir ?? '')}>
						<DatabaseIcon size={18} />
						<span>
							<strong>Library</strong>
							<small>{settingsStore.runtimeInfo.libraryDir}</small>
						</span>
						<CopyIcon size={16} />
					</button>
					<button
						class="settings-path"
						onclick={() => copyValue('Thumbnails', settingsStore.runtimeInfo?.thumbnailDir ?? '')}>
						<DatabaseIcon size={18} />
						<span>
							<strong>Thumbnails</strong>
							<small>{settingsStore.runtimeInfo.thumbnailDir}</small>
						</span>
						<CopyIcon size={16} />
					</button>
				</div>
				<p class="settings-runtime">
					<CheckCircleIcon size={16} weight="fill" /> FFmpeg: {settingsStore.runtimeInfo
						.ffmpegAvailable
						? settingsStore.runtimeInfo.ffmpegMessage
						: 'Not available'}
				</p>
			{/if}
			<div class="settings-actions">
				<button class="button button-quiet" onclick={() => settingsStore.reset()}>
					<ArrowClockwiseIcon size={17} /> Reset settings
				</button>
				<span>
					{settingsStore.saving ? 'Saving...' : copied ? `${copied} copied` : 'Saved locally'}
				</span>
			</div>
		</section>
	</div>
</section>
