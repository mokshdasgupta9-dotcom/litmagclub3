# LitMag website

**Add a piece:** copy `content/works/_TEMPLATE.md`, rename it (for example `my-poem.md`), fill it in, and commit. For images, put the file in `public/images/` and write its file name in `image:`. Set `anonymous: true` to hide the name and grade.
Dates are written `YYYY-MM-DD`.

**Add an event:** copy `content/events/_TEMPLATE.md` the same way. Past events move to the archive on their own.

**Other edits:** officers in `data/officers.json`, Google Form links in `data/site.json`, and the About, Join, and Contact text in `content/*.md`.

The site rebuilds automatically on Vercel every time you commit to GitHub.

**Landing page text:** edit `data/home.json` (headline, value proposition, three pillars, closing line).
