const fs = require('fs');
const path = require('path');

const directory = __dirname;
const logoRegex = /<img src="images\/logo\/logo1\.(jpg|png)" alt="Logo THRINA creation">/g;
const replacementText = '<img src="images/logo/logo1.$1" alt="Logo THRINA creation"><span>THRINA Cr&eacute;ation</span>';

const files = fs.readdirSync(directory);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (logoRegex.test(content) && !content.includes('<span>THRINA Cr&eacute;ation</span>')) {
      content = content.replace(logoRegex, replacementText);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
