const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const app = express();

const PORT = process.env.PORT || 3000 || "https://eltaajir.vividwebsolutions.in";
const indexPath = path.resolve(__dirname, "", "build", "index.html");
console.log(indexPath)

app.use(
  express.static(path.resolve(__dirname, "", "build"), { maxAge: "30d" })
);

app.get("/*", (req, res, next) => {
  fs.readFile(indexPath, "utf8", async (err, htmlData) => {
    if (err) {
      console.error("Error during file reading", err);
      return res.status(404).end();
    }

    if (req.originalUrl.includes("/blog")) {
      let blog = [];
      const postId = req.query.bid;
      await https.get(
        `https://www.eltaajir.com/admin/api/blogDetails/${Number(postId)}`,
        (result) => {
          result.on("data", (chunk) => {
            blog.push(chunk);
          });

          result.on("end", () => {
            if (blog) {
              blog = JSON.parse(Buffer.concat(blog).toString())?.data;
              htmlData = htmlData
                .replace(
                  "<title>React App</title>",
                  `<title>${blog[0].blog_title}</title>`
                )
                .replace("__META_OG_TITLE__", blog[0].blog_title)
                .replace("__META_OG_DESCRIPTION__", blog[0].description)
                .replace("__META_DESCRIPTION__", blog[0].description)
                .replace("__META_OG_IMAGE__", blog[0].blog_image);
            }
            return res.send(htmlData);
          });
        }
      ).on('error', err => {
        if (!blog) return res.status(404).send("Post not found");
      })

    } else {
      return res.send(htmlData);
    }
  });
});

app.listen(PORT, (error) => {
  if (error) {
    return console.log("Error during app startup", error);
  }
  console.log("listening on " + PORT + "...");
});
