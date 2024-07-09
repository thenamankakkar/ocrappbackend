// index.js

const Tesseract = require('tesseract.js');
const axios = require('axios');
const fs = require('fs');

// Function to download the image from a URL
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
async function main() {
  const imageUrl = 'https://jeroen.github.io/images/testocr.png'; // Replace with your image URL
  const imagePath = './image.png'; // Local path to save the image

  try {
    await downloadImage(imageUrl, imagePath);
    const extractedText = await performOCR(imagePath);
    
    if (extractedText) {
      console.log('Extracted Text:');
      console.log(extractedText);

      // Example: Extracting bold words using regex
      const boldWords = extractedText.match(/\*\*([^*]+)\*\*/g);
      if (boldWords) {
        console.log('Bold Words:');
        console.log(boldWords.map(word => word.replace(/\*\*/g, '')));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//main();
