const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/admin/Elections.jsx',
  'src/pages/admin/ManagePositions.jsx',
  'src/pages/superadmin/Elections.jsx',
  'src/pages/student/Elections.jsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace `{isModalOpen && (\n  <div className="modal-backdrop p-4">\n` 
  // with `<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>\n`
  // And `</div>\n</div>\n)}` with `</div>\n</Modal>`

  // A more robust regex approach:
  // Find `{SOMETHING && (\n <div className="modal-backdrop p-4">\n`
  content = content.replace(/\{([A-Za-z0-9_]+)\s*&&\s*\(\s*<div className="modal-backdrop[^"]*">\s*/g, (match, condition) => {
    // Attempt to guess the setter for onClose based on the condition
    // For example, isModalOpen -> setIsModalOpen
    let setter = 'set' + condition.charAt(0).toUpperCase() + condition.slice(1);
    return `<Modal isOpen={${condition}} onClose={() => ${setter}(false)}>\n        `;
  });

  // Replace the closing tags
  content = content.replace(/<\/div>\s*<\/div>\s*\)\}/g, '</div>\n      </Modal>');

  // Make sure to import Modal if not imported
  if (content.includes('<Modal ') && !content.includes('import Modal')) {
    content = content.replace(/import Button from "[^"]+"/g, match => match + '\nimport Modal from "../../components/common/Modal"');
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${relPath}`);
});
