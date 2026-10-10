# HeatSense Edge

**BPUT Hackathon 2026 · Team BITBYBIT · BH26PS02T015**

Cooler rooms. Safer people. Smarter cities.

A complete React/Vite frontend with a seven-stage hardware story, GSAP scroll animation, an original SVG UNO Q illustration, and an operational status dashboard. JavaScript, React, GSAP/ScrollTrigger, Framer Motion, Recharts, and Lucide React.

## Run locally

Use Node.js 22 or later and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. If PowerShell blocks npm scripts, use `npm.cmd install` and `npm.cmd run dev`. Open the local address printed by Vite, normally http://127.0.0.1:5173.

```sh
npm test
npm run build
npm run preview
```

The production bundle is generated in `dist/`. Serve that directory with any static web server. This repository contains the frontend, not the Arduino firmware or FastAPI backend.

## Connect the real device

Set the backend origin in `.env` and restart Vite:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_CHAT_ENABLED=false
```

For a UNO Q on your LAN, use its reachable IP address or hostname instead of localhost. On another phone or computer, localhost means that phone or computer. Run Vite with `npm run dev -- --host 0.0.0.0` only when you want to expose the preview on your local network.

The frontend calls `GET /api/status` approximately every second. During `npm run dev`, Vite forwards same-origin `/device-api/api/status` requests to `${VITE_API_BASE_URL}/api/status`, so an existing backend works without CORS changes. Production builds call the configured backend URL directly. Requests are serialized (no overlap), time out after four seconds, abort on unmount, and recover automatically. A manual Retry connection button is also available.

```json
{
  "occupancy": "OCCUPIED",
  "persona": "WORKER",
  "risk": "HIGH",
  "bridge_connected": true
}
```

Supported risk values: `SAFE`, `MEDIUM`, `HIGH`, `EXTREME`. Personas: `GENERAL`, `WORKER`, `ELDERLY`, `CHILD`. Occupancy: `OCCUPIED`, `EMPTY`. Unknown enum values remain unknown. `bridge_connected` must be a JSON boolean. Only a confirmed bridge makes hardware values eligible for current display and history.

Optional numeric fields: `temperature`, `humidity`, `heat_index`, `radiant_temperature`, `light`, `activity`. Numbers must be finite JSON numbers; strings are not converted. `fan_status` can be `ON` / `OFF` or a boolean. Missing values show an integration or planned state. The activity field is displayed without an assumed unit until its hardware contract is defined.

Optional system fields: `ai_mode` (`offline` / `online`) and `ollama_status` (`ONLINE` / `OFFLINE` / `CHECKING`). If absent, the UI does not claim that either AI service is running. Browser network availability does not prove internet access, so Internet remains unverified unless the browser is explicitly offline.

On a failed request, current readings clear and the error state becomes visible. Up to 300 prior samples remain in memory and are explicitly labeled as recorded history while disconnected. Page reload clears session history. The risk chart reflects prototype risk states, which are manually simulated on the physical device.

### FastAPI CORS

The development proxy handles local cross-origin access automatically. For production or direct API access, the separately running backend must permit the frontend origin. For example, the backend owner can configure:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)
```

Use the actual frontend origin if Vite chooses another port or you access the app over your LAN. HTTPS deployments require an HTTPS backend or a same-origin reverse proxy; an HTTPS page cannot reliably call a plain HTTP device endpoint. `VITE_*` configuration is public and embedded at build time; never place credentials there.

## Prototype truth

| State | Capabilities |
| --- | --- |
| Confirmed prototype (per project brief) | UNO Q, OLED, PIR, green LED, active buzzer, physical persona button, manual risk simulation, MCU ↔ Linux Bridge, Python, FastAPI, status endpoint |
| Integrating | BME688, BH1750, MPU6050, DS18B20 |
| In development / planned | Automatic deterministic risk assessment, fan actuation, airflow measurement, edge prediction, Ollama, cloud assistant, LoRa multi-node network |

The SVG board is a conceptual illustration, not an exact pinout. Animated occupancy, example risk responses and the forecast are explicitly illustrative. No story values enter the live dashboard. The architecture distinguishes the current prototype from the target system. The deterministic local risk engine owns future safety decisions; the LLM only explains them. This frontend does not actuate hardware.

## Persona and assistant integration

The dashboard's active persona always comes from hardware. Persona buttons preview explanatory context, with a separate device marker. They do not send a control request. Implement the adapter in `src/services/api.js` when a supported persona endpoint is available.

Chat sending is disabled by default. Once the backend actually implements `POST /api/chat`, set `VITE_CHAT_ENABLED=true` and restart/rebuild. The payload includes the selected interface language:

```json
{ "message": "Why is the room unsafe?", "language": "en" }
```

Expected response:

```json
{ "response": "An actual response from your backend.", "mode": "offline" }
```

Language values: `en`, `hi`, `od` (Odia). The backend is responsible for honoring the chosen language. Response modes are displayed only when actually reported. Missing endpoints, malformed responses, timeouts, and server errors show an error; there are no canned assistant replies. Suggested questions only populate the composer.

## Design and accessibility

- Desktop: GSAP pins the board while seven narrative sections scroll. The board rotates slowly, signal traces animate, and each stage reveals its own diagram.
- Tablet/phone: the story becomes readable sequential panels with each diagram visible; the expensive pinned transform is removed.
- Reduced motion: CSS animations are removed, GSAP pin animation is disabled, and Framer Motion honors the user preference.
- Semantic sections, skip link, visible focus states, keyboard-operable navigation and controls, labeled inputs, and responsive charts.
- EN / HI / OD translations cover primary navigation, hero headline, dashboard controls, status labels, sensor labels, persona names, and suggested questions. Technical narrative and secondary explanatory copy currently remain English; translations are centralized in `src/i18n.jsx` for further localization. Odia uses the standard `or` document language tag.
- Web fonts have system fallbacks so the app remains usable without internet. No remote image dependencies.

## Source map

```text
src/
  App.jsx
  main.jsx
  i18n.jsx
  styles.css
  hooks/useDevice.js
  services/api.js
  services/status.js
  components/
    Navbar.jsx
    Hero.jsx
    Board.jsx
    UnoQExperience.jsx
    Dashboard.jsx
    HeatChart.jsx
    PersonaSelector.jsx
    DeviceStatus.jsx
    AIChat.jsx
    SystemArchitecture.jsx
tests/status.test.js
```

API validation tests cover unknown states, missing optional sensors, zero-valued measurements, malformed payloads, and disconnected-bridge history. Real hardware and assistant integration require the separately supplied backend.

## Verification completed

- Dependency installation: successful, no vulnerabilities reported by npm at installation.
- `npm test`: all six status-validation tests passed.
- `npm run build`: production bundle generated successfully.
- `npm run dev`: served HTTP 200 and rendered in the browser.
- The existing local FastAPI endpoint was reached through the development proxy. Occupancy, persona, risk, and bridge connectivity displayed from actual API responses; occupancy changes appeared without a refresh.
- Real risk-history samples accumulated in the chart. Missing environmental readings stayed empty.
- Tested persona previews without changing the reported device persona, disabled chat submission, suggested-question selection, chart tabs, architecture component selection, and mobile navigation.
- Checked desktop (1440 × 900) and phone (390 × 844) layouts, including Hindi and Odia controls. No horizontal page overflow was observed on the phone viewport.
- The unavailable-backend state was verified before the proxy was connected. No browser runtime errors were reported in the final checks.

Saved previews are in `screenshots/`. End-to-end assistant responses, automatic risk assessment, and planned actuators were not tested because those capabilities are not part of the supplied backend contract.
