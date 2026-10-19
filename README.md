# Warden speech demo

Static listening demo with the same minimal visual style as Thrive. No build step or external dependencies.

## Preview

Run `python -m http.server 8000` in this folder and open `http://localhost:8000/`.

Select DiffWave or HiFi-GAN, then one of five evaluation samples. The clean reference, Warden output, and available baselines remain matched to the selected vocoder and sample. Playing one track pauses the others; changing the selection stops playback. Every clip has a WAV download link. Query parameters preserve a selection, for example `?model=hifigan&sample=3`.

## Audio inventory

All 35 original WAV files are preserved byte-for-byte:

- DiffWave: 5 samples each for Original, Warden, Groot, RIWF (20 clips).
- HiFi-GAN: 5 samples each for Original, Warden, HFGW (15 clips).

Only the baselines present in the original demo are shown for each model. No additional synthesis, transcript, dataset, or metric is inferred.

## Source and deployment

Original local source: `D:\chrome_down\anonymous_demo-main\anonymous_demo-main`.
Redesigned copy: `D:\project\bulwark\Warden_Demo`.
Target repository: https://github.com/Lwzzz7/Warden_Demo

Deploy the contents of this folder to the repository's GitHub Pages publishing root. All asset URLs are relative and support a project subpath such as `/Warden_Demo/`.
