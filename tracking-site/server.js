// Zero-dependency static server + tracking collector.
//   - Serves the site in public/
//   - POST /track  : appends one JSON event per line to data/events.jsonl
//   - GET  /events : returns the raw stored events (JSON)
//   - GET  /dashboard : a small HTML summary of what has been collected
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "events.jsonl");

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function readEvents() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return fs
    .readFileSync(DATA_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(function (line) {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
}

function saveEvent(body) {
  let event;
  try {
    event = JSON.parse(body);
  } catch (e) {
    return false;
  }
  // Stamp server-side receipt time; never trust the client for this.
  event.receivedAt = new Date().toISOString();
  fs.appendFileSync(DATA_FILE, JSON.stringify(event) + "\n");
  return true;
}

function serveStatic(req, res) {
  let urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
  // Prevent path traversal outside public/.
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

function serveDashboard(res) {
  const events = readEvents();
  const byType = {};
  const byClick = {};
  const byChoice = {}; // menus / radios / sliders: "name = value" -> count
  const byCarousel = {}; // slide -> count
  const sessions = new Set();
  const visitors = new Set();
  events.forEach(function (e) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.sessionId) sessions.add(e.sessionId);
    if (e.visitorId) visitors.add(e.visitorId);
    if (e.type === "click" && e.label) byClick[e.label] = (byClick[e.label] || 0) + 1;
    if (
      (e.type === "select_change" || e.type === "radio_change" || e.type === "slider_change") &&
      e.name != null
    ) {
      const key = e.name + " = " + e.value;
      byChoice[key] = (byChoice[key] || 0) + 1;
    }
    if (e.type === "carousel_change" && e.slide) {
      byCarousel[e.slide] = (byCarousel[e.slide] || 0) + 1;
    }
  });
  const row = function (k, v) {
    return "<tr><td>" + k + "</td><td>" + v + "</td></tr>";
  };
  const table = function (obj, emptyMsg) {
    const keys = Object.keys(obj);
    return (
      "<table>" +
      (keys.length
        ? keys.map(function (k) { return row(k, obj[k]); }).join("")
        : "<tr><td colspan=2>" + emptyMsg + "</td></tr>") +
      "</table>"
    );
  };
  const html =
    "<!doctype html><meta charset=utf-8><title>Tracking dashboard</title>" +
    "<style>body{font-family:system-ui;margin:2rem;color:#032147}" +
    "h1{border-left:5px solid #ecad0a;padding-left:.5rem}" +
    "table{border-collapse:collapse;margin:1rem 0}td{border:1px solid #ddd;padding:.4rem .8rem}" +
    "a{color:#209dd7}</style>" +
    "<h1>Tracking dashboard</h1>" +
    "<p>Total events stored: <b>" + events.length + "</b> &middot; " +
    "Unique visitors: <b>" + visitors.size + "</b> &middot; " +
    "Sessions: <b>" + sessions.size + "</b></p>" +
    "<h2>Events by type</h2><table>" +
    Object.keys(byType).map(function (k) { return row(k, byType[k]); }).join("") +
    "</table>" +
    "<h2>Button clicks by label</h2>" + table(byClick, "No clicks yet") +
    "<h2>Form choices (menus, radios, sliders)</h2>" + table(byChoice, "No selections yet") +
    "<h2>Carousel slides viewed</h2>" + table(byCarousel, "No carousel activity yet") +
    "<p><a href='/events'>Raw event data (JSON)</a> &middot; <a href='/'>Back to site</a></p>";
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
}

const server = http.createServer(function (req, res) {
  if (req.method === "POST" && req.url === "/track") {
    let body = "";
    req.on("data", function (c) {
      body += c;
      if (body.length > 1e5) req.destroy(); // basic flood guard
    });
    req.on("end", function () {
      const ok = saveEvent(body);
      res.writeHead(ok ? 204 : 400).end();
    });
    return;
  }
  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(readEvents(), null, 2));
    return;
  }
  if (req.method === "GET" && req.url.split("?")[0] === "/dashboard") {
    serveDashboard(res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, function () {
  console.log("Tracking site running at http://localhost:" + PORT);
  console.log("Dashboard at http://localhost:" + PORT + "/dashboard");
});
