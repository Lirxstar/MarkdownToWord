(function () {
  const TRANSLATIONS = {
  "zh": {
    "meta.title": "Markdown 转 Word DOCX",
    "meta.donateTitle": "请我喝杯咖啡 / Buy Me a Coffee",
    "nav.home": "转换工具",
    "nav.donate": "请我喝杯咖啡",
    "nav.language": "English",
    "hero.eyebrow": "Markdown → Word",
    "hero.title": "上传 Markdown，转换成 .docx",
    "hero.subtitle": "支持常见 Markdown、LaTeX 公式和图片。转换在浏览器本地完成，文件不会上传到服务器。",
    "upload.markdown.title": "选择 Markdown 文件",
    "upload.markdown.desc": "也可以把 .md 文件和图片一起拖到这里",
    "upload.images.title": "选择 Markdown 图片",
    "upload.images.desc": "用于解析 <code>![alt](images/a.png)</code> 这类本地图片路径",
    "upload.folder.title": "选择图片文件夹",
    "upload.folder.desc": "可选。适合 Markdown 引用了一个 images 文件夹的情况",
    "field.filename": "导出的 Word 文件名",
    "button.convert": "转换并下载 .docx",
    "button.converting": "正在转换...",
    "button.clear": "清空内容",
    "editor.title": "Markdown 内容",
    "editor.placeholder": "在这里粘贴 Markdown 内容，例如：\n\n# 标题\n\n行内公式：$E = mc^2$\n\n$$\n\\operatorname{softmax}(x_i)=\\frac{e^{x_i}}{\\sum_j e^{x_j}}\n$$\n\n![示例图片](images/example.png)",
    "preview.title": "预览",
    "preview.subtitle": "公式会先渲染，图片会尽量内联",
    "note.title": "说明",
    "note.body": "本地图片需要你同时上传图片文件，网页会根据文件名或相对路径匹配 Markdown 里的图片引用。",
    "donate.eyebrow": "Support",
    "donate.title": "请我喝杯咖啡",
    "donate.subtitle": "如果这个工具对你有帮助，可以通过支付宝或微信打赏支持。",
    "donate.alipay": "支付宝",
    "donate.wechat": "微信",
    "donate.scan": "用对应 App 扫码打赏。",
    "donate.noteTitle": "说明",
    "donate.noteBody": "二维码图片只保存在这个静态网站文件夹中。打赏会通过你自己的支付宝或微信 App 完成。",
    "donate.back": "返回转换工具",
    "app.defaultMarkdown": "# Markdown 转 Word 示例\n\n你可以上传 `.md` 文件，或者直接粘贴 Markdown。\n\n## 公式测试\n\n行内公式：$E = mc^2$，以及 $\\alpha_i = \\operatorname{softmax}(q_i k_i^T)$。\n\n独立公式：\n\n$$\n\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V\n$$\n\n## 图片测试\n\n如果 Markdown 里写了本地图片路径，例如：\n\n`![示例图](sample-assets/attention.png)`\n\n请同时上传对应图片，或者选择包含图片的文件夹。\n\n## 表格测试\n\n| 概念 | 公式 |\n|---|---|\n| Cross entropy | $L=-\\sum_i y_i\\log p_i$ |\n| Bayes theorem | $P(A|B)=\\frac{P(B|A)P(A)}{P(B)}$ |\n\n```text\nCode blocks keep raw LaTeX text: $x_i$ should not be rendered here.\n```\n\n> 转换在浏览器本地完成。",
    "app.chars": "字符",
    "app.loadedImages": "已加载 {count} 个图片文件：{items}",
    "app.readImageFailed": "读取图片失败",
    "app.localImageMissing": "未找到本地图片：{src}",
    "app.imageInlineFailed": "图片无法内联：{src}",
    "app.libraryMissing": "Markdown 或 HTML 清理库没有加载成功。请确认当前网络可以访问 CDN。",
    "app.mathJaxMissing": "MathJax 没有加载成功。请确认当前网络可以访问 jsDelivr CDN。",
    "app.mathJaxComponentMissing": "MathJax tex-svg 组件仍未加载成功。请检查网络或稍后重试。",
    "app.mathSvgMissing": "MathJax 没有生成 SVG。表达式：{latex}",
    "app.mathSvgConvertFailed": "公式 SVG 无法转换为图片。",
    "app.formulaRenderFailed": "公式无法渲染：{latex}",
    "app.previewFailed": "预览失败：{message}",
    "app.readMarkdown": "已读取 Markdown：{name}",
    "app.loadedImageCount": "已加载图片：{count} 个",
    "app.noRecognizedFiles": "没有识别到 Markdown 或图片文件。",
    "app.emptyMarkdown": "请先上传或输入 Markdown 内容。",
    "app.convertLibraryMissing": "转换库没有加载成功。请确认当前网络可以访问 jsDelivr CDN。",
    "app.convertingStatus": "正在渲染公式、内联图片并生成 Word...",
    "app.warningPrefix": "\n注意：\n- {warnings}",
    "app.generated": "已生成：{fileName}{warningText}",
    "app.convertFailed": "转换失败：{message}",
    "app.fileReadFailed": "读取文件失败。请确认文件是文本格式的 Markdown。",
    "app.imageReadFailed": "读取图片失败。",
    "app.folderReadFailed": "读取文件夹失败。",
    "app.cleared": "内容已清空。",
    "app.fileFormatFailed": "读取文件失败。请确认文件格式正确。"
  },
  "en": {
    "meta.title": "Markdown to Word DOCX",
    "meta.donateTitle": "Buy Me a Coffee",
    "nav.home": "Converter",
    "nav.donate": "Buy Me a Coffee",
    "nav.language": "中文",
    "hero.eyebrow": "Markdown → Word",
    "hero.title": "Upload Markdown and convert it to .docx",
    "hero.subtitle": "Supports common Markdown, LaTeX formulas, and images. Conversion runs locally in your browser; your files are not uploaded to a server.",
    "upload.markdown.title": "Choose a Markdown file",
    "upload.markdown.desc": "You can also drag a .md file and its images here",
    "upload.images.title": "Choose Markdown images",
    "upload.images.desc": "Used to resolve local image paths such as <code>![alt](images/a.png)</code>",
    "upload.folder.title": "Choose an image folder",
    "upload.folder.desc": "Optional. Useful when your Markdown references an images folder.",
    "field.filename": "Exported Word filename",
    "button.convert": "Convert and download .docx",
    "button.converting": "Converting...",
    "button.clear": "Clear content",
    "editor.title": "Markdown content",
    "editor.placeholder": "Paste Markdown content here, for example:\n\n# Title\n\nInline formula: $E = mc^2$\n\n$$\n\\operatorname{softmax}(x_i)=\\frac{e^{x_i}}{\\sum_j e^{x_j}}\n$$\n\n![Example image](images/example.png)",
    "preview.title": "Preview",
    "preview.subtitle": "Formulas are rendered first; images are inlined where possible",
    "note.title": "Notes",
    "note.body": "For local images, upload the image files as well; the page will match Markdown image references by filename or relative path.",
    "donate.eyebrow": "Support",
    "donate.title": "Buy Me a Coffee",
    "donate.subtitle": "If this tool is useful to you, you can support it through Alipay or WeChat.",
    "donate.alipay": "Alipay",
    "donate.wechat": "WeChat Pay",
    "donate.scan": "Scan with the corresponding app to support.",
    "donate.noteTitle": "Note",
    "donate.noteBody": "The QR code images are stored only inside this static website folder. Any payment is completed through your own Alipay or WeChat app.",
    "donate.back": "Back to converter",
    "app.defaultMarkdown": "# Markdown to Word Example\n\nYou can upload a `.md` file or paste Markdown directly.\n\n## Formula Test\n\nInline formula: $E = mc^2$, and $\\alpha_i = \\operatorname{softmax}(q_i k_i^T)$.\n\nDisplay formula:\n\n$$\n\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V\n$$\n\n## Image Test\n\nIf your Markdown contains a local image path, for example:\n\n`![Example image](sample-assets/attention.png)`\n\nplease upload the corresponding image as well, or choose the folder that contains the image.\n\n## Table Test\n\n| Concept | Formula |\n|---|---|\n| Cross entropy | $L=-\\sum_i y_i\\log p_i$ |\n| Bayes theorem | $P(A|B)=\\frac{P(B|A)P(A)}{P(B)}$ |\n\n```text\nCode blocks keep raw LaTeX text: $x_i$ should not be rendered here.\n```\n\n> Conversion runs locally in your browser.",
    "app.chars": "characters",
    "app.loadedImages": "Loaded {count} image files: {items}",
    "app.readImageFailed": "Failed to read image",
    "app.localImageMissing": "Local image not found: {src}",
    "app.imageInlineFailed": "Could not inline image: {src}",
    "app.libraryMissing": "The Markdown or HTML sanitizing library failed to load. Check whether your network can access the CDN.",
    "app.mathJaxMissing": "MathJax failed to load. Check whether your network can access the jsDelivr CDN.",
    "app.mathJaxComponentMissing": "The MathJax tex-svg component is still unavailable. Check your network or try again later.",
    "app.mathSvgMissing": "MathJax did not generate SVG for expression: {latex}",
    "app.mathSvgConvertFailed": "Could not convert formula SVG to image.",
    "app.formulaRenderFailed": "Could not render formula: {latex}",
    "app.previewFailed": "Preview failed: {message}",
    "app.readMarkdown": "Read Markdown: {name}",
    "app.loadedImageCount": "Loaded images: {count}",
    "app.noRecognizedFiles": "No Markdown or image files were recognized.",
    "app.emptyMarkdown": "Upload or enter Markdown content first.",
    "app.convertLibraryMissing": "The conversion library failed to load. Check whether your network can access the jsDelivr CDN.",
    "app.convertingStatus": "Rendering formulas, inlining images, and generating Word...",
    "app.warningPrefix": "\nNote:\n- {warnings}",
    "app.generated": "Generated: {fileName}{warningText}",
    "app.convertFailed": "Conversion failed: {message}",
    "app.fileReadFailed": "Failed to read the file. Make sure it is a text-based Markdown file.",
    "app.imageReadFailed": "Failed to read image.",
    "app.folderReadFailed": "Failed to read folder.",
    "app.cleared": "Content cleared.",
    "app.fileFormatFailed": "Failed to read files. Make sure the file format is correct."
  }
};
  const listeners = new Set();

  function normalizeLang(lang) {
    return lang === "en" ? "en" : "zh";
  }

  function getLang() {
    const saved = localStorage.getItem("md2docx_lang");
    if (saved) return normalizeLang(saved);
    const browserLang = navigator.language || "";
    return browserLang.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function format(template, params) {
    return String(template || "").replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(params || {}, key) ? params[key] : `{${key}}`;
    });
  }

  function t(key, params = {}) {
    const lang = getLang();
    const value = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.zh[key] || key;
    return format(value, params);
  }

  function applyTranslations() {
    const lang = getLang();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((node) => {
      node.innerHTML = t(node.dataset.i18nHtml);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", t(node.dataset.i18nTitle));
    });

    const titleKey = document.body ? document.body.dataset.pageTitle : null;
    if (titleKey) document.title = t(titleKey);
  }

  function setLang(lang) {
    const next = normalizeLang(lang);
    localStorage.setItem("md2docx_lang", next);
    applyTranslations();
    listeners.forEach((fn) => fn(next));
  }

  function toggleLang() {
    setLang(getLang() === "zh" ? "en" : "zh");
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  window.I18N = { getLang, setLang, toggleLang, t, applyTranslations, subscribe };

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.addEventListener("click", toggleLang);
    });
  });
})();
