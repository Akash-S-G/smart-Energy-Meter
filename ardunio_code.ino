#include <SPI.h>
#include <TFT_22_ILI9225.h>

// TFT Display Pin Definitions
#define TFT_RST 8
#define TFT_RS  9
#define TFT_CS  10
#define TFT_SDI 11
#define TFT_CLK 13
#define TFT_LED 3
TFT_22_ILI9225 tft = TFT_22_ILI9225(TFT_RST, TFT_RS, TFT_CS, TFT_SDI, TFT_CLK, TFT_LED);

// Sensor Pins
#define VOLTAGE_SENSOR_PIN A0  // ZMPT101B connected here
#define CURRENT_SENSOR_PIN A1  // ACS712 connected here

// Calibration Constants (ADJUST THESE FOR YOUR SENSORS!)
const float VOLTAGE_CALIBRATION = .00187; // Calibration factor for voltage sensor
const float CURRENT_CALIBRATION = 0.100; // Calibration factor for current sensor (0.1 for 20A model)
const float VCC = 5.0;                   // Arduino reference voltage
const int ADC_RESOLUTION = 1023;         // 10-bit ADC

// RMS calculation parameters
const int SAMPLE_COUNT = 1000;     // Number of samples for RMS calculation
const int SAMPLE_DELAY_US = 100;   // Delay between samples in microseconds

void setup() {
  Serial.begin(9600);  // Match this with the backend's baudRate (9600)
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  // Initialize TFT display
  tft.begin();
  tft.setOrientation(1);
  tft.clear();
  tft.setBacklight(true);
  
  // Show initial screen
  tft.drawText(0, 0, "Energy Monitor", COLOR_WHITE);
  tft.drawText(0, 20, "Initializing...", COLOR_YELLOW);
  delay(2000);
  tft.clear();
}

void loop() {
  // Read sensor values with RMS calculation
  float voltage_rms = calculateRMS(VOLTAGE_SENSOR_PIN, VOLTAGE_CALIBRATION);
  float current_rms = calculateRMS(CURRENT_SENSOR_PIN, CURRENT_CALIBRATION);
  float power = voltage_rms * current_rms;  // Apparent power in VA
  
  // Create JSON string for serial output
  String jsonData = "{\"voltage_rms\":" + String(voltage_rms, 2) + 
                    ",\"current_rms\":" + String(current_rms, 2) + 
                    ",\"power\":" + String(power, 2) + "}";
  
  // Send data over serial
  Serial.println(jsonData);
  
  // Update display
  updateDisplay(voltage_rms, current_rms, power);
  
  // Add delay between readings
  delay(1000);
}

// Function to calculate RMS value
float calculateRMS(int sensorPin, float calibrationFactor) {
    float sumSquares = 0;
    float zeroOffset = VCC / 2.0;  // Center point for AC sensors
    
    for (int i = 0; i < SAMPLE_COUNT; i++) {
        int raw = analogRead(sensorPin);
        float voltage = (raw * VCC) / ADC_RESOLUTION;
        // Subtract DC offset and apply calibration
        float instantaneousValue = (voltage - zeroOffset) / calibrationFactor;
        sumSquares += instantaneousValue * instantaneousValue;
        delayMicroseconds(SAMPLE_DELAY_US);
    }
    
    return sqrt(sumSquares / SAMPLE_COUNT);
}

void updateDisplay(float voltage, float current, float power) {
  tft.clear();
  
  // Create display buffer
  char buffer[32];
  
  // Voltage display
  snprintf(buffer, sizeof(buffer), "Voltage: %.1f V", voltage);
  tft.drawText(0, 0, buffer, COLOR_CYAN);
  
  // Current display
  snprintf(buffer, sizeof(buffer), "Current: %.2f A", current);
  tft.drawText(0, 30, buffer, COLOR_YELLOW);
  
  // Power display
  snprintf(buffer, sizeof(buffer), "Power: %.1f W", power);
  tft.drawText(0, 60, buffer, COLOR_MAGENTA);
}