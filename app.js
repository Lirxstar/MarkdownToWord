const fileInput = document.getElementById("fileInput");
const assetInput = document.getElementById("assetInput");
const folderInput = document.getElementById("folderInput");
const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("statusText");
const fileNameInput = document.getElementById("fileNameInput");
const wordCount = document.getElementById("wordCount");
const dropZone = document.getElementById("dropZone");
const assetList = document.getElementById("assetList");

const t = (key, params = {}) => window.I18N ? window.I18N.t(key, params) : key;
const imageAssets = [];
const imageAssetMap = new Map();
let previewRenderId = 0;
let isConverting = false;
let lastDefaultMarkdown = "";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function configureMarked() {
  if (typeof marked === "undefined") return;

  const blockMathExtension = {
    name: "blockMath",
    level: "block",
    start(src) {
      const match = src.match(/\$\$/);
      return match ? match.index : undefined;
    },
    tokenizer(src) {
      const match = src.match(/^\$\$[ \t]*\n?([\s\S]+?)\n?\$\$(?=\n|$)/);
      if (!match) return false;
      return {
        type: "blockMath",
        raw: match[0],
        text: match[1].trim(),
        display: true
      };
    },
    renderer(token) {
      return `<div class="math-placeholder math-block" data-display="true" data-latex="${escapeHtml(token.text)}"></div>\n`;
    }
  };

  const inlineMathExtension = {
    name: "inlineMath",
    level: "inline",
    start(src) {
      const match = src.match(/\$/);
      return match ? match.index : undefined;
    },
    tokenizer(src) {
      if (!src.startsWith("$") || src.startsWith("$$") || src[1] === " ") return false;

      for (let i = 1; i < src.length; i += 1) {
        if (src[i] !== "$" || src[i - 1] === "\\") continue;
        const body = src.slice(1, i);
        if (!body || body.includes("\n") || /^\s|\s$/.test(body)) return false;
        return {
          type: "inlineMath",
          raw: src.slice(0, i + 1),
          text: body,
          display: false
        };
      }
      return false;
    },
    renderer(token) {
      return `<span class="math-placeholder math-inline" data-display="false" data-latex="${escapeHtml(token.text)}"></span>`;
    }
  };

  marked.use({ extensions: [blockMathExtension, inlineMathExtension] });
  marked.setOptions({ gfm: true, breaks: false });
}

function getDefaultMarkdown() {
  return t("app.defaultMarkdown");
}

function loadDefaultMarkdown() {
  lastDefaultMarkdown = getDefaultMarkdown();
  markdownInput.value = lastDefaultMarkdown;
}

function refreshWordCount() {
  const markdown = markdownInput.value || "";
  wordCount.textContent = `${markdown.length} ${t("app.chars")}`;
}

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = `status-text ${type}`.trim();
}

function setBusy(isBusy, message = "") {
  isConverting = isBusy;
  convertBtn.disabled = isBusy;
  convertBtn.textContent = isBusy ? t("button.converting") : t("button.convert");
  if (message) setStatus(message);
}

function sanitizeFileName(name) {
  const fallback = "converted-document.docx";
  const cleaned = (name || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ");

  if (!cleaned) return fallback;
  return cleaned.toLowerCase().endsWith(".docx") ? cleaned : `${cleaned}.docx`;
}

function normalizeAssetPath(path) {
  if (!path) return "";
  let clean = String(path).trim().replace(/\\/g, "/");
  clean = clean.split(/[?#]/)[0];
  try {
    clean = decodeURIComponent(clean);
  } catch (_) {
    // Keep the original value if it is not valid URI encoded text.
  }
  clean = clean.replace(/^\.\//, "").replace(/^\/+/, "");
  return clean.toLowerCase();
}

function baseName(path) {
  const normalized = normalizeAssetPath(path);
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] || normalized;
}

function isMarkdownFile(file) {
  return /\.(md|markdown|txt)$/i.test(file.name) || /markdown|text\//i.test(file.type);
}

function isImageFile(file) {
  return /^image\//i.test(file.type) || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
}

function addImageFiles(files) {
  const added = [];
  for (const file of files) {
    if (!isImageFile(file)) continue;

    const asset = {
      file,
      name: file.name,
      relativePath: file.webkitRelativePath || file.name
    };
    imageAssets.push(asset);

    const keys = new Set([
      normalizeAssetPath(file.name),
      normalizeAssetPath(file.webkitRelativePath || ""),
      baseName(file.name),
      baseName(file.webkitRelativePath || file.name)
    ]);

    for (const key of keys) {
      if (key) imageAssetMap.set(key, asset);
    }
    added.push(file.name);
  }
  renderAssetList();
  return added;
}

function renderAssetList() {
  if (!imageAssets.length) {
    assetList.hidden = true;
    assetList.innerHTML = "";
    return;
  }

  const uniqueNames = [...new Map(imageAssets.map((asset) => [asset.relativePath, asset])).values()]
    .slice(-12)
    .map((asset) => `<span class="asset-pill" title="${escapeHtml(asset.relativePath)}">${escapeHtml(asset.relativePath)}</span>`)
    .join("");

  assetList.hidden = false;
  assetList.innerHTML = t("app.loadedImages", { count: imageAssets.length, items: uniqueNames });
}

function findLocalImageAsset(src) {
  const normalized = normalizeAssetPath(src);
  if (!normalized) return null;
  return imageAssetMap.get(normalized) || imageAssetMap.get(baseName(normalized)) || null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error(t("app.readImageFailed")));
    reader.readAsDataURL(file);
  });
}

async function fetchImageAsDataUrl(src) {
  const response = await fetch(src, { mode: "cors" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return await readFileAsDataUrl(new File([blob], "remote-image", { type: blob.type || "image/png" }));
}

async function inlineImages(root) {
  const warnings = [];
  const images = [...root.querySelectorAll("img")];

  for (const img of images) {
    const originalSrc = img.getAttribute("src") || "";
    if (!originalSrc || originalSrc.startsWith("data:")) continue;

    try {
      const asset = findLocalImageAsset(originalSrc);
      if (asset) {
        img.src = await readFileAsDataUrl(asset.file);
        continue;
      }

      if (/^https?:\/\//i.test(originalSrc)) {
        img.src = await fetchImageAsDataUrl(originalSrc);
        continue;
      }

      warnings.push(t("app.localImageMissing", { src: originalSrc }));
    } catch (error) {
      warnings.push(t("app.imageInlineFailed", { src: originalSrc }));
      console.warn(error);
    }
  }

  return warnings;
}

function markdownToSafeHtml(markdown) {
  if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
    throw new Error(t("app.libraryMissing"));
  }

  const rawHtml = marked.parse(markdown || "");
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "data-latex", "data-display", "class", "style", "width", "height"]
  });
}

function waitForMathJaxScript(timeoutMs = 12000) {
  const script = document.getElementById("MathJax-script");

  if (window.MathJax && typeof window.MathJax.tex2svgPromise === "function") {
    return Promise.resolve();
  }

  if (!script) {
    return Promise.reject(new Error(t("app.mathJaxMissing")));
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(t("app.mathJaxMissing")));
    };

    const timer = setTimeout(() => {
      if (window.MathJax && typeof window.MathJax.tex2svgPromise === "function") {
        finish();
      } else {
        reject(new Error(t("app.mathJaxComponentMissing")));
      }
    }, timeoutMs);

    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });

    // Handles cached scripts or non-async script loading that completed before listeners were attached.
    setTimeout(() => {
      if (window.MathJax && typeof window.MathJax.tex2svgPromise === "function") {
        finish();
      }
    }, 0);
  });
}

async function ensureMathJax() {
  await waitForMathJaxScript();

  if (!window.MathJax || !window.MathJax.startup) {
    throw new Error(t("app.mathJaxMissing"));
  }

  if (window.MathJax.startup.promise) {
    await window.MathJax.startup.promise;
  }

  if (typeof window.MathJax.tex2svgPromise !== "function") {
    throw new Error(t("app.mathJaxComponentMissing"));
  }
}

async function renderMathForPreview(root) {
  const placeholders = [...root.querySelectorAll(".math-placeholder")];
  if (!placeholders.length) return;
  await ensureMathJax();

  for (const node of placeholders) {
    const latex = node.dataset.latex || "";
    const display = node.dataset.display === "true";
    try {
      const mjx = await window.MathJax.tex2svgPromise(latex, { display });
      mjx.classList.add(display ? "math-preview-block" : "math-preview-inline");
      node.replaceWith(mjx);
    } catch (error) {
      const fallback = document.createElement(display ? "div" : "span");
      fallback.className = "math-error";
      fallback.textContent = latex;
      node.replaceWith(fallback);
      console.warn(error);
    }
  }
}

async function latexToPngDataUrl(latex, display) {
  await ensureMathJax();
  const mjx = await window.MathJax.tex2svgPromise(latex, { display });
  const svg = mjx.querySelector("svg");
  if (!svg) throw new Error(t("app.mathSvgMissing", { latex }));

  const holder = document.createElement("div");
  holder.style.position = "absolute";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.style.visibility = "hidden";
  holder.style.fontSize = "16px";
  holder.appendChild(mjx);
  document.body.appendChild(holder);

  const rect = svg.getBoundingClientRect();
  const width = Math.max(8, Math.ceil(rect.width || 120));
  const height = Math.max(8, Math.ceil(rect.height || 24));
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", `${width}px`);
  svg.setAttribute("height", `${height}px`);

  const svgText = new XMLSerializer().serializeToString(svg);
  holder.remove();

  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(t("app.mathSvgConvertFailed")));
      img.src = svgUrl;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const context = canvas.getContext("2d");
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width,
      height
    };
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

async function renderMathAsImages(root) {
  const placeholders = [...root.querySelectorAll(".math-placeholder")];
  const warnings = [];
  if (!placeholders.length) return warnings;
  await ensureMathJax();

  for (const node of placeholders) {
    const latex = node.dataset.latex || "";
    const display = node.dataset.display === "true";
    try {
      const rendered = await latexToPngDataUrl(latex, display);
      const img = document.createElement("img");
      img.src = rendered.dataUrl;
      img.alt = latex;
      img.className = `math-image ${display ? "block" : "inline"}`;
      img.setAttribute("width", String(rendered.width));
      img.setAttribute("height", String(rendered.height));
      img.style.width = `${rendered.width}px`;
      img.style.height = `${rendered.height}px`;

      if (display) {
        const wrapper = document.createElement("div");
        wrapper.style.textAlign = "center";
        wrapper.style.margin = "10pt 0";
        wrapper.appendChild(img);
        node.replaceWith(wrapper);
      } else {
        node.replaceWith(img);
      }
    } catch (error) {
      warnings.push(t("app.formulaRenderFailed", { latex }));
      const fallback = document.createElement(display ? "div" : "span");
      fallback.className = "math-error";
      fallback.textContent = latex;
      node.replaceWith(fallback);
      console.warn(error);
    }
  }

  return warnings;
}

async function renderPreview() {
  const renderId = ++previewRenderId;
  const markdown = markdownInput.value;
  refreshWordCount();

  try {
    preview.innerHTML = markdownToSafeHtml(markdown);
    await inlineImages(preview);
    await renderMathForPreview(preview);
    if (renderId !== previewRenderId) return;
  } catch (error) {
    if (renderId !== previewRenderId) return;
    preview.innerHTML = `<p class="math-error">${escapeHtml(t("app.previewFailed", { message: error.message }))}</p>`;
    console.warn(error);
  }
}

function buildWordHtml(bodyHtml) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Calibri, "Microsoft YaHei", "SimSun", sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #111827;
    }
    h1 { font-size: 22pt; margin: 18pt 0 10pt; }
    h2 { font-size: 17pt; margin: 16pt 0 8pt; }
    h3 { font-size: 14pt; margin: 14pt 0 6pt; }
    p { margin: 0 0 8pt; }
    ul, ol { margin-top: 0; margin-bottom: 8pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #9ca3af;
      padding: 6pt;
      vertical-align: top;
    }
    th { background: #f3f4f6; font-weight: bold; }
    pre {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8pt;
      white-space: pre-wrap;
      font-family: Consolas, "Courier New", monospace;
      font-size: 9.5pt;
    }
    code {
      font-family: Consolas, "Courier New", monospace;
      background: #f3f4f6;
    }
    blockquote {
      border-left: 4px solid #d1d5db;
      margin: 8pt 0;
      padding-left: 10pt;
      color: #4b5563;
    }
    img { max-width: 100%; height: auto; }
    .math-image.inline { vertical-align: middle; }
    .math-image.block { display: block; margin: 10pt auto; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

async function prepareWordBodyHtml(markdown) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = markdownToSafeHtml(markdown);
  const imageWarnings = await inlineImages(wrapper);
  const mathWarnings = await renderMathAsImages(wrapper);
  return {
    html: wrapper.innerHTML,
    warnings: [...imageWarnings, ...mathWarnings]
  };
}

async function loadMarkdownFile(file) {
  if (!file) return;
  const text = await file.text();
  markdownInput.value = text;
  lastDefaultMarkdown = "";
  const base = file.name.replace(/\.(md|markdown|txt)$/i, "");
  fileNameInput.value = sanitizeFileName(`${base || "converted-document"}.docx`);
  await renderPreview();
}

async function handleFiles(files) {
  const list = [...files];
  if (!list.length) return;

  const imageFiles = list.filter(isImageFile);
  const markdownFile = list.find(isMarkdownFile);
  const addedImages = addImageFiles(imageFiles);

  if (markdownFile) {
    await loadMarkdownFile(markdownFile);
  } else if (addedImages.length) {
    await renderPreview();
  }

  const parts = [];
  if (markdownFile) parts.push(t("app.readMarkdown", { name: markdownFile.name }));
  if (addedImages.length) parts.push(t("app.loadedImageCount", { count: addedImages.length }));
  if (!parts.length) parts.push(t("app.noRecognizedFiles"));
  setStatus(parts.join("；"), addedImages.length || markdownFile ? "ok" : "error");
}

async function convertToDocx() {
  const markdown = markdownInput.value.trim();
  if (!markdown) {
    setStatus(t("app.emptyMarkdown"), "error");
    return;
  }

  if (typeof marked === "undefined" || typeof DOMPurify === "undefined" || typeof htmlDocx === "undefined") {
    setStatus(t("app.convertLibraryMissing"), "error");
    return;
  }

  try {
    setBusy(true, t("app.convertingStatus"));
    const result = await prepareWordBodyHtml(markdownInput.value);
    const fullHtml = buildWordHtml(result.html);
    const blob = htmlDocx.asBlob(fullHtml, {
      orientation: "portrait",
      margins: { top: 720, right: 720, bottom: 720, left: 720 }
    });

    const fileName = sanitizeFileName(fileNameInput.value);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const warningText = result.warnings.length
      ? t("app.warningPrefix", { warnings: result.warnings.join("\n- ") })
      : "";
    setStatus(t("app.generated", { fileName, warningText }), result.warnings.length ? "" : "ok");
  } catch (error) {
    console.error(error);
    setStatus(t("app.convertFailed", { message: error.message }), "error");
  } finally {
    setBusy(false);
  }
}

function onLanguageChanged() {
  if (markdownInput.value === lastDefaultMarkdown) {
    lastDefaultMarkdown = getDefaultMarkdown();
    markdownInput.value = lastDefaultMarkdown;
    renderPreview();
  } else {
    refreshWordCount();
  }
  renderAssetList();
  if (!isConverting) convertBtn.textContent = t("button.convert");
}

if (window.I18N) {
  window.I18N.subscribe(onLanguageChanged);
  window.I18N.applyTranslations();
}

configureMarked();
loadDefaultMarkdown();
renderPreview();

fileInput.addEventListener("change", (event) => {
  handleFiles(event.target.files).catch((error) => {
    console.error(error);
    setStatus(t("app.fileReadFailed"), "error");
  });
});

assetInput.addEventListener("change", (event) => {
  handleFiles(event.target.files).catch((error) => {
    console.error(error);
    setStatus(t("app.imageReadFailed"), "error");
  });
});

folderInput.addEventListener("change", (event) => {
  handleFiles(event.target.files).catch((error) => {
    console.error(error);
    setStatus(t("app.folderReadFailed"), "error");
  });
});

markdownInput.addEventListener("input", () => {
  lastDefaultMarkdown = "";
  renderPreview();
  setStatus("");
});

convertBtn.addEventListener("click", () => {
  convertToDocx();
});

clearBtn.addEventListener("click", () => {
  markdownInput.value = "";
  lastDefaultMarkdown = "";
  fileInput.value = "";
  assetInput.value = "";
  folderInput.value = "";
  imageAssets.length = 0;
  imageAssetMap.clear();
  renderAssetList();
  renderPreview();
  setStatus(t("app.cleared"), "ok");
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  handleFiles(event.dataTransfer.files).catch((error) => {
    console.error(error);
    setStatus(t("app.fileFormatFailed"), "error");
  });
});
