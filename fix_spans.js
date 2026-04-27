const fs = require('fs');
const path = require('path');

const directory = __dirname;
const brandSpanRegex = /<span>Thrina creation<\/span>/gi;

const files = fs.readdirSync(directory);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (brandSpanRegex.test(content)) {
      content = content.replace(brandSpanRegex, '');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed span from ${file}`);
    } else {
      console.log(`Span not found in ${file}`);
    }
  }
});
