FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      fluxbox libasound2 libatk-bridge2.0-0 libdrm2 libgbm1 libgtk-3-0 \
      libnss3 libx11-xcb1 libxss1 libxkbcommon0 novnc websockify x11vnc xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 6080
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:6080/vnc_lite.html').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/entrypoint.sh"]
