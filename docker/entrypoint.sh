#!/bin/sh
set -eu

export DISPLAY=:99

# A restarted container reuses its writable layer. Remove stale display
# artifacts defensively before Xvfb starts, even if the previous shutdown was
# unclean and its signal handler never ran.
if [ -e /tmp/.X99-lock ]; then
    unlink /tmp/.X99-lock
fi
if [ -e /tmp/.X11-unix/X99 ]; then
    unlink /tmp/.X11-unix/X99
fi

Xvfb :99 -screen 0 1024x768x24 -nolisten tcp &
xvfb_pid=$!

for attempt in $(seq 1 50); do
    [ -S /tmp/.X11-unix/X99 ] && break
    sleep 0.1
done

fluxbox >/tmp/fluxbox.log 2>&1 &
fluxbox_pid=$!
x11vnc -display :99 -forever -shared -nopw -rfbport 5900 >/tmp/x11vnc.log 2>&1 &
x11vnc_pid=$!
websockify --web=/usr/share/novnc 6080 127.0.0.1:5900 >/tmp/websockify.log 2>&1 &
websockify_pid=$!
npx electron . --no-sandbox --disable-gpu >/tmp/electron.log 2>&1 &
electron_pid=$!

cleanup() {
    kill "$electron_pid" "$websockify_pid" "$x11vnc_pid" "$fluxbox_pid" "$xvfb_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

wait "$electron_pid"
