# Browser-accessible desktop demo

The release image runs the Electron application on an isolated Xvfb display and
exposes it through x11vnc, websockify, and noVNC. Task data remains local to the
disposable container through JsStore; no external service is required.

```sh
docker pull ghcr.io/amrabdelhalim-labs/desktop-todolist-e1:v1.0.0
docker run --rm -p 6080:6080 \
  ghcr.io/amrabdelhalim-labs/desktop-todolist-e1:v1.0.0
```

Open `http://localhost:6080/vnc_lite.html?autoconnect=true&resize=scale`.
The image is intentionally larger than a web-only demo because it includes
Electron, a virtual X display, a window manager, VNC, and the browser bridge.
