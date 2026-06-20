const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const canadaData = [
  {
    name: "Ontario",
    districts: [
      {
        name: "Greater Toronto Area",
        cities: [
          "Toronto",
          "Mississauga",
          "Brampton",
          "Vaughan",
          "Markham",
          "Richmond Hill",
          "Oakville",
          "Burlington",
          "Milton",
          "Pickering",
          "Ajax",
          "Whitby",
          "Oshawa"
        ]
      },
      {
        name: "Eastern Ontario",
        cities: [
          "Ottawa",
          "Kanata",
          "Nepean",
          "Orleans",
          "Kingston",
          "Belleville",
          "Cornwall"
        ]
      },
      {
        name: "Southwestern Ontario",
        cities: [
          "Hamilton",
          "London",
          "Windsor",
          "Kitchener",
          "Waterloo",
          "Cambridge",
          "Guelph",
          "Brantford"
        ]
      },
      {
        name: "Central Ontario",
        cities: [
          "Barrie",
          "Peterborough",
          "Orillia"
        ]
      },
      {
        name: "Northern Ontario",
        cities: [
          "Sudbury",
          "Thunder Bay",
          "North Bay",
          "Timmins",
          "Sault Ste. Marie"
        ]
      }
    ]
  },

  {
    name: "British Columbia",
    districts: [
      {
        name: "Metro Vancouver",
        cities: [
          "Vancouver",
          "Surrey",
          "Burnaby",
          "Richmond",
          "Coquitlam",
          "Delta",
          "Langley",
          "North Vancouver",
          "West Vancouver"
        ]
      },
      {
        name: "Vancouver Island",
        cities: [
          "Victoria",
          "Saanich",
          "Langford",
          "Nanaimo",
          "Courtenay"
        ]
      },
      {
        name: "Interior BC",
        cities: [
          "Kelowna",
          "Kamloops",
          "Penticton",
          "Vernon"
        ]
      },
      {
        name: "Fraser Valley",
        cities: [
          "Abbotsford",
          "Chilliwack",
          "Mission"
        ]
      }
    ]
  },

  {
    name: "Alberta",
    districts: [
      {
        name: "Calgary Region",
        cities: [
          "Calgary",
          "Airdrie",
          "Chestermere",
          "Okotoks"
        ]
      },
      {
        name: "Edmonton Region",
        cities: [
          "Edmonton",
          "St. Albert",
          "Sherwood Park",
          "Leduc",
          "Spruce Grove"
        ]
      },
      {
        name: "Southern Alberta",
        cities: [
          "Lethbridge",
          "Medicine Hat"
        ]
      },
      {
        name: "Northern Alberta",
        cities: [
          "Grande Prairie",
          "Fort McMurray"
        ]
      },
      {
        name: "Central Alberta",
        cities: [
          "Red Deer"
        ]
      }
    ]
  },

  {
    name: "Quebec",
    districts: [
      {
        name: "Montreal Region",
        cities: [
          "Montreal",
          "Laval",
          "Longueuil",
          "Brossard"
        ]
      },
      {
        name: "National Capital Region",
        cities: [
          "Quebec City",
          "Levis"
        ]
      },
      {
        name: "Western Quebec",
        cities: [
          "Gatineau"
        ]
      },
      {
        name: "Eastern Quebec",
        cities: [
          "Sherbrooke",
          "Trois-Rivieres",
          "Saguenay"
        ]
      }
    ]
  },

  {
    name: "Nova Scotia",
    districts: [
      {
        name: "Halifax Region",
        cities: [
          "Halifax",
          "Dartmouth",
          "Bedford",
          "Lower Sackville"
        ]
      },
      {
        name: "Cape Breton",
        cities: [
          "Sydney"
        ]
      },
      {
        name: "Central Nova Scotia",
        cities: [
          "Truro",
          "New Glasgow"
        ]
      }
    ]
  },

  {
    name: "New Brunswick",
    districts: [
      {
        name: "Southern NB",
        cities: [
          "Saint John",
          "Fredericton",
          "Moncton",
          "Dieppe",
          "Riverview"
        ]
      }
    ]
  },

  {
    name: "Newfoundland and Labrador",
    districts: [
      {
        name: "Avalon Peninsula",
        cities: [
          "St. John's",
          "Mount Pearl",
          "Paradise"
        ]
      },
      {
        name: "Western Newfoundland",
        cities: [
          "Corner Brook"
        ]
      }
    ]
  },

  {
    name: "Prince Edward Island",
    districts: [
      {
        name: "PEI",
        cities: [
          "Charlottetown",
          "Summerside"
        ]
      }
    ]
  },

  {
    name: "Manitoba",
    districts: [
      {
        name: "Winnipeg Region",
        cities: [
          "Winnipeg",
          "Steinbach",
          "Selkirk"
        ]
      },
      {
        name: "Western Manitoba",
        cities: [
          "Brandon"
        ]
      }
    ]
  },

  {
    name: "Saskatchewan",
    districts: [
      {
        name: "Central Saskatchewan",
        cities: [
          "Saskatoon",
          "Prince Albert"
        ]
      },
      {
        name: "Southern Saskatchewan",
        cities: [
          "Regina",
          "Moose Jaw"
        ]
      }
    ]
  },

  {
    name: "Yukon",
    districts: [
      {
        name: "Yukon Territory",
        cities: [
          "Whitehorse"
        ]
      }
    ]
  },

  {
    name: "Northwest Territories",
    districts: [
      {
        name: "Northwest Territories",
        cities: [
          "Yellowknife",
          "Hay River",
          "Inuvik"
        ]
      }
    ]
  },

  {
    name: "Nunavut",
    districts: [
      {
        name: "Nunavut",
        cities: [
          "Iqaluit"
        ]
      }
    ]
  }
];

async function seed() {
  console.log('Connecting to database...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'workontap_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    for (const state of canadaData) {
      // 1. Insert or get State
      let stateId;
      const [existingStates] = await pool.query('SELECT id FROM states WHERE name = ?', [state.name]);
      
      if (existingStates.length > 0) {
        stateId = existingStates[0].id;
        console.log(`State "${state.name}" already exists (ID: ${stateId}).`);
      } else {
        const [result] = await pool.execute('INSERT INTO states (name, is_active) VALUES (?, 1)', [state.name]);
        stateId = result.insertId;
        console.log(`Created state "${state.name}" (ID: ${stateId}).`);
      }

      for (const district of state.districts) {
        // 2. Insert or get District
        let districtId;
        const [existingDistricts] = await pool.query(
          'SELECT id FROM districts WHERE name = ? AND state_id = ?', 
          [district.name, stateId]
        );

        if (existingDistricts.length > 0) {
          districtId = existingDistricts[0].id;
          console.log(`  District "${district.name}" already exists (ID: ${districtId}).`);
        } else {
          const [result] = await pool.execute(
            'INSERT INTO districts (name, state_id, is_active) VALUES (?, ?, 1)', 
            [district.name, stateId]
          );
          districtId = result.insertId;
          console.log(`  Created district "${district.name}" (ID: ${districtId}).`);
        }

        for (const cityName of district.cities) {
          // 3. Insert or get City
          const [existingCities] = await pool.query(
            'SELECT id FROM cities WHERE name = ? AND district_id = ?', 
            [cityName, districtId]
          );

          if (existingCities.length > 0) {
            console.log(`    City "${cityName}" already exists.`);
          } else {
            await pool.execute(
              'INSERT INTO cities (name, district_id, is_active) VALUES (?, ?, 1)', 
              [cityName, districtId]
            );
            console.log(`    Created city "${cityName}".`);
          }
        }
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

seed();
