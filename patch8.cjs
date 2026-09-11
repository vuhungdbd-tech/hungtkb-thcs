const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

code = code.replace(/      \}\n    \}\n    if \(\!sweepChanged\) break;\n  \}/, `          }
        }
      }
    }
    if (!sweepChanged) break;
  }`);

fs.writeFileSync('src/algorithm.ts', code);
