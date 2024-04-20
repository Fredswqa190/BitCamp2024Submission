//MQTT Client based on PubSubClient by Nick O'Leary 
//CCS811 Device Library by DFRobot_CCS881
//Communications and Networking libraries by espressif and Arduino

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BME680.h"

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT11.h>
#include "DFRobot_CCS811.h"

DFRobot_CCS811 CCS811(&Wire, 0x5B);

#define SEALEVELPRESSURE_HPA (1013.25)
#define TOKEN ""
#define DEVICEID ""

Adafruit_BME680 bme;

const char* ssid = "mqttserver";
const char* password = "";
const char* mqtt_server = "192.168.100.199";

WiFiClient espClient;
PubSubClient client(espClient);
long last = 0;
char msg[50];
int value = 0;

DHT11 dht11(12);
int temperature = 0;
int humidity = 0;
float VOC = 0;
float CO2 = 0;

void setup() {
  Serial.begin(115200);
  
  while (!Serial);
  Serial.println(F("BME680 test"));

  bme.begin();

  while(CCS811.begin() != 0);

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  

  bme.setTemperatureOversampling(BME680_OS_8X);
  bme.setHumidityOversampling(BME680_OS_2X);
  bme.setPressureOversampling(BME680_OS_4X);
  bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
  bme.setGasHeater(320, 150); // 320*C for 150 ms
}

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) 
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
      delay(5000);
    }
  }

void loop() {

  if (! bme.performReading()) {
    Serial.println("Failed to perform reading :(");
    return;
  }
  Serial.print("Temperature = ");
  Serial.print(bme.temperature);
  Serial.println(" *C");
  char tempString[8];
  dtostrf(bme.temperature, 1, 2, tempString);

  client.publish("esp32/temperature", tempString);

  Serial.print("Pressure = ");
  Serial.print(bme.pressure / 100.0);
  Serial.println(" hPa");

  Serial.print("Humidity = ");
  Serial.print(bme.humidity);
  Serial.println(" %");
  char humString[8];
  dtostrf(bme.humidity, 1, 2, humString);
  client.publish("esp32/humidity", humString);

  Serial.print("Gas = ");
  Serial.print(bme.gas_resistance / 1000.0);
  Serial.println(" KOhms");

  Serial.print("Approx. Altitude = ");
  Serial.print(bme.readAltitude(SEALEVELPRESSURE_HPA));
  Serial.println(" m");

  if((CCS811.checkDataReady() == true)){

      VOC = CCS811.getTVOCPPB();
      char VOCString[8];
      dtostrf(VOC, 1, 2, VOCString);
      Serial.print("VOC: ");
      Serial.println(VOCString);
      client.publish("esp32/VOC", VOCString);

      CO2 = CCS811.getCO2PPM();
      char CO2String[8];
      dtostrf(CO2, 1, 2, CO2String);
      Serial.print("CO2: ");
      Serial.println(CO2String);
      client.publish("esp32/CO2", CO2String);

  Serial.println();
  delay(2000);
  }
}