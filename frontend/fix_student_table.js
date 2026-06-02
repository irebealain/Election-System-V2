const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/admin/StudentTable.jsx');
let content = fs.readFileSync(file, 'utf8');

// The file currently has things like:
/*
      {/* Add Student Dialog *\/}
      <Modal isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
          <div className="bg-background rounded-[20px] shadow-lg w-full max-w-md mb-16 mt-12 mx-auto">
...
          </div>
        </div>
      )}
*/

content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </div>\n      </Modal>');

fs.writeFileSync(file, content);
