const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "../frc-analysis-site")));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
