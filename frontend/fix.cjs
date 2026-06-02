const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/admin/StudentTable.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </div>\n      </Modal>');

fs.writeFileSync(file, content);
