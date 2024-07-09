const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Tesseract = require('tesseract.js');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');

const  File  = require('../models/file.model');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // File name
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const localimagePath = path.join(__dirname, '../uploads', req.file.filename);
  // Perform any operations with the uploaded file
  console.log('File uploaded:', req.file);

  // Respond with a success message
    if(res.statusCode == 200){
      const a = main(localimagePath);

  a.then((data)=>{
    console.log("iamreturneddata",data);
    res.send({code : 200,msg : 'File uploaded successfully.',data : data});
    
  })
   
  }
  else{
    res.send({code : 413,msg : 'File not uploaded.'});
  }
 






});

// ocr operation
async function downloadImage(url, filename) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });
  
    const writer = fs.createWriteStream(filename);
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
  
  // Function to perform OCR on the downloaded image
  async function performOCR(imagePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng', // English language
        { logger: m => console.log(m) }
      );
  
      return text;
    } catch (error) {
      console.error('Error performing OCR:', error);
      return null;
    }
  }

    // Example usage
    async function main(localimagePath) {
      let savedData;
        try {
          //await downloadImage(imageUrl, imagePath);
          const extractedText = await performOCR(localimagePath);
          
          if (extractedText) {
            console.log('Extracted Text:');
            console.log(extractedText);
      

            
            // Example: Extracting bold words using regex
            // let boldWords = extractedText.match(/\*\*([^*]+)\*\*/g);

            // console.log("boldwords",boldWords);

            // if (boldWords) {
            //   console.log('Bold Words:');
            //   console.log(boldWords.map(word => word.replace(/\*\*/g, '')));
            // }
            let boldWords;

            preprocessImage(localimagePath)
            .then(preprocessedImagePath => {
              return Tesseract.recognize(preprocessedImagePath, 'eng');
            })
            .then(({ data: { text } }) => {
              boldWords = extractBoldWords(text);
              console.log("iambold",boldWords)
            })
            .catch(err => {
              console.error('Error during OCR processing:', err);

            });
        


            try {
                const base64Data = imageToBase64(localimagePath);
                let file = new File({ image : base64Data, text: extractedText,boldText : boldWords});
    
                 savedData = await file.save()

                //await file.save();
            
                console.log('Base64 image:', base64Data);
              } catch (error) {
                console.error('Error converting image to Base64:', error);
              }


        
           
          }
        } catch (error) {
          console.error('Error:', error);
        }

        return savedData;
      }

      function imageToBase64(filePath) {
        // Read the image file
        const img = fs.readFileSync(filePath);
      
        // Convert image to Base64
        const base64Image = Buffer.from(img).toString('base64');
      
        return base64Image;
      }


      // Function to preprocess image
function preprocessImage(imagePath) {
    const preprocessedImagePath = imagePath.replace(/(\.\w+)$/, '_processed$1');
    return sharp(imagePath)
      .grayscale()
      .normalise()
      .toFile(preprocessedImagePath)
      .then(() => preprocessedImagePath);
  }
  
  function extractBoldWords(text) {
    //  words in uppercase might be considered bold
  const boldWordsRegex = /\b[A-Z]{2,}\b/g;
  
    const matches = text.match(boldWordsRegex);
    return matches || [];
  }

module.exports = router;
