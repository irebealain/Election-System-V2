const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/superadmin/Elections.jsx');
let content = fs.readFileSync(file, 'utf8');

// The file has:
// {isAddPositionOpen && selectedElection && (
//   <div className="modal-backdrop p-4">
// ...
// </div></div>)}

content = content.replace(
  '{isAddPositionOpen && selectedElection && (\n        <div className="modal-backdrop p-4">\n          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">',
  '<Modal isOpen={isAddPositionOpen && !!selectedElection} onClose={() => setIsAddPositionOpen(false)}>\n          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">'
);

content = content.replace(
  '{isAddCandidateOpen && selectedElection && (\n        <div className="modal-backdrop p-4">\n          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">',
  '<Modal isOpen={isAddCandidateOpen && !!selectedElection} onClose={() => setIsAddCandidateOpen(false)}>\n          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">'
);

// Then fix the closing tags for these modals
// We know they end with </div>\n          </div>\n      </Modal> because of the previous fix_all_modals.cjs
// Wait, git checkout reverted the file to the original state.
// So the closing tags are:
//           </div>
//         </div>
//       )}

content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </div>\n      </Modal>');

// Make sure Modal is imported
if (!content.includes('import Modal')) {
    content = content.replace(/import Button from "[^"]+"/g, match => match + '\nimport Modal from "../../components/common/Modal"');
}

fs.writeFileSync(file, content);
