const fs = require('fs');
const path = require('path');

const directory = __dirname;
const logoTag = /<img src="images\/logo\/logo1\.jpg" alt="Logo THRINA creation">/g;
const replacementText = '<img src="images/logo/logo1.jpg" alt="Logo THRINA creation"><span>THRINA Cr&eacute;ation</span>';

const files = fs.readdirSync(directory);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('images/logo/logo1.jpg') && !content.includes('<span>THRINA Cr&eacute;ation</span>')) {
      content = content.replace(logoTag, replacementText);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Re-added span to ${file}`);
    }
  }
});
