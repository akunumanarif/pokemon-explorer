const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

// Replace all types arrays to JSON strings
content = content.replace(/types: \[(.*?)\]/gs, (match, types) => {
  return `types: JSON.stringify([${types}])`;
});

// Replace all abilities objects to JSON strings
content = content.replace(/abilities: \{[\s\S]*?abilities: \[[\s\S]*?\]\s*\}/g, (match) => {
  const abilitiesData = match.replace('abilities: ', '');
  return `abilities: JSON.stringify(${abilitiesData})`;
});

// Replace all stats objects to JSON strings  
content = content.replace(/stats: \{[\s\S]*?speed: \d+\s*\}/g, (match) => {
  const statsData = match.replace('stats: ', '');
  return `stats: JSON.stringify(${statsData})`;
});

fs.writeFileSync(seedPath, content);
console.log('Seed file updated successfully!');