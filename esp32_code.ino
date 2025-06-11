#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TFT_22_ILI9225.h>

// WiFi credentials
const char* ssid = "moto";
const char* password = "12345679";

// Backend server details
const char* serverUrl = "http://192.168.65.39:3000/api/sensor-data";

// TFT Display Pin Definitions
#define TFT_RST 22
#define TFT_RS  23
#define TFT_CS  5
#define TFT_SDI 18
#define TFT_CLK 19
#define TFT_LED 21

// Sensor Pins
#define VOLTAGE_SENSOR_PIN 34
#define CURRENT_SENSOR_PIN 35

// Constants
#define VOLTAGE_SENSITIVITY 0.00488  // 5V/1023
#define CURRENT_SENSITIVITY 0.185    // 30A/185mV
#define VOLTAGE_OFFSET 0
#define CURRENT_OFFSET 0

// Initialize TFT display
TFT_22_ILI9225 tft = TFT_22_ILI9225(TFT_RST, TFT_RS, TFT_CS, TFT_SDI, TFT_CLK, TFT_LED);

// Variables
unsigned long lastUpdateTime = 0;
const unsigned long updateInterval = 1000; // Update every second
bool wifiConnected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nStarting Energy Meter...");
  
  // Initialize TFT
  tft.begin();
  tft.setOrientation(1);
  tft.setBackgroundColor(COLOR_BLACK);
  tft.clear();
  
  // Initialize sensor pins
  pinMode(VOLTAGE_SENSOR_PIN, INPUT);
  pinMode(CURRENT_SENSOR_PIN, INPUT);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initial display
  updateDisplay("Initializing...", 0, 0, 0);
}

void connectToWiFi() {
  tft.setFont(Terminal6x8);
  tft.drawText(0, 0, "Connecting to WiFi...", COLOR_WHITE);
  
  Serial.println("Connecting to WiFi...");
  Serial.println("SSID: " + String(ssid));
  
  WiFi.begin(ssid, password);
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
    Serial.println("Connection attempt " + String(attempts));
    tft.drawText(0, 20, "Attempt " + String(attempts), COLOR_WHITE);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("WiFi Connected!");
    Serial.println("IP Address: " + WiFi.localIP().toString());
    Serial.println("RSSI: " + String(WiFi.RSSI()));
    
    tft.drawText(0, 40, "WiFi Connected!", COLOR_GREEN);
    tft.drawText(0, 60, "IP: " + WiFi.localIP().toString(), COLOR_WHITE);
  } else {
    Serial.println("WiFi Connection Failed!");
    Serial.println("Status: " + String(WiFi.status()));
    
    tft.drawText(0, 40, "WiFi Failed!", COLOR_RED);
  }
  delay(2000);
}

void updateDisplay(const char* status, float voltage, float current, float power) {
  tft.clear();
  tft.setFont(Terminal6x8);
  
  // Status
  tft.drawText(0, 0, "Status: " + String(status), COLOR_WHITE);
  
  // WiFi status
  String wifiStatus = wifiConnected ? "Connected" : "Disconnected";
  tft.drawText(0, 20, "WiFi: " + wifiStatus, wifiConnected ? COLOR_GREEN : COLOR_RED);
  
  // Measurements
  tft.drawText(0, 40, "Voltage: " + String(voltage, 1) + "V", COLOR_WHITE);
  tft.drawText(0, 60, "Current: " + String(current, 2) + "A", COLOR_WHITE);
  tft.drawText(0, 80, "Power: " + String(power, 1) + "W", COLOR_WHITE);
}

void sendDataToServer(float voltage, float current, float power) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Attempting to reconnect...");
    wifiConnected = false;
    connectToWiFi();
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON document
  StaticJsonDocument<200> doc;
  doc["voltage_rms"] = voltage;
  doc["current_rms"] = current;
  doc["power"] = power;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending data to server...");
  Serial.println("URL: " + String(serverUrl));
  Serial.println("Data: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error sending HTTP request");
    Serial.println("Error code: " + String(httpResponseCode));
    Serial.println("Error: " + http.errorToString(httpResponseCode));
    
    // Print WiFi status
    Serial.println("WiFi Status: " + String(WiFi.status()));
    Serial.println("WiFi RSSI: " + String(WiFi.RSSI()));
    Serial.println("WiFi IP: " + WiFi.localIP().toString());
  }
  
  http.end();
}

void loop() {
  if (millis() - lastUpdateTime >= updateInterval) {
    lastUpdateTime = millis();
    
    // Read sensor values
    int voltageRaw = analogRead(VOLTAGE_SENSOR_PIN);
    int currentRaw = analogRead(CURRENT_SENSOR_PIN);
    
    // Convert to actual values
    float voltage = (voltageRaw * VOLTAGE_SENSITIVITY) + VOLTAGE_OFFSET;
    float current = (currentRaw * CURRENT_SENSITIVITY) + CURRENT_OFFSET;
    float power = voltage * current;
    
    // Update display
    updateDisplay("Running", voltage, current, power);
    
    // Send data to server if WiFi is connected
    if (wifiConnected) {
      sendDataToServer(voltage, current, power);
    }
    
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
      wifiConnected = false;
      connectToWiFi();
    }
  }
} 