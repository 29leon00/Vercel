import * as ftp from "basic-ftp";

// Secret token — set as VERCEL env var: SECRET_TOKEN
const SECRET = process.env.SECRET_TOKEN || "changeme";

export const config = { maxDuration: 30 };

function err(res, msg, code = 400) {
  res.status(code).json({ ok: false, error: msg });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return err(res, "Method not allowed", 405);

  const token = req.headers["x-auth-token"] || "";
  if (token !== SECRET) return err(res, "Unauthorized", 401);

  const { action, host, user, pass, port = 21, path, content, from, to, newName } = req.body || {};

  if (!host || !user) return err(res, "Missing host/user");

  const client = new ftp.Client(10000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host,
      user,
      password: pass || "",
      port: parseInt(port),
      secure: false,
    });

    switch (action) {

      case "list": {
        const list = await client.list(path || "/");
        const items = list.map((f) => ({
          name: f.name,
          type: f.type === 2 ? "dir" : "file",
          size: f.size,
          date: f.modifiedAt,
        }));
        return res.json({ ok: true, items, path: path || "/" });
      }

      case "get": {
        if (!path) return err(res, "Missing path");
        const chunks = [];
        const writable = {
          write(chunk) { chunks.push(Buffer.from(chunk)); },
        };
        // Use download to a WritableStream via PassThrough
        const { Writable } = await import("stream");
        const bufs = [];
        const ws = new Writable({
          write(chunk, _enc, cb) { bufs.push(chunk); cb(); }
        });
        await client.downloadTo(ws, path);
        const buf = Buffer.concat(bufs);
        return res.json({ ok: true, content: buf.toString("base64"), encoding: "base64" });
      }

      case "put": {
        if (!path || content === undefined) return err(res, "Missing path/content");
        const { Readable } = await import("stream");
        const buf = Buffer.from(content, "base64");
        const rs = Readable.from(buf);
        await client.uploadFrom(rs, path);
        return res.json({ ok: true, message: "Saved" });
      }

      case "delete": {
        if (!path) return err(res, "Missing path");
        const type = req.body.type || "file";
        if (type === "dir") {
          await client.removeDir(path);
        } else {
          await client.remove(path);
        }
        return res.json({ ok: true, message: "Deleted" });
      }

      case "mkdir": {
        if (!path) return err(res, "Missing path");
        await client.ensureDir(path);
        return res.json({ ok: true, message: "Directory created" });
      }

      case "rename": {
        if (!from || !to) return err(res, "Missing from/to");
        await client.rename(from, to);
        return res.json({ ok: true, message: "Renamed" });
      }

      default:
        return err(res, "Unknown action");
    }
  } catch (e) {
    return err(res, e.message || "FTP error", 500);
  } finally {
    client.close();
  }
}
