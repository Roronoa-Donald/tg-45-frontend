# Ewe Audio Files for Farmer Pages

## Audio Files Structure

Place the MP3 files for Ewe language narration in this directory:

- `farmer_home.mp3` — Home page introduction and welcome
- `farmer_capture.mp3` — Instructions for lot capture, GPS, weight, and photos
- `farmer_lots.mp3` — Instructions for viewing lots and batch management
- `farmer_profile.mp3` — Profile information and account management

## Implementation

The audio files are automatically loaded and played when:
1. User navigates to farmer pages
2. Language is set to Ewe (ee)
3. Audio will auto-play with a 250ms delay

## File Requirements

- Format: MP3
- Bitrate: 128 kbps recommended
- Sample rate: 44100 Hz or 48000 Hz
- Duration: 5-30 seconds recommended
- Accessibility: Clear, slow speech for farmer audience

## Note for Developers

If the audio file is missing, the browser console will show a debug message and the app continues normally (no errors). This ensures offline-first functionality.
