
## Zero-config launcher

Download `run-demo.sh` on macOS/Linux or `run-demo.bat` on Windows from the
GitHub release, then run it. The launcher uses the local image when already
loaded, otherwise pulls `ghcr.io/amrabdelhalim-labs/desktop-todolist-e1:v1.0.1`, selects the first available port starting
at `6080`, waits for the real readiness endpoint, and opens
`/vnc_lite.html?autoconnect=true&resize=scale` in the default browser.

```sh
chmod +x run-demo.sh
./run-demo.sh
```

On Windows, double-click `run-demo.bat`. The launcher prints the container
name, preview URL, and exact cleanup command.
