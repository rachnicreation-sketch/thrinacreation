const fs = require('fs');
const path = require('path');

const directory = __dirname;
const target = '<a href="index.html">Accueil</a>';
const replacement = '<a href="index.html">Accueil</a>\n        <a href="services.html">Services</a>';

const files = fs.readdirSync(directory);

files.forEach(file => {
  // Process all html files except services.html (already has it)
  if (file.endsWith('.html') && file !== 'services.html') {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only replace if it contains the target and hasn't been updated
    if (content.includes(target) && !content.includes('href="services.html"')) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added Services link to ${file}`);
    }
  }
});
