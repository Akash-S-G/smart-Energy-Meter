const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory store for sensor data
let sensorData = [];
let currentPowerConsumption = 0; // in kW (instantaneous)
let totalEnergyToday = 0; // in kWh (accumulated)
let currentVoltageRMS = 0; // in Volts
let currentCurrentRMS = 0; // in Amps
let projectedMonthlyCost = 10000; // in INR
let aiSuggestions = [];

// List available ports
SerialPort.list().then(ports => {
  console.log('Available ports:');
  ports.forEach(port => {
    console.log(`- ${port.path} (${port.manufacturer || 'Unknown manufacturer'})`);
  });
}).catch(err => {
  console.error('Error listing ports:', err);
});

// Configure serial port with error handling
let port;
try {
  const portConfig = {
    path: 'COM17',
    baudRate: 9600,
    autoOpen: false,
    lock: false // Try without port locking
  };

  port = new SerialPort(portConfig);

  // Handle port errors
  port.on('error', (err) => {
    console.error('Serial port error:', err);
    if (err.message.includes('Access denied')) {
      console.log('Port is locked. Attempting to close and reopen...');
      port.close((err) => {
        if (err) {
          console.error('Error closing port:', err);
        } else {
          setTimeout(() => {
            port.open((err) => {
              if (err) {
                console.error('Error reopening port:', err);
              } else {
                console.log('Port reopened successfully');
              }
            });
          }, 2000);
        }
      });
    }
  });

  // Open the port with retry logic
  const openPort = (retries = 3) => {
    port.open((err) => {
      if (err) {
        console.error(`Error opening port (attempts left: ${retries}):`, err);
        if (retries > 0) {
          console.log('Retrying in 2 seconds...');
          setTimeout(() => openPort(retries - 1), 2000);
        }
      } else {
        console.log('Port opened successfully');
      }
    });
  };

  openPort();

  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  // Read data from serial port
  parser.on('data', (data) => {
    try {
      const sensorReading = JSON.parse(data);
      const { voltage_rms, current_rms, power } = sensorReading;
      
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
      console.log('Received sensor data:', dataPoint);
    } catch (error) {
      console.error('Error parsing serial data:', error);
    }
  });

} catch (error) {
  console.error('Error creating serial port:', error);
}

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
            { id: 1, text: "Switch to Off-Peak", subText: "Run dishwasher after 10 PM", savings: 25 },
            { id: 2, text: "AC Temperature", subText: "Increase AC to 25°C", savings: 80 },
            { id: 3, text: "Load Balancing", subText: "Avoid using multiple high-power appliances together", savings: 50 }
        ]
    });
});

// Endpoint for the Analytics page to fetch data
app.get('/api/analytics-data', (req, res) => {
    const weeklyUsage = 524.1;
    const weeklyUsageChange = 9.6;
    const weeklyCost = 3310;
    const avgDailyCost = 473;
    const monthlyTrendValue = 4726;
    const monthlyTrendChange = 3.4;
    const efficiencyScore = 73;

    const usageTrendsData = [
        { name: "Jan", "Energy Usage": 65, "Cost Breakdown": 30 },
        { name: "Feb", "Energy Usage": 70, "Cost Breakdown": 35 },
        { name: "Mar", "Energy Usage": 60, "Cost Breakdown": 28 },
        { name: "Apr", "Energy Usage": 75, "Cost Breakdown": 40 },
        { name: "May", "Energy Usage": 80, "Cost Breakdown": 42 },
        { name: "Jun", "Energy Usage": 78, "Cost Breakdown": 38 },
    ];

    const deviceUsageData = [
        { name: "Air Conditioner", value: 35, kwh: 33.7, amount: 277, color: "#EF4444" },
        { name: "Water Heater", value: 15, kwh: 16.6, amount: 115, color: "#F97316" },
        { name: "Refrigerator", value: 12, kwh: 13.1, amount: 106, color: "#F59E0B" },
        { name: "Washing Machine", value: 8, kwh: 7.2, amount: 68, color: "#10B981" },
        { name: "TV & Electronics", value: 6, kwh: 4.3, amount: 39, color: "#3B82F6" },
        { name: "Lights & Fans", value: 10, kwh: 9.2, amount: 73, color: "#6366F1" },
        { name: "Other Appliances", value: 14, kwh: 11.6, amount: 115, color: "#8B5CF6" },
    ];

    const tariffDistributionData = [
        { name: "Off-Peak", value: 3.5 },
        { name: "Normal", value: 5.5 },
        { name: "Peak", value: 9.0 },
    ];

    res.json({
        weeklyUsage,
        weeklyUsageChange,
        weeklyCost,
        avgDailyCost,
        monthlyTrendValue,
        monthlyTrendChange,
        efficiencyScore,
        usageTrendsData,
        deviceUsageData,
        tariffDistributionData,
    });
});

// Endpoint for the Billing page to fetch data
app.get('/api/billing-data', (req, res) => {
    const currentBill = {
        month: "Jun 2025",
        kWhUsed: 839,
        totalAmount: 4757,
        avgRate: 5.7,
        breakdown: {
            peak: { amount: 2207, kWh: 245, rate: 9 },
            normal: { amount: 1296, kWh: 236, rate: 5.5 },
            offPeak: { amount: 1254, kWh: 358, rate: 3.5 },
        },
        additionalCharges: [],
    };

    const paymentSummary = {
        thisMonth: 4757,
        lastMonth: 4693,
        sixMonthAverage: 4727,
        totalPaidSixMonths: 23604,
    };

    const paymentHistory = [
        { month: "May 2025", dueDate: "15th of next month", status: "Pending", amount: 4693, variant: "destructive" },
        { month: "Jan 2025", paidDate: "12/15/2024", status: "Paid", amount: 5549, variant: "success" },
        { month: "Feb 2025", paidDate: "11/15/2024", status: "Paid", amount: 4502, variant: "success" },
        { month: "Mar 2025", paidDate: "10/15/2024", status: "Paid", amount: 4837, variant: "success" },
        { month: "Apr 2025", paidDate: "9/15/2024", status: "Paid", amount: 4024, variant: "success" },
    ];

    const monthlyBillsHistory = [
        { month: "Jan 2025", kwh: 885, total: 4611, peak: 1459, normal: 1709, offPeak: 1443 },
        { month: "Feb 2025", kwh: 980, total: 5215, peak: 1827, normal: 1836, offPeak: 1552 },
        { month: "Mar 2025", kwh: 920, total: 4776, peak: 1835, normal: 1194, offPeak: 1748 },
        { month: "Apr 2025", kwh: 778, total: 4053, peak: 1405, normal: 1146, offPeak: 1502 },
        { month: "May 2025", kwh: 970, total: 5214, peak: 2045, normal: 1567, offPeak: 1603 },
        { month: "Jun 2025", kwh: 923, total: 5143, peak: 2222, normal: 1524, offPeak: 1397 },
    ];

    res.json({
        currentBill,
        paymentSummary,
        paymentHistory,
        monthlyBillsHistory,
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
}); 