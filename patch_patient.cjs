const fs = require('fs');
let code = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

// Add don_vi_cap_1 list state
if (!code.includes('donViCap1List')) {
  code = code.replace(
    'const [coQuanList, setCoQuanList] = useState<CoQuan[]>([]);',
    `const [donViCap1List, setDonViCap1List] = useState<any[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<any[]>([]);`
  );
  
  // Replace references of coQuanList with donViCap2List in the file for display purposes
  code = code.replace(/coQuanList/g, 'donViCap2List');
  code = code.replace(/setCoQuanList/g, 'setDonViCap2List');
  
  // Also we need to get the don_vi_cap_1 and don_vi_cap_2 from sqliteService
  code = code.replace(
    /sqliteService\.getCoQuanList\(\)/g,
    'sqliteService.getDonViCap2List()'
  );
  
  // Add fetching of DonViCap1
  const fetchBlock = `
    const fetchDonViCap1 = async () => {
      try {
        const list = await sqliteService.getDonViCap1List();
        setDonViCap1List(list);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDonViCap1();
  `;
  // Let's just find where loadData is defined
  code = code.replace(/const loadData = \(\) => \{/, `const loadData = () => { ${fetchBlock}`);
}

// We need to add BHYT fields and Cascading dropdown to the modal.
// Search for editingPatient
// We need to see what the modal form looks like.
fs.writeFileSync('src/components/Patients/PatientManager.tsx', code, 'utf8');
