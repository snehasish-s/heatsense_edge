#include <Wire.h>
#include <U8x8lib.h>
#include <Arduino_RouterBridge.h>


// =====================================================
// HEATSENSE EDGE
// MCU / ARDUINO SIDE
// =====================================================


// =====================================================
// OLED
// =====================================================

U8X8_SSD1306_128X64_NONAME_HW_I2C oled(U8X8_PIN_NONE);


// =====================================================
// PIN DEFINITIONS
// =====================================================

// PIR
const int PIR_PIN = D2;

// Buzzer
const int BUZZER_PIN = D4;

// Persona selection button
const int PERSONA_BUTTON = D7;

// Risk testing button
const int RISK_BUTTON = D8;


// -----------------------------------------------------
// RISK LEDs
// -----------------------------------------------------

const int GREEN_LED = D13;

const int YELLOW_LED = D12;

const int RED_LED = D11;


// =====================================================
// PERSONA DATA
// =====================================================

const char* personas[] = {
  "GENERAL",
  "WORKER",
  "ELDERLY",
  "CHILD"
};

const int PERSONA_COUNT = 4;

int personaIndex = 0;


// =====================================================
// RISK DATA
// =====================================================

const char* risks[] = {
  "SAFE",
  "MEDIUM",
  "HIGH",
  "EXTREME"
};

const int RISK_COUNT = 4;

int riskIndex = 0;


// =====================================================
// PIR STATE
// =====================================================

int previousMotion = -1;


// =====================================================
// BUZZER FUNCTION
// =====================================================

void beep(int frequency, int durationMs) {

  int period =
      1000000 / frequency;

  int halfPeriod =
      period / 2;

  long cycles =
      (long)frequency
      * durationMs
      / 1000;


  for (
    long i = 0;
    i < cycles;
    i++
  ) {

    digitalWrite(
      BUZZER_PIN,
      HIGH
    );

    delayMicroseconds(
      halfPeriod
    );

    digitalWrite(
      BUZZER_PIN,
      LOW
    );

    delayMicroseconds(
      halfPeriod
    );
  }
}


// =====================================================
// TURN ALL RISK LEDs OFF
// =====================================================

void allRiskLedsOff() {

  digitalWrite(
    GREEN_LED,
    LOW
  );

  digitalWrite(
    YELLOW_LED,
    LOW
  );

  digitalWrite(
    RED_LED,
    LOW
  );
}


// =====================================================
// ALERT CONTROL
// =====================================================

void updateAlert() {

  // Always reset all LEDs first
  allRiskLedsOff();

  digitalWrite(
    BUZZER_PIN,
    LOW
  );


  // ===================================================
  // SAFE
  // ===================================================

  if (riskIndex == 0) {

    digitalWrite(
      GREEN_LED,
      HIGH
    );

    Serial.println(
      "ALERT: SAFE"
    );
  }


  // ===================================================
  // MEDIUM
  // ===================================================

  else if (riskIndex == 1) {

    digitalWrite(
      YELLOW_LED,
      HIGH
    );


    // One short warning beep
    beep(
      1800,
      250
    );


    Serial.println(
      "ALERT: MEDIUM"
    );
  }


  // ===================================================
  // HIGH
  // ===================================================

  else if (riskIndex == 2) {

    digitalWrite(
      RED_LED,
      HIGH
    );


    // Three warning beeps
    for (
      int i = 0;
      i < 3;
      i++
    ) {

      beep(
        2000,
        300
      );

      delay(250);
    }


    Serial.println(
      "ALERT: HIGH"
    );
  }


  // ===================================================
  // EXTREME
  // ===================================================

  else if (riskIndex == 3) {

    Serial.println(
      "ALERT: EXTREME"
    );


    // Blink red LED
    // with urgent buzzer

    for (
      int i = 0;
      i < 6;
      i++
    ) {

      digitalWrite(
        RED_LED,
        HIGH
      );


      beep(
        2300,
        150
      );


      digitalWrite(
        RED_LED,
        LOW
      );


      delay(120);
    }


    // Keep red LED ON
    // after warning sequence

    digitalWrite(
      RED_LED,
      HIGH
    );
  }
}


// =====================================================
// OLED DISPLAY
// =====================================================

void updateDisplay() {

  int motion =
      digitalRead(
        PIR_PIN
      );


  oled.clearDisplay();


  // ===================================================
  // HEADER
  // ===================================================

  oled.drawString(
    1,
    0,
    "HEATSENSE EDGE"
  );


  // ===================================================
  // PERSONA
  // ===================================================

  oled.drawString(
    0,
    2,
    "PERSON:"
  );


  oled.drawString(
    8,
    2,
    personas[
      personaIndex
    ]
  );


  // ===================================================
  // OCCUPANCY
  // ===================================================

  oled.drawString(
    0,
    4,
    "ROOM:"
  );


  if (
    motion == HIGH
  ) {

    oled.drawString(
      6,
      4,
      "OCCUPIED"
    );

  }

  else {

    oled.drawString(
      6,
      4,
      "EMPTY"
    );
  }


  // ===================================================
  // RISK
  // ===================================================

  oled.drawString(
    0,
    6,
    "RISK:"
  );


  oled.drawString(
    6,
    6,
    risks[
      riskIndex
    ]
  );
}


// =====================================================
// BRIDGE FUNCTIONS
// Python / FastAPI calls these
// =====================================================


// -----------------------------------------------------
// OCCUPANCY
//
// 0 = EMPTY
// 1 = OCCUPIED
// -----------------------------------------------------

int getOccupancy() {

  if (
    digitalRead(
      PIR_PIN
    )
    ==
    HIGH
  ) {

    return 1;
  }

  else {

    return 0;
  }
}


// -----------------------------------------------------
// PERSONA INDEX
// -----------------------------------------------------

int getPersona() {

  return personaIndex;
}


// -----------------------------------------------------
// RISK INDEX
// -----------------------------------------------------

int getRisk() {

  return riskIndex;
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(
    115200
  );


  // ===================================================
  // INPUTS
  // ===================================================

  pinMode(
    PIR_PIN,
    INPUT
  );


  pinMode(
    PERSONA_BUTTON,
    INPUT_PULLUP
  );


  pinMode(
    RISK_BUTTON,
    INPUT_PULLUP
  );


  // ===================================================
  // OUTPUTS
  // ===================================================

  pinMode(
    BUZZER_PIN,
    OUTPUT
  );


  pinMode(
    GREEN_LED,
    OUTPUT
  );


  pinMode(
    YELLOW_LED,
    OUTPUT
  );


  pinMode(
    RED_LED,
    OUTPUT
  );


  // ===================================================
  // START OUTPUTS OFF
  // ===================================================

  digitalWrite(
    BUZZER_PIN,
    LOW
  );


  allRiskLedsOff();


  // ===================================================
  // I2C
  // ===================================================

  Wire.begin();


  // ===================================================
  // OLED
  // ===================================================

  oled.setI2CAddress(
    0x3C * 2
  );


  oled.begin();


  oled.setPowerSave(
    0
  );


  oled.setFont(
    u8x8_font_chroma48medium8_r
  );


  // ===================================================
  // STARTUP DISPLAY
  // ===================================================

  oled.clearDisplay();


  oled.drawString(
    1,
    1,
    "HEATSENSE EDGE"
  );


  oled.drawString(
    2,
    3,
    "STARTING..."
  );


  // ===================================================
  // ARDUINO BRIDGE
  // ===================================================

  Bridge.begin();


  // Make Arduino data
  // available to Python

  Bridge.provide_safe(
    "get_occupancy",
    getOccupancy
  );


  Bridge.provide_safe(
    "get_persona",
    getPersona
  );


  Bridge.provide_safe(
    "get_risk",
    getRisk
  );


  Serial.println(
    "HeatSense Edge Ready"
  );


  delay(1500);


  // ===================================================
  // INITIAL STATE
  // ===================================================

  updateAlert();

  updateDisplay();
}


// =====================================================
// MAIN LOOP
// =====================================================

void loop() {


  // ===================================================
  // PERSONA BUTTON
  // ===================================================

  if (
    digitalRead(
      PERSONA_BUTTON
    )
    ==
    LOW
  ) {

    delay(50);


    // Confirm button
    // is actually pressed

    if (
      digitalRead(
        PERSONA_BUTTON
      )
      ==
      LOW
    ) {

      personaIndex++;


      if (
        personaIndex
        >=
        PERSONA_COUNT
      ) {

        personaIndex = 0;
      }


      Serial.print(
        "Persona: "
      );


      Serial.println(
        personas[
          personaIndex
        ]
      );


      updateDisplay();


      // Wait until
      // button released

      while (
        digitalRead(
          PERSONA_BUTTON
        )
        ==
        LOW
      ) {

        delay(10);
      }


      delay(150);
    }
  }


  // ===================================================
  // RISK TEST BUTTON
  //
  // Temporary manual/demo mode
  // Later sensors/model can
  // calculate risk automatically.
  // ===================================================

  if (
    digitalRead(
      RISK_BUTTON
    )
    ==
    LOW
  ) {

    delay(50);


    // Confirm button press

    if (
      digitalRead(
        RISK_BUTTON
      )
      ==
      LOW
    ) {

      riskIndex++;


      if (
        riskIndex
        >=
        RISK_COUNT
      ) {

        riskIndex = 0;
      }


      Serial.print(
        "Risk: "
      );


      Serial.println(
        risks[
          riskIndex
        ]
      );


      // Update OLED
      updateDisplay();


      // Update LEDs
      // and buzzer
      updateAlert();


      // Wait until
      // button released

      while (
        digitalRead(
          RISK_BUTTON
        )
        ==
        LOW
      ) {

        delay(10);
      }


      delay(150);
    }
  }


  // ===================================================
  // PIR CHANGE DETECTION
  // ===================================================

  int currentMotion =
      digitalRead(
        PIR_PIN
      );


  if (
    currentMotion
    !=
    previousMotion
  ) {

    previousMotion =
        currentMotion;


    if (
      currentMotion
      ==
      HIGH
    ) {

      Serial.println(
        "Occupancy: OCCUPIED"
      );

    }

    else {

      Serial.println(
        "Occupancy: EMPTY"
      );
    }


    updateDisplay();
  }


  // ===================================================
  // SMALL LOOP DELAY
  // ===================================================

  delay(50);
}