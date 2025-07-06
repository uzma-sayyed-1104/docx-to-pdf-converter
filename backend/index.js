const express = require('express');
const multer = require('multer');
const docxTopdf = require('docx-pdf');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Enable CORS to allow frontend on localhost:5173
app.use(cors({
  origin: 'https://docx-to-pdf-converter-0v9a.onrender.com',
  methods: ['POST'],
}));

// ✅ Create uploads and files directories if they don’t exist
const uploadDir = path.join(__dirname, 'uploads');
const filesDir = path.join(__dirname, 'files');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// ✅ Multer setup to store uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // store in uploads/
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original file name
  }
});

const upload = multer({ storage: storage });

// ✅ Route: Convert docx file to PDF
app.post('/convertfile', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const outputPath = path.join(__dirname, 'files', `${req.file.originalname}.pdf`);

    docxTopdf(req.file.path, outputPath, (err, result) => {
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({ message: "Error converting DOCX to PDF" });
      }

      // ✅ Send the converted PDF back as a downloadable file
      res.download(outputPath, () => {
        console.log("PDF sent for download");

        // Optional: delete uploaded file and converted PDF after sending
        fs.unlink(req.file.path, () => {});
        fs.unlink(outputPath, () => {});
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);

});
