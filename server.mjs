import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/src/app.js", ["src/app.js", "text/javascript; charset=utf-8"]],
  ["/src/budget.js", ["src/budget.js", "text/javascript; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const entry = files.get(pathname);
  if (!entry) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  try {
    const body = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, { "Content-Type": entry[1] });
    response.end(body);
  } catch {
    response.writeHead(500);
    response.end("Unable to read application file");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Student Budget: http://127.0.0.1:8000");
});

