from arduino.app_utils import App, Bridge

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import uvicorn
import threading
import time
import json
import urllib.request
import urllib.error
import os


# ======================================================
# HEATSENSE EDGE
# Linux + FastAPI + Ollama Side
# Version 3.0
# ======================================================


# ======================================================
# FASTAPI APP
# ======================================================

api = FastAPI(
    title="HeatSense Edge API",
    version="3.0"
)


# ======================================================
# CORS
# ======================================================

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ======================================================
# PERSONAS
# ======================================================

PERSONAS = [
    "GENERAL",
    "WORKER",
    "ELDERLY",
    "CHILD"
]


# ======================================================
# RISK LEVELS
# ======================================================

RISKS = [
    "SAFE",
    "MEDIUM",
    "HIGH",
    "EXTREME"
]


# ======================================================
# OLLAMA CONFIGURATION
# ======================================================

# Ollama runs on UNO Q Linux host.
# FastAPI runs inside Docker.
# Docker host gateway currently = 172.19.0.1

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://172.19.0.1:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:0.5b"
)

OLLAMA_CHAT_URL = (
    f"{OLLAMA_BASE_URL}/api/chat"
)

OLLAMA_TAGS_URL = (
    f"{OLLAMA_BASE_URL}/api/tags"
)

OLLAMA_GENERATE_URL = (
    f"{OLLAMA_BASE_URL}/api/generate"
)


# Ollama on UNO Q is CPU-only.
# Give it enough time.

OLLAMA_TIMEOUT = 120


# Try twice before using a safe local fallback.

OLLAMA_RETRIES = 2


# ======================================================
# LOCKS
# ======================================================

# Protect live HeatSense state

status_lock = threading.Lock()


# Very important:
# only ONE Ollama generation at a time.

ollama_lock = threading.Lock()


# ======================================================
# CURRENT HEATSENSE STATE
# ======================================================

heatsense_status = {

    "occupancy": "UNKNOWN",

    "persona": "GENERAL",

    "risk": "SAFE",

    "bridge_connected": False

}


# ======================================================
# CHAT MODEL
# ======================================================

class ChatRequest(BaseModel):

    message: str


# ======================================================
# HELPER:
# PERSONA GUIDANCE
# ======================================================

def get_persona_guidance(persona):

    if persona == "WORKER":

        return (
            "Give worker-focused guidance. "
            "Prioritize reducing strenuous activity, "
            "cooling breaks, hydration, rest, and "
            "rechecking the HeatSense risk before "
            "resuming heavy work."
        )

    elif persona == "ELDERLY":

        return (
            "Use calm and respectful language. "
            "Prioritize cooling, hydration, avoiding "
            "prolonged heat exposure, and getting "
            "assistance when appropriate."
        )

    elif persona == "CHILD":

        return (
            "Use simple language. "
            "Prioritize moving to a cooler place, "
            "drinking water, reducing strenuous activity, "
            "and informing or staying with a responsible adult."
        )

    else:

        return (
            "Give clear general heat-safety guidance "
            "without assuming medical conditions."
        )


# ======================================================
# HELPER:
# VERIFIED LOCAL FALLBACK
#
# This is used ONLY if Ollama genuinely fails.
# It never invents measurements.
# ======================================================

def get_local_fallback_answer(
    user_message,
    occupancy,
    persona,
    risk,
    bridge_connected
):

    message = user_message.lower()

    connection = (
        "CONNECTED"
        if bridge_connected
        else "DISCONNECTED"
    )


    # --------------------------------------------------
    # STATUS
    # --------------------------------------------------

    if (
        "status" in message
        or "what is happening" in message
    ):

        return (
            f"HeatSense currently reports "
            f"Occupancy: {occupancy}, "
            f"Persona: {persona}, "
            f"Risk: {risk}, "
            f"and Arduino Bridge: {connection}."
        )


    # --------------------------------------------------
    # OCCUPANCY
    # --------------------------------------------------

    if (
        "occupancy" in message
        or "occupied" in message
        or "someone in the room" in message
        or "anyone in the room" in message
    ):

        return (
            f"The current room occupancy is "
            f"{occupancy}."
        )


    # --------------------------------------------------
    # CURRENT RISK
    # --------------------------------------------------

    if (
        "risk" in message
        and "why" not in message
    ):

        return (
            f"The current HeatSense risk "
            f"level is {risk}."
        )


    # --------------------------------------------------
    # WHY RISK
    # --------------------------------------------------

    if (
        "why" in message
        and "risk" in message
    ):

        return (
            f"HeatSense currently reports the risk "
            f"level as {risk}. "
            f"Detailed live temperature and humidity "
            f"values are not currently available, "
            f"so HeatSense will not invent a specific "
            f"environmental cause."
        )


    # --------------------------------------------------
    # TEMPERATURE
    # --------------------------------------------------

    if (
        "temperature" in message
        or "how hot" in message
        or "temp" in message
    ):

        return (
            "Live temperature data is not currently "
            "available through the HeatSense API. "
            "The environmental sensor integration "
            "is still in progress."
        )


    # --------------------------------------------------
    # HUMIDITY
    # --------------------------------------------------

    if (
        "humidity" in message
        or "humid" in message
    ):

        return (
            "Live humidity data is not currently "
            "available through the HeatSense API. "
            "The environmental sensor integration "
            "is still in progress."
        )


    # --------------------------------------------------
    # FUTURE WEATHER / COOLING
    # --------------------------------------------------

    if (
        "one hour" in message
        or "1 hour" in message
        or "when will" in message
        or "forecast" in message
        or "future temperature" in message
        or "will it be cooler" in message
        or "will it become cooler" in message
    ):

        persona_text = get_persona_guidance(
            persona
        )

        return (
            "HeatSense does not currently have "
            "verified future-condition data, so it "
            "cannot reliably predict when the room "
            "will become cooler. "
            + persona_text
        )


    # --------------------------------------------------
    # WORKER
    # --------------------------------------------------

    if (
        "worker persona" in message
        or "worker" in message
    ):

        return (
            "The Worker persona is intended for "
            "people performing physical work. "
            "HeatSense focuses its guidance on "
            "workload, cooling breaks, hydration, "
            "rest, and reassessing risk before "
            "returning to strenuous activity."
        )


    # --------------------------------------------------
    # ELDERLY
    # --------------------------------------------------

    if "elderly" in message:

        return (
            "The Elderly persona provides calm, "
            "more cautious guidance focused on "
            "cooling, hydration, avoiding prolonged "
            "heat exposure, and getting assistance "
            "when appropriate."
        )


    # --------------------------------------------------
    # CHILD
    # --------------------------------------------------

    if (
        "child persona" in message
        or "child" in message
    ):

        return (
            "The Child persona uses simpler guidance "
            "and emphasizes moving to a cooler place, "
            "drinking water, reducing strenuous "
            "activity, and involving a responsible adult."
        )


    # --------------------------------------------------
    # ARDUINO UNO Q
    # --------------------------------------------------

    if (
        "arduino uno q" in message
        or "why do you use arduino" in message
    ):

        return (
            "HeatSense uses Arduino UNO Q because it "
            "combines real-time microcontroller control "
            "with a Linux computing environment. "
            "The MCU handles hardware interaction while "
            "Linux runs Python, FastAPI, the web connection, "
            "and the local Ollama assistant."
        )


    # --------------------------------------------------
    # HOW HEATSENSE WORKS
    # --------------------------------------------------

    if (
        "how heatsense works" in message
        or "how does heatsense work" in message
        or "explain heatsense" in message
    ):

        return (
            "HeatSense connects physical sensing and "
            "local safety logic with Arduino UNO Q. "
            "The MCU handles hardware such as occupancy, "
            "alerts and risk state, Arduino Bridge sends "
            "the state to Python, FastAPI exposes it to "
            "the website, and Ollama provides the local "
            "conversational explanation layer."
        )


    # --------------------------------------------------
    # GENERAL VERIFIED FALLBACK
    # --------------------------------------------------

    return (
        f"HeatSense is currently operating with "
        f"Persona: {persona}, Risk: {risk}, "
        f"Occupancy: {occupancy}, and Arduino Bridge: "
        f"{connection}. "
        f"I can explain HeatSense, the current system "
        f"state, personas, risk levels, Arduino UNO Q, "
        f"and the project architecture."
    )


# ======================================================
# HELPER:
# BUILD STRICT SYSTEM PROMPT
# ======================================================

def build_system_prompt(
    occupancy,
    persona,
    risk,
    bridge_connected
):

    persona_guidance = (
        get_persona_guidance(
            persona
        )
    )

    return f"""
You are HeatSense Edge, the local offline conversational
assistant running on Arduino UNO Q.

You are NOT a generic chatbot.

You are the explanation layer for the HeatSense Edge
heat-safety prototype.

==================================================
AUTHORITATIVE LIVE DATA
==================================================

Occupancy: {occupancy}
Persona: {persona}
Risk: {risk}
Arduino Bridge Connected: {bridge_connected}

These values are authoritative.

Never contradict them.

==================================================
PERSONA GUIDANCE
==================================================

Current persona: {persona}

{persona_guidance}

The persona changes HOW guidance is communicated.

The persona does NOT allow you to invent or change:
- risk
- temperature
- humidity
- occupancy
- forecasts
- sensor measurements

==================================================
CONFIRMED WORKING FEATURES
==================================================

LIVE:

- Arduino UNO Q
- STM32 real-time MCU
- Linux side
- PIR occupancy detection
- OLED
- Green, Yellow and Red risk LEDs
- Active buzzer
- Physical persona button
- Physical manual risk-test button
- Arduino Bridge
- Python
- FastAPI
- React website
- GET /api/status
- POST /api/chat
- Local Ollama
- qwen2.5:0.5b

==================================================
CURRENTLY BEING INTEGRATED
==================================================

Do NOT describe these as live yet:

- BME688
- BH1750
- MPU6050
- DS18B20 probes

==================================================
PLANNED / FUTURE
==================================================

Do NOT describe these as completed:

- automatic sensor-derived risk
- automatic fan control
- airflow measurement
- future heat prediction
- LoRa multi-node networking
- cloud AI enhancement

==================================================
CRITICAL TRUTH RULES
==================================================

1. Never invent sensor readings.

2. Never invent temperature.

3. Never invent humidity.

4. Never invent heat index.

5. Never invent radiant temperature.

6. Never invent future temperature.

7. Never invent future weather.

8. Never invent cooling time.

9. Never say conditions will become cooler
   after one hour unless verified forecast data
   is explicitly provided.

10. Never invent power-source information.

11. Never say the system is battery powered
    unless that information is explicitly given.

12. Never invent hardware status.

13. Never claim BME688, BH1750, MPU6050
    or DS18B20 are currently live.

14. The current risk value is authoritative.

15. Never change or override the current risk.

16. If asked WHY the risk is HIGH, MEDIUM,
    EXTREME or SAFE, do not invent a cause.

17. If environmental measurements are unavailable,
    say that the detailed cause cannot currently
    be determined from available live data.

18. The current prototype can use manual risk
    simulation while automatic environmental
    risk sensing is being integrated.

19. Ollama does NOT control LEDs.

20. Ollama does NOT control the buzzer.

21. Ollama does NOT control the OLED.

22. Ollama does NOT control the fan.

23. Safety decisions belong to the local
    HeatSense MCU/risk system.

24. Your role is explanation and conversation.

25. Never diagnose medical conditions.

26. If someone describes a serious heat-related
    medical emergency, recommend appropriate
    professional or emergency medical assistance.

27. If you do not know something, say:
    "That information is not currently available."

28. Never fill missing information with assumptions.

29. Keep responses concise.

30. Prefer 2 to 5 short sentences unless the
    user specifically asks for a detailed explanation.

==================================================
FUTURE PREDICTION RULE
==================================================

HeatSense currently does NOT have verified prediction
data available to you.

If asked:

"When will it become cooler?"
"Will it be cooler in one hour?"
"What will happen after one hour?"
"What will the temperature be later?"

say clearly that verified future-condition data is
not currently available.

Then provide persona-appropriate advice without
inventing a forecast.

==================================================
ANSWER STYLE
==================================================

Speak naturally.

Be clear.

Be concise.

Use the current HeatSense persona when giving guidance.

Never pretend unavailable information is known.
"""


# ======================================================
# HELPER:
# CALL OLLAMA WITH RETRY
# ======================================================

def call_ollama(
    user_message,
    system_prompt
):

    payload = {

        "model":
            OLLAMA_MODEL,

        "messages": [

            {
                "role":
                    "system",

                "content":
                    system_prompt
            },

            {
                "role":
                    "user",

                "content":
                    user_message
            }

        ],

        "stream":
            False,


        # Keep model loaded for 30 minutes.
        # This makes later responses faster.

        "keep_alive":
            "30m",


        "options": {

            # Very low creativity
            # reduces hallucination risk.

            "temperature":
                0.0,


            # Keep context manageable
            # on UNO Q.

            "num_ctx":
                2048,


            # Keep answer short and fast.

            "num_predict":
                140

        }

    }


    encoded_data = json.dumps(
        payload
    ).encode(
        "utf-8"
    )


    last_error = None


    # --------------------------------------------------
    # Only one Ollama request at a time
    # --------------------------------------------------

    with ollama_lock:


        for attempt in range(
            1,
            OLLAMA_RETRIES + 1
        ):

            try:

                request = (
                    urllib.request.Request(

                        OLLAMA_CHAT_URL,

                        data=encoded_data,

                        headers={
                            "Content-Type":
                                "application/json"
                        },

                        method="POST"

                    )
                )


                print(
                    f"Ollama request "
                    f"{attempt}/{OLLAMA_RETRIES}",
                    flush=True
                )


                with urllib.request.urlopen(
                    request,
                    timeout=OLLAMA_TIMEOUT
                ) as response:

                    result = json.loads(
                        response
                        .read()
                        .decode(
                            "utf-8"
                        )
                    )


                assistant_message = (

                    result
                    .get(
                        "message",
                        {}
                    )
                    .get(
                        "content",
                        ""
                    )
                    .strip()

                )


                if assistant_message:

                    return (
                        assistant_message,
                        None
                    )


                last_error = (
                    "Ollama returned "
                    "an empty response."
                )


            except Exception as error:

                last_error = str(
                    error
                )


                print(

                    f"Ollama attempt "
                    f"{attempt} failed:",

                    error,

                    flush=True

                )


                # Short pause before retry

                if (
                    attempt
                    <
                    OLLAMA_RETRIES
                ):

                    time.sleep(1)


    return (
        None,
        last_error
    )


# ======================================================
# HELPER:
# PRE-WARM OLLAMA
#
# Loads model once at startup.
# ======================================================

def warm_ollama_model():

    try:

        payload = {

            "model":
                OLLAMA_MODEL,

            "prompt":
                "",

            "stream":
                False,

            "keep_alive":
                "30m"

        }


        encoded_data = json.dumps(
            payload
        ).encode(
            "utf-8"
        )


        request = (
            urllib.request.Request(

                OLLAMA_GENERATE_URL,

                data=encoded_data,

                headers={
                    "Content-Type":
                        "application/json"
                },

                method="POST"

            )
        )


        with ollama_lock:

            with urllib.request.urlopen(
                request,
                timeout=60
            ) as response:

                response.read()


        print(
            "Ollama model warmed and ready.",
            flush=True
        )


    except Exception as error:

        # Do not crash HeatSense
        # if warm-up fails.

        print(
            "Ollama warm-up warning:",
            error,
            flush=True
        )


# ======================================================
# HOME
# ======================================================

@api.get("/")
def home():

    return {

        "name":
            "HeatSense Edge",

        "version":
            "3.0",

        "message":
            "HeatSense Edge API is running",

        "endpoints": {

            "status":
                "/api/status",

            "ai_status":
                "/api/ai/status",

            "chat":
                "/api/chat"

        }

    }


# ======================================================
# LIVE STATUS API
# ======================================================

@api.get("/api/status")
def get_status():

    with status_lock:

        return dict(
            heatsense_status
        )


# ======================================================
# AI STATUS API
# ======================================================

@api.get("/api/ai/status")
def get_ai_status():

    try:

        request = urllib.request.Request(
            OLLAMA_TAGS_URL,
            method="GET"
        )


        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            result = json.loads(
                response
                .read()
                .decode(
                    "utf-8"
                )
            )


        models = result.get(
            "models",
            []
        )


        installed_models = [

            model.get(
                "name",
                ""
            )

            for model in models

        ]


        model_available = (
            OLLAMA_MODEL
            in installed_models
        )


        return {

            "online":
                True,

            "mode":
                "OFFLINE_LOCAL",

            "provider":
                "Ollama",

            "model":
                OLLAMA_MODEL,

            "model_available":
                model_available,

            "ready":
                model_available

        }


    except Exception as error:

        print(
            "AI status check warning:",
            error,
            flush=True
        )


        return {

            "online":
                False,

            "mode":
                "LOCAL_FALLBACK",

            "provider":
                "HeatSense",

            "model":
                OLLAMA_MODEL,

            "model_available":
                False,

            "ready":
                False

        }


# ======================================================
# CHAT ENDPOINT
# ======================================================

@api.post("/api/chat")
def chat_with_heatsense(
    request: ChatRequest
):


    # --------------------------------------------------
    # Clean message
    # --------------------------------------------------

    user_message = (
        request.message.strip()
    )


    if not user_message:

        return {

            "response":
                "Please ask me something about HeatSense.",

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None

        }


    # --------------------------------------------------
    # Get authoritative live state
    # --------------------------------------------------

    with status_lock:

        current_status = dict(
            heatsense_status
        )


    occupancy = (
        current_status.get(
            "occupancy",
            "UNKNOWN"
        )
    )


    persona = (
        current_status.get(
            "persona",
            "GENERAL"
        )
    )


    risk = (
        current_status.get(
            "risk",
            "UNKNOWN"
        )
    )


    bridge_connected = (
        current_status.get(
            "bridge_connected",
            False
        )
    )


    message_lower = (
        user_message.lower()
    )


    # ==================================================
    # EXACT LIVE FACT QUESTIONS
    #
    # These DO NOT need an LLM.
    #
    # This is intentional because the actual
    # hardware state is already known exactly.
    # ==================================================


    # --------------------------------------------------
    # CURRENT STATUS
    # --------------------------------------------------

    status_keywords = [

        "current status",

        "system status",

        "heatsense status",

        "what is the status",

        "status right now",

        "what is happening now"

    ]


    if any(
        keyword in message_lower
        for keyword in status_keywords
    ):

        connection = (
            "CONNECTED"
            if bridge_connected
            else "DISCONNECTED"
        )


        return {

            "response":
                (
                    f"HeatSense currently reports "
                    f"Occupancy: {occupancy}, "
                    f"Persona: {persona}, "
                    f"Risk: {risk}, "
                    f"and Arduino Bridge: "
                    f"{connection}."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # --------------------------------------------------
    # OCCUPANCY
    # --------------------------------------------------

    occupancy_keywords = [

        "occupancy",

        "room occupied",

        "is the room occupied",

        "someone in the room",

        "anyone in the room"

    ]


    if any(
        keyword in message_lower
        for keyword in occupancy_keywords
    ):

        return {

            "response":
                (
                    f"The current room "
                    f"occupancy is {occupancy}."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # --------------------------------------------------
    # SELECTED PERSONA
    # --------------------------------------------------

    if (
        "current persona" in message_lower
        or "selected persona" in message_lower
        or "which persona" in message_lower
    ):

        return {

            "response":
                (
                    f"The currently selected "
                    f"HeatSense persona is "
                    f"{persona}."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # --------------------------------------------------
    # CURRENT RISK
    # --------------------------------------------------

    if (
        (
            "current risk" in message_lower
            or "risk level" in message_lower
            or "what is my risk" in message_lower
            or "what is the risk" in message_lower
        )
        and
        "why" not in message_lower
    ):

        return {

            "response":
                (
                    f"The current HeatSense "
                    f"risk level is {risk}."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # --------------------------------------------------
    # TEMPERATURE
    #
    # We intentionally answer this locally
    # because no verified live temperature
    # is available yet.
    # --------------------------------------------------

    if (
        "temperature" in message_lower
        or "how hot" in message_lower
        or "temp" in message_lower
    ):

        # Future / prediction question
        if (
            "future" in message_lower
            or "later" in message_lower
            or "hour" in message_lower
            or "when" in message_lower
        ):

            return {

                "response":
                    (
                        "HeatSense does not currently "
                        "have verified future-temperature "
                        "data, so I cannot reliably predict "
                        "when conditions will become cooler."
                    ),

                "mode":
                    "local_system",

                "provider":
                    "HeatSense",

                "model":
                    None,

                "live_context":
                    current_status

            }


        return {

            "response":
                (
                    "Live temperature data is not "
                    "currently available through the "
                    "HeatSense API. The temperature "
                    "sensor integration is still "
                    "in progress."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # --------------------------------------------------
    # HUMIDITY
    # --------------------------------------------------

    if (
        "humidity" in message_lower
        or "humid" in message_lower
    ):

        return {

            "response":
                (
                    "Live humidity data is not "
                    "currently available through "
                    "the HeatSense API. The "
                    "environmental sensor integration "
                    "is still in progress."
                ),

            "mode":
                "local_system",

            "provider":
                "HeatSense",

            "model":
                None,

            "live_context":
                current_status

        }


    # ==================================================
    # ALL OTHER QUESTIONS:
    # TRY LOCAL OLLAMA
    # ==================================================

    system_prompt = (
        build_system_prompt(
            occupancy,
            persona,
            risk,
            bridge_connected
        )
    )


    assistant_message, ollama_error = (
        call_ollama(
            user_message,
            system_prompt
        )
    )


    # ==================================================
    # OLLAMA SUCCESS
    # ==================================================

    if assistant_message:

        print(
            "HeatSense Ollama ->",
            assistant_message,
            flush=True
        )


        return {

            "response":
                assistant_message,

            "mode":
                "offline_ai",

            "provider":
                "Ollama",

            "model":
                OLLAMA_MODEL,

            "live_context":
                current_status

        }


    # ==================================================
    # OLLAMA FAILED AFTER RETRIES
    #
    # DO NOT SHOW UGLY ERROR TO USER.
    #
    # Give a verified HeatSense response instead.
    # ==================================================

    print(
        "Ollama unavailable after retries:",
        ollama_error,
        flush=True
    )


    fallback_response = (
        get_local_fallback_answer(
            user_message,
            occupancy,
            persona,
            risk,
            bridge_connected
        )
    )


    return {

        "response":
            fallback_response,

        "mode":
            "local_fallback",

        "provider":
            "HeatSense",

        "model":
            None,

        "live_context":
            current_status

    }


# ======================================================
# FASTAPI SERVER
# ======================================================

def start_api():

    uvicorn.run(

        api,

        host="0.0.0.0",

        port=8000,

        log_level="info"

    )


# ======================================================
# START FASTAPI THREAD
# ======================================================

api_thread = threading.Thread(

    target=start_api,

    daemon=True

)

api_thread.start()


# ======================================================
# PRE-WARM OLLAMA IN BACKGROUND
# ======================================================

warm_thread = threading.Thread(

    target=warm_ollama_model,

    daemon=True

)

warm_thread.start()


# ======================================================
# MAIN HEATSENSE HARDWARE LOOP
# ======================================================

def loop():

    try:


        # --------------------------------------------------
        # Read STM32 through Arduino Bridge
        # --------------------------------------------------

        occupancy = Bridge.call(
            "get_occupancy"
        )


        persona_index = Bridge.call(
            "get_persona"
        )


        risk_index = Bridge.call(
            "get_risk"
        )


        # --------------------------------------------------
        # OCCUPANCY
        # --------------------------------------------------

        if occupancy == 1:

            occupancy_text = (
                "OCCUPIED"
            )

        else:

            occupancy_text = (
                "EMPTY"
            )


        # --------------------------------------------------
        # PERSONA
        # --------------------------------------------------

        if (
            0 <= persona_index
            < len(PERSONAS)
        ):

            persona_text = (
                PERSONAS[
                    persona_index
                ]
            )

        else:

            persona_text = (
                "UNKNOWN"
            )


        # --------------------------------------------------
        # RISK
        # --------------------------------------------------

        if (
            0 <= risk_index
            < len(RISKS)
        ):

            risk_text = (
                RISKS[
                    risk_index
                ]
            )

        else:

            risk_text = (
                "UNKNOWN"
            )


        # --------------------------------------------------
        # UPDATE LIVE STATE
        # --------------------------------------------------

        with status_lock:

            heatsense_status[
                "occupancy"
            ] = occupancy_text


            heatsense_status[
                "persona"
            ] = persona_text


            heatsense_status[
                "risk"
            ] = risk_text


            heatsense_status[
                "bridge_connected"
            ] = True


        # --------------------------------------------------
        # CONSOLE
        # --------------------------------------------------

        print(

            f"HeatSense -> "
            f"{occupancy_text} | "
            f"{persona_text} | "
            f"{risk_text}",

            flush=True

        )


    except Exception as error:


        with status_lock:

            heatsense_status[
                "bridge_connected"
            ] = False


        print(

            "Bridge error:",

            error,

            flush=True

        )


    time.sleep(1)


# ======================================================
# START ARDUINO APPLICATION
# ======================================================

App.run(
    user_loop=loop
)