(() => {
  'use strict';
  const video = document.getElementById('sample-video');
  const button = document.getElementById('load-sample-video');
  const status = document.getElementById('sample-video-status');
  if (!video || !button || !status) return;

  const SOURCE = '/media/software-tutorial-sample/ppt-check-demo.mp4';
  const MAX_BYTES = 4 * 1024 * 1024;
  const TIMEOUT_MS = 30000;
  let objectUrl = null;
  let controller = null;
  let generation = 0;
  let loading = false;

  function releaseVideo() {
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    video.controls = false;
  }

  function showLoadButton(message) {
    button.hidden = false;
    button.disabled = false;
    button.textContent = '加载视频（约3.2 MB）';
    status.textContent = message;
  }

  function reset() {
    generation += 1;
    if (controller) controller.abort();
    controller = null;
    loading = false;
    releaseVideo();
    showLoadButton('点击按钮加载样片，再使用播放器观看。');
  }

  function waitForMetadata(signal) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', loaded);
        video.removeEventListener('error', failed);
        signal.removeEventListener('abort', aborted);
      };
      const loaded = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error('media-unavailable')); };
      const aborted = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
      if (signal.aborted) { aborted(); return; }
      video.addEventListener('loadedmetadata', loaded, { once: true });
      video.addEventListener('error', failed, { once: true });
      signal.addEventListener('abort', aborted, { once: true });
      video.load();
    });
  }

  button.addEventListener('click', async () => {
    if (loading || objectUrl) return;
    const attempt = ++generation;
    const current = () => attempt === generation;
    const aborter = new AbortController();
    controller = aborter;
    loading = true;
    let timedOut = false;
    button.disabled = true;
    button.textContent = '正在加载…';
    status.textContent = '正在加载约3.2 MB的视频，请稍候。';
    const timer = setTimeout(() => { timedOut = true; aborter.abort(); }, TIMEOUT_MS);
    try {
      const response = await fetch(SOURCE, {
        signal: aborter.signal,
        credentials: 'omit',
        mode: 'same-origin',
        redirect: 'error',
        cache: 'force-cache',
      });
      if (!response.ok || !response.body ||
          !/^video\/mp4(?:\s*;|$)/i.test(response.headers.get('content-type') || '') ||
          Number(response.headers.get('content-length') || 0) > MAX_BYTES) {
        throw new Error('video-response-unavailable');
      }
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      try {
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.byteLength;
          if (size > MAX_BYTES) {
            await reader.cancel();
            throw new Error('video-too-large');
          }
          chunks.push(part.value);
        }
      } finally {
        reader.releaseLock();
      }
      if (!size) throw new Error('empty-video');
      if (!current()) return;
      objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.src = objectUrl;
      video.controls = true;
      await waitForMetadata(aborter.signal);
      if (!current()) return;
      if (!video.videoWidth || !Number.isFinite(video.duration)) throw new Error('invalid-video');
      button.hidden = true;
      status.textContent = '已加载。请点击播放器播放，可拖动进度条并选择英文字幕。';
      video.focus({ preventScroll: true });
    } catch (_) {
      aborter.abort();
      if (current()) {
        releaseVideo();
        showLoadButton(timedOut
          ? '加载超时，请重试，或使用下方下载链接。'
          : '视频未能加载，请重试，或使用下方下载链接。');
      }
    } finally {
      clearTimeout(timer);
      if (current()) {
        controller = null;
        loading = false;
        button.disabled = false;
      }
    }
  });

  // A cached document must return with an actionable control, not a revoked Blob URL.
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  reset();
})();
