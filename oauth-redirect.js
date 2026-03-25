/* Save as oauth-redirect.js next to index.html on GitHub Pages. */
(function () {
  function show(el, on) {
    if (el) el.style.display = on ? "block" : "none";
  }

  function decodePart(s) {
    if (s == null || s === "") return s;
    try {
      return decodeURIComponent(s.replace(/\+/g, " "));
    } catch (e) {
      return s;
    }
  }

  function parseOAuthQuery(search) {
    var q = search.charAt(0) === "?" ? search.slice(1) : search;
    var code = null;
    var state = "";
    try {
      var sp = new URLSearchParams(q);
      code = sp.get("code");
      state = sp.get("state") || "";
    } catch (e) {}
    if (!code && q.indexOf("code=") !== -1) {
      var cm = /(?:^|&)code=([^&]*)/.exec(q);
      if (cm) code = decodePart(cm[1]);
    }
    if ((!state || state === "") && q.indexOf("state=") !== -1) {
      var sm = /(?:^|&)state=([^&]*)/.exec(q);
      if (sm) state = decodePart(sm[1]) || "";
    }
    return { code: code, state: state || "" };
  }

  function run() {
    var boot = document.getElementById("boot");
    var ok = document.getElementById("ok");
    var bad = document.getElementById("bad");
    var href = window.location.href;
    var search = window.location.search || "";

    function flash(btn, msg) {
      var t = btn.textContent;
      btn.textContent = msg;
      setTimeout(function () {
        btn.textContent = t;
      }, 1400);
    }

    function copy(txt, btn, msg) {
      function done() {
        flash(btn, msg || "Copied");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(function () {
          window.prompt("Copy:", txt);
        });
      } else {
        window.prompt("Copy:", txt);
      }
    }

    try {
      show(boot, false);
      var parsed = parseOAuthQuery(search);
      var code = parsed.code;
      var state = parsed.state;
      if (!code && href.indexOf("code=") !== -1) {
        var qi = href.indexOf("?");
        if (qi >= 0) {
          parsed = parseOAuthQuery(href.slice(qi));
          code = parsed.code;
          state = parsed.state;
        }
      }

      var fullUrlEl = document.getElementById("fullUrl");
      var urlRow = document.getElementById("urlRow");
      var btnFull = document.getElementById("btnFullUrl");
      if (fullUrlEl) fullUrlEl.value = href;
      show(urlRow, true);
      if (btnFull) {
        btnFull.onclick = function () {
          copy(href, btnFull, "Copied");
        };
      }

      if (!code) {
        show(bad, true);
        bad.innerHTML =
          "No <code>code</code> parsed. Your app can still use <strong>Copy full URL</strong> → paste in the desktop app.";
        return;
      }

      show(ok, true);
      document.getElementById("codeBox").textContent = code;
      document.getElementById("stateBox").textContent = state;
      var bundle = JSON.stringify({ code: code, state: state });

      document.getElementById("btnCode").onclick = function () {
        copy(code, this, "Copied");
      };
      document.getElementById("btnState").onclick = function () {
        copy(state, this, "Copied");
      };
      document.getElementById("btnBundle").onclick = function () {
        copy(bundle, this, "Copied");
      };
    } catch (err) {
      show(boot, false);
      show(bad, true);
      bad.textContent = "Script error: " + String(err);
      show(document.getElementById("urlRow"), true);
      var fu = document.getElementById("fullUrl");
      if (fu) fu.value = href;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
