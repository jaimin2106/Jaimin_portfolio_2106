const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Messages.tsx', 'utf8');
code = code.replace(
`      setMessages(msgs);
      setLoading(false);
    });`,
`      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error in Messages:", error);
      setLoading(false);
    });`
);
fs.writeFileSync('src/pages/admin/Messages.tsx', code);
