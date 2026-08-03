---
title: Getting started
description: What Shradhapp is, what you need before using it, and a tour of its three tabs.
category: user
id: 1
---

Welcome! This guide explains what Shradhapp is and how to get around it.

## What this app does

Shradhapp is a simple program on your own computer that helps you put together
family videos. With it you can:

- **Keep all your clips in one place.** Videos, photos and audio recordings live in a
  permanent "Media Bank" inside the app. Once something is in the bank, it stays there
  and is easy to find again.
- **Record your own voiceover.** Press one big button, talk, press it again. The app
  can tidy up the sound for you with a single click.
- **Assemble a video.** Put your clips in order, trim them, add your voiceover, and
  save the finished video as a file you can share.

Everything happens on your own computer. There are **no accounts, no sign-ups, and
nothing is sent to the cloud**.

## Before you start: install FFmpeg

Shradhapp uses a free helper program called **FFmpeg** to do the actual video
work. It must be installed on your computer for importing, cleaning up recordings,
thumbnails and exporting to work.

- **On a Mac:** open Terminal and type `brew install ffmpeg`, then press Enter.
  (If you don't have Homebrew, ask whoever set up the app for you.)
- **On Windows:** install FFmpeg and make sure it is either on the system PATH or in
  the folder `C:\ffmpeg\bin`.

If FFmpeg is missing, don't worry — the app still opens, and it shows a friendly
message explaining what's missing whenever you try something that needs FFmpeg.
Just install it and restart the app.

## The three tabs

When you open the app you'll see a header at the top with three large tabs:

| Tab | What it's for |
| --- | --- |
| 🗂️ **Media Bank** | Where all your videos, photos and audio live. Import, search, tag and organize here. |
| 🎙️ **Record Voiceover** | Record yourself talking and clean up the sound with one click. |
| 🎬 **Make a Video** | Put clips in order, trim them, add a voiceover and export a finished video. |

Click a tab to switch between them. Your work is saved automatically, so you can move
freely between tabs without losing anything.

## A good first session

1. Open the **Media Bank** tab and [add some videos and photos](./02-media-bank.md).
2. Open the **Record Voiceover** tab and [record a short voiceover](./03-recording-voiceovers.md).
3. Open the **Make a Video** tab and [put your first video together](./04-making-a-video.md).
4. [Export it](./05-exporting.md) and watch it!

## Where your things live

Everything the app makes — its copy of your media, your recordings, and your video
projects — is stored safely inside the app's own data folder on your computer.
Importing a file **copies** it into the app; your original file is never changed or
moved. For the exact folder locations, see
[Where are my files stored?](./07-troubleshooting-and-faq.md#where-are-my-files-stored)

Next: [The Media Bank](./02-media-bank.md)
