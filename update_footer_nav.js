const fs = require('fs');
const path = require('path');

const directory = __dirname;
const target = '<a href="index.html">Boutique en ligne</a>';
const replacement = '<a href="index.html">Boutique en ligne</a><br>\n          <a href="services.html">Nos Services</a>';

const files = fs.readdirSync(directory);

files.forEach(file => {
  if (file.endsWith('.html') && file !== 'services.html') {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(target) && !content.includes('<a href="services.html">Nos Services</a>')) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated footer in ${file}`);
    }
  }
});
