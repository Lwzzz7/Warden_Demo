# Warden Audio Samples

Static listening-demo website for comparing:

- Original DiffWave and HiFi-GAN speech
- Speech watermarked by Warden
- RIWF, Groot, and HFGW watermarking baselines

## Local preview

Run a static HTTP server from this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

1. Push this directory to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the repository's default branch and the `/ (root)` directory.

No build step or external dependency is required.
