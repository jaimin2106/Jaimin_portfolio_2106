const fs = require('fs');
const pContact = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/ContactPage.tsx';
let dContact = fs.readFileSync(pContact, 'utf8');

dContact = dContact.replace(
  /title="Contact \| Jaimin Umaraniya"/,
  'title="Contact | Consulting & Engineering"'
);
dContact = dContact.replace(
  /description="Get in touch for freelance opportunities, consulting, or general inquiries\."/,
  'description="Get in touch with Jaimin Umaraniya for full-stack engineering, AI integration consulting, or technical product development."'
);
dContact = dContact.replace(
  /Contact Jaimin Umaraniya/,
  'Contact Jaimin Umaraniya - Consulting & Engineering'
);

dContact = dContact.replace(
  /Let's work together/,
  'Consulting & Engineering'
);

fs.writeFileSync(pContact, dContact);
console.log("ContactPage.tsx updated");
