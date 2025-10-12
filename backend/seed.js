require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user');
const Judge = require('./models/judge');
const Case = require('./models/cases');
const Evidence = require('./models/evidence');
const MLAnalysis = require('./models/MLanalysis');
const Lawyer = require('./models/Lawyer');

const seedData = async () => {
  try {
    await connectDB();

    /* Clear old data
    await User.deleteMany({});
    await Judge.deleteMany({});
    await Case.deleteMany({});
    await Evidence.deleteMany({});
    await MLAnalysis.deleteMany({}); */

    console.log('⚙️  Updating lawyer model…');
    await Lawyer.deleteMany({});

    // Sample lawyer data across metros and jurisdictions
    const lawyers = [
      // Delhi
      { lawyerId: 'DL-001', name: 'Rajesh Sharma', city: 'Delhi', jurisdiction: 'civil', phone: '+91 9876543210' },
      { lawyerId: 'DL-002', name: 'Priya Mehta', city: 'Delhi', jurisdiction: 'criminal', phone: '+91 9810012345' },
      { lawyerId: 'DL-003', name: 'Anita Kapoor', city: 'Delhi', jurisdiction: 'family', phone: '+91 9899011122' },
      { lawyerId: 'DL-004', name: 'Vikram Singh', city: 'Delhi', jurisdiction: 'property', phone: '+91 9977886655' },
      { lawyerId: 'DL-005', name: 'Suresh Gupta', city: 'Delhi', jurisdiction: 'corporate', phone: '+91 9876500001' },

      // Mumbai
      { lawyerId: 'MB-001', name: 'Neha Desai', city: 'Mumbai', jurisdiction: 'civil', phone: '+91 9876500002' },
      { lawyerId: 'MB-002', name: 'Amit Kulkarni', city: 'Mumbai', jurisdiction: 'criminal', phone: '+91 9876500003' },
      { lawyerId: 'MB-003', name: 'Rohini Patil', city: 'Mumbai', jurisdiction: 'family', phone: '+91 9876500004' },
      { lawyerId: 'MB-004', name: 'Imran Shaikh', city: 'Mumbai', jurisdiction: 'property', phone: '+91 9876500005' },
      { lawyerId: 'MB-005', name: 'Kunal Shah', city: 'Mumbai', jurisdiction: 'corporate', phone: '+91 9876500006' },

      // Bengaluru
      { lawyerId: 'BL-001', name: 'Deepak Nair', city: 'Bangalore', jurisdiction: 'civil', phone: '+91 9876500007' },
      { lawyerId: 'BL-002', name: 'Savitha Rao', city: 'Bangalore', jurisdiction: 'criminal', phone: '+91 9876500008' },
      { lawyerId: 'BL-003', name: 'Karthik Iyer', city: 'Bangalore', jurisdiction: 'family', phone: '+91 9876500009' },
      { lawyerId: 'BL-004', name: 'Pooja Shetty', city: 'Bangalore', jurisdiction: 'property', phone: '+91 9876500010' },
      { lawyerId: 'BL-005', name: 'Abhinav Rao', city: 'Bangalore', jurisdiction: 'corporate', phone: '+91 9876500011' },

      // Chennai
      { lawyerId: 'CH-001', name: 'Lakshmi Narayanan', city: 'Chennai', jurisdiction: 'civil', phone: '+91 9876500012' },
      { lawyerId: 'CH-002', name: 'Arun Prakash', city: 'Chennai', jurisdiction: 'criminal', phone: '+91 9876500013' },
      { lawyerId: 'CH-003', name: 'Meera Krishnan', city: 'Chennai', jurisdiction: 'family', phone: '+91 9876500014' },
      { lawyerId: 'CH-004', name: 'Sridhar R', city: 'Chennai', jurisdiction: 'property', phone: '+91 9876500015' },
      { lawyerId: 'CH-005', name: 'Naveen Kumar', city: 'Chennai', jurisdiction: 'corporate', phone: '+91 9876500016' },

      // Kolkata
      { lawyerId: 'KK-001', name: 'Anirban Chatterjee', city: 'Kolkata', jurisdiction: 'civil', phone: '+91 9876500017' },
      { lawyerId: 'KK-002', name: 'Ritika Sen', city: 'Kolkata', jurisdiction: 'criminal', phone: '+91 9876500018' },
      { lawyerId: 'KK-003', name: 'Subhasis Roy', city: 'Kolkata', jurisdiction: 'family', phone: '+91 9876500019' },
      { lawyerId: 'KK-004', name: 'Indrani Das', city: 'Kolkata', jurisdiction: 'property', phone: '+91 9876500020' },
      { lawyerId: 'KK-005', name: 'Aakash Mitra', city: 'Kolkata', jurisdiction: 'corporate', phone: '+91 9876500021' },

      // Hyderabad
      { lawyerId: 'HY-001', name: 'Prakash Reddy', city: 'Hyderabad', jurisdiction: 'civil', phone: '+91 9876500022' },
      { lawyerId: 'HY-002', name: 'Sana Khan', city: 'Hyderabad', jurisdiction: 'criminal', phone: '+91 9876500023' },
      { lawyerId: 'HY-003', name: 'Venkatesh Rao', city: 'Hyderabad', jurisdiction: 'family', phone: '+91 9876500024' },
      { lawyerId: 'HY-004', name: 'Harish Kumar', city: 'Hyderabad', jurisdiction: 'property', phone: '+91 9876500025' },
      { lawyerId: 'HY-005', name: 'Sharath Ch', city: 'Hyderabad', jurisdiction: 'corporate', phone: '+91 9876500026' },
    ];

    await Lawyer.insertMany(lawyers);
    console.log('✅ Lawyer data seeded successfully');





    console.log('New sample data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
