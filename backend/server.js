const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = 3000;

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow credentials
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

// In-memory store for sensor data
let sensorData = [];
let currentPowerConsumption = 0; // in kW (instantaneous)
let totalEnergyToday = 0; // in kWh (accumulated)
let currentVoltageRMS = 0; // in Volts
let currentCurrentRMS = 0; // in Amps
let projectedMonthlyCost = 10000; // in INR
let aiSuggestions = [];

// Function to get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Endpoint to receive sensor data from ESP32
app.post('/api/sensor-data', (req, res) => {
  try {
    console.log('Received sensor data request');
    console.log('Request body:', req.body);
    
    const { voltage_rms, current_rms, power } = req.body;
    
    if (!voltage_rms || !current_rms || !power) {
      console.error('Missing required fields in request');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields',
        received: req.body 
      });
    }
    
    const timestamp = new Date().toISOString();
    const dataPoint = { timestamp, voltage_rms, current_rms, power };
    sensorData.push(dataPoint);

    // Keep a manageable size for sensorData
    if (sensorData.length > 100) {
      sensorData = sensorData.slice(-100);
    }

    currentPowerConsumption = power;
    currentVoltageRMS = voltage_rms;
    currentCurrentRMS = current_rms;

    // Accumulate total energy for today
    totalEnergyToday += power * (1 / 3600); // Assuming data comes every second

    updateAILogic();
    console.log('Successfully processed sensor data:', dataPoint);
    
    res.json({ 
      status: 'success', 
      message: 'Data received',
      timestamp: timestamp
    });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error processing data',
      error: error.message 
    });
  }
});

// Helper function to simulate AI logic based on real-time data
const updateAILogic = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isPeakHours = (currentHour >= 6 && currentHour < 10) || (currentHour >= 18 && currentHour < 22);

    // Monthly Bill Prediction
    const currentDayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const estimatedDailyAvg = totalEnergyToday / currentDayOfMonth;
    projectedMonthlyCost = estimatedDailyAvg * daysInMonth * 6; // Assuming avg 6 INR/kWh

    // AI Suggestion: Optimal Laundry Time
    if (isPeakHours) {
        if (!aiSuggestions.some(s => s.type === "optimal-laundry-time")) {
            aiSuggestions.push({
                id: "optimal-laundry-time",
                type: "optimal-laundry-time",
                message: "Consider running your washing machine after 10 PM. Off-peak rates are significantly cheaper.",
                severity: "high",
                savings: 45
            });
        }
    } else {
        aiSuggestions = aiSuggestions.filter(s => s.type !== "optimal-laundry-time");
    }

    // AI Suggestion: Peak Hour Alert
    if (isPeakHours && currentPowerConsumption > 2.5) {
        if (!aiSuggestions.some(s => s.type === "peak-hour-alert")) {
            aiSuggestions.push({
                id: "peak-hour-alert",
                type: "peak-hour-alert",
                message: "High usage detected during peak hours. Reduce consumption or shift activities.",
                severity: "high"
            });
        }
    } else {
        aiSuggestions = aiSuggestions.filter(s => s.type !== "peak-hour-alert");
    }

    // Add a static unusual spike for demo purposes
    if (!aiSuggestions.some(s => s.type === "unusual-spike-detected")) {
        aiSuggestions.push({
            id: "unusual-spike-detected",
            type: "unusual-spike-detected",
            message: "High energy usage detected at 2 PM yesterday (8.5 kWh vs normal 3.2 kWh)",
            severity: "high"
        });
    }
};

// Endpoint for the Dashboard page to fetch data
app.get('/api/dashboard-data', (req, res) => {
    const latestSensorData = sensorData[sensorData.length - 1] || { power: 0, voltage_rms: 0, current_rms: 0 };
    const currentUsage = latestSensorData.power;
    const offPeakRate = 3.5;

    const todayUsage = totalEnergyToday;
    const todayProjected = totalEnergyToday * (24 / (new Date().getHours() + 1));
    const spentSoFar = totalEnergyToday * 6;

    const currentTariffRate = 3.5;
    const monthlyCostChange = 12;

    // Generate hourly usage data from sensorData
    const hourlyUsageData = [
        { time: "1:00", usage: 1.8 }, { time: "3:00", usage: 1.5 }, { time: "5:00", usage: 2.2 },
        { time: "7:00", usage: 2.8 }, { time: "9:00", usage: 2.5 }, { time: "11:00", usage: 2.0 },
        { time: "13:00", usage: 2.5 }, { time: "15:00", usage: 2.8 }, { time: "17:00", usage: 2.2 },
        { time: "19:00", usage: 1.9 }, { time: "21:00", usage: 2.1 }, { time: "23:00", usage: 2.0 },
    ];

    res.json({
        currentUsage,
        offPeakRate,
        todayUsage,
        todayProjected,
        spentSoFar,
        currentTariffRate,
        projectedMonthlyCost: projectedMonthlyCost.toFixed(0),
        monthlyCostChange,
        hourlyUsageData,
        aiInsights: aiSuggestions,
        quickTips: [
            { id: 1, title: "Optimize AC Usage", message: "Set your AC to 26°C for optimal savings. Each degree lower can increase consumption by 5%." },
            { id: 2, title: "Unplug Idle Devices", message: "Phantom load from chargers and idle electronics can add up. Unplug them when not in use." },
            { id: 3, title: "LED Lighting", message: "Switch to LED bulbs. They use up to 80% less energy than incandescent bulbs and last longer." },
            { id: 4, title: "Peak Hour Awareness", message: "Reduce heavy appliance use during peak hours (6-10 AM, 6-10 PM) to avoid higher tariffs." },
            { id: 5, title: "Regular Maintenance", message: "Clean refrigerator coils and AC filters regularly to improve efficiency and reduce energy consumption." },
        ],
        currentVoltage: currentVoltageRMS,
        currentCurrent: currentCurrentRMS
    });
});

// Endpoint for the Analytics page to fetch data
app.get('/api/analytics-data', (req, res) => {
    // Dummy data for analytics
    const dailyUsageData = [
        { date: "2024-06-01", usage: 15.2 },
        { date: "2024-06-02", usage: 14.8 },
        { date: "2024-06-03", usage: 16.1 },
        { date: "2024-06-04", usage: 13.5 },
        { date: "2024-06-05", usage: 15.9 },
        { date: "2024-06-06", usage: 17.0 },
        { date: "2024-06-07", usage: 14.5 },
    ];

    const weeklyTrendData = [
        { week: "Week 1", usage: 105 },
        { week: "Week 2", usage: 98 },
        { week: "Week 3", usage: 112 },
        { week: "Week 4", usage: 100 },
    ];

    const monthlyTrendData = [
        { month: "Jan", usage: 450 },
        { month: "Feb", usage: 420 },
        { month: "Mar", usage: 480 },
        { month: "Apr", usage: 460 },
        { month: "May", usage: 490 },
        { month: "Jun", usage: 470 },
    ];

    const deviceUsageData = [
        { name: "AC", value: 45 },
        { name: "Refrigerator", value: 20 },
        { name: "Geyser", value: 15 },
        { name: "Lighting", value: 10 },
        { name: "Others", value: 10 },
    ];

    const tariffDistributionData = [
        { name: "Peak (₹7/kWh)", value: 30 },
        { name: "Normal (₹5/kWh)", value: 50 },
        { name: "Off-Peak (₹3.5/kWh)", value: 20 },
    ];

    res.json({
        summary: {
            totalConsumption: 480,
            averageDaily: 16,
            peakDemand: 7.5,
            costSavings: 85,
        },
        dailyUsageData,
        weeklyTrendData,
        monthlyTrendData,
        deviceUsageData,
        tariffDistributionData,
    });
});

// Endpoint for the Billing page to fetch data
app.get('/api/billing-data', (req, res) => {
    const currentBill = {
        period: "June 1, 2024 - June 30, 2024",
        dueDate: "July 15, 2024",
        totalAmount: 1850.75,
        consumption: 308,
        status: "Unpaid",
        details: [
            { description: "Energy Consumption (308 kWh)", amount: 1694.00 },
            { description: "Fixed Charges", amount: 100.00 },
            { description: "Taxes & Duties", amount: 56.75 },
        ],
    };

    const pastBills = [
        {
            id: "bill-2024-05",
            period: "May 1, 2024 - May 31, 2024",
            totalAmount: 1720.50,
            status: "Paid",
            dueDate: "June 15, 2024",
        },
        {
            id: "bill-2024-04",
            period: "April 1, 2024 - April 30, 2024",
            totalAmount: 1680.00,
            status: "Paid",
            dueDate: "May 15, 2024",
        },
        {
            id: "bill-2024-03",
            period: "March 1, 2024 - March 31, 2024",
            totalAmount: 1950.25,
            status: "Paid",
            dueDate: "April 15, 2024",
        },
    ];

    res.json({
        currentBill,
        pastBills,
        paymentOptions: [
            { name: "Credit/Debit Card", icon: "💳" },
            { name: "Net Banking", icon: "🏦" },
            { name: "UPI", icon: "📱" },
        ],
        alerts: [
            "Your bill for June is due on July 15, 2024. Total amount: ₹1850.75.",
            "Enroll in Auto-Pay for hassle-free payments and a chance to win a smart speaker!"
        ]
    });
});

// Start the server
const serverIP = getLocalIP();
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`Server is running on:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${serverIP}:${PORT}`);
  console.log('=================================');
  console.log('\nUse the Network URL above in your ESP32 code');
  console.log('Server is listening on all network interfaces');
}); 