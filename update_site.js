const fs = require('fs');
const path = require('path');

const directory = __dirname;

// Replace font import
const fontRegex = /<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=.*?"\s+rel="stylesheet">/g;
const newFontTag = '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&display=swap" rel="stylesheet">';

// Remove brand span
const brandSpanRegex = /<span>THRINA creation<\/span>/g;

const files = fs.readdirSync(directory);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    if (fontRegex.test(content)) {
      content = content.replace(fontRegex, newFontTag);
      modified = true;
    }
    
    if (brandSpanRegex.test(content)) {
      content = content.replace(brandSpanRegex, '');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
