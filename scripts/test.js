import fs from 'fs';
fetch('https://firestore.googleapis.com/v1/projects/astute-abbey-p1wkv/databases/ai-studio-72db9056-9c78-47ef-8e14-18be539b546c/documents/settings/global')
  .then(res => res.json())
  .then(data => fs.writeFileSync('test.json', JSON.stringify(data, null, 2)));
