**Yutori Labs: Pulse Sauna Sensor**  
Turn the sauna you already own into a measured, coach‑guided practice.

***

## What it is

Pulse Sauna Sensor is a RuuviTag Pro–class Bluetooth sensor plus the Yutori mobile app. You mount the sensor in your existing sauna and immediately get live temperature and humidity, automatic session logging, HR/HRV integration from your wearable, and Yutori Coach guidance—no new heater or cabin required. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

***

## Works with your current setup

- Any traditional electric, wood‑fired, barrel, indoor, or outdoor sauna.  
- Infrared saunas (you still see temperature curves and timing, just at lower temps).  
- Apple Watch via Apple Health, with other wearables supported through health connectors. [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)

If the space gets hot and your phone can see Bluetooth, Pulse Sauna Sensor can instrument it.

***

## What the app does for sauna sessions

### Live dashboard

- Real‑time **temperature** and **relative humidity** from the sensor at bench height. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)
- **Session timer**, heart rate, and HRV (when paired with a compatible wearable). [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)
- Optional “sauna ready” alert when your room reaches the **temperature you choose**, not a generic number. [vaisala](https://www.vaisala.com/en/blog/2024-12/can-you-handle-heat-and-humidity-finnish-sauna-vaisala-sensors-can)

### Automatic logging

- Sensor broadcasts about 0.8 times per second and logs internally every 5 minutes, with ~10 days of offline history. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)
- Each session is saved with duration, temperature curve, humidity trend, peak heart rate, and HRV change, and can be written into Apple Health as a workout. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

### Live Coach guidance

With Premium enabled, Yutori Coach treats every sauna round like a structured set:

- Builds a **personal timing window** from your own last sessions, current temperature zone, and demographics (age, sex, height, weight). [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)
- Watches **guardrails**:  
  - HR ceiling ≈85% of age‑predicted max.  
  - Dangerous temperature zones.  
  - Hard maximum durations for sauna. [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)
- Gives simple, in‑session feedback—“building up”, “in the zone”, or “time to wrap”—instead of vague encouragement. [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)

### Longer‑term trends and protocols

Over weeks, the same data becomes:

- How many sauna sessions you actually do per week, and when.  
- The temperature and humidity bands you gravitate toward.  
- Trends in HRV, resting HR, peak HR at your usual temperature, and tolerance. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

A Supabase‑hosted analysis service turns that into:

- Short insights tied to real numbers (“your first‑round HRV is up 10% over 8 weeks”). [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)
- Optional multi‑week sauna or heat+cold protocols with conservative dosing and clear safety notes. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

***

## Smart humidity and comfort cues

Because the sensor measures humidity as well as temperature:

- The app can recognize when humidity is very low at a given temperature and gently suggest adding a bit of water to the rocks for softer, less harsh heat. [finnishsaunabuilders](https://finnishsaunabuilders.com/blogs/sauna-news/how-to-manage-humidity-in-your-sauna-for-the-best-experience-finding-the-perfect-balance-for-optimal-relaxation)
- When both humidity and temperature are high, it can recommend shorter rounds and longer cool‑downs, since high humidity impairs evaporative cooling and increases strain. [onlinelibrary.wiley](https://onlinelibrary.wiley.com/doi/10.1111/sms.70041)

You stay in control, but not guessing.

***

## Safety net for harder sessions

Pulse Sauna Sensor also unlocks Yutori’s safety layer:

- Customizable alerts, session timers, and emergency contacts in the app.  
- If a session looks seriously wrong—e.g., prolonged exposure, lack of response, concerning vitals—the app can escalate: louder local alerts, notifying your contacts, and, where supported, triggering an emergency‑call workflow via your device. [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544)

This depends on your phone, network, and configuration. It’s a backup, not a medical monitor, and doesn’t replace common sense or supervision.

***

## Hardware details

Built on a RuuviTag Pro–grade platform: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)

- **Measurements**: Temperature, relative humidity, air pressure, motion.  
- **Temperature range**: −40 to 85 °C (−40 to 185 °F), typical accuracy ±0.1–0.2 °C in 5–60 °C.  
- **Humidity**: 0–95% RH (non‑condensing), typical ±2% in 20–80% RH.  
- **Protection**: IP67/IP68/IP69K enclosure options, polycarbonate housing, O‑ring and vent membrane.  
- **Battery**: CR2477T coin cell, user‑replaceable, ~1–2 years typical life at 0.8 Hz broadcast rate.  
- **Radio**: BLE 5.0, ~5–20 m indoor range depending on walls and your phone’s antenna.

Recommended placement: at or near **bench height**, away from direct heater exhaust, matching Ruuvi’s own sauna guidance. [vaisala](https://www.vaisala.com/en/blog/2024-12/can-you-handle-heat-and-humidity-finnish-sauna-vaisala-sensors-can)

***

## Pricing & tiers

Aligned with your plan: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

- **Pulse Sauna Sensor + App** – **60 USD** (one‑time)  
  - Hardware sensor, live temp/RH, “sauna ready” alerts, basic session history.

- **Yutori Premium** – **4.99 USD/month** or **39.99 USD/year**  
  - HR/HRV integration, Live Coach timing windows and guardrails, long‑term trends, AI insights, protocols, and safety workflows. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

- **Included with Pulse Sauna**  
  - Every Yutori Labs: Pulse Sauna includes a sensor and **lifetime Premium** for that unit’s owner. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx)

***

## Quick spec table

| Category        | Detail                                                                 |
|----------------|-------------------------------------------------------------------------|
| Product        | Yutori Labs: Pulse Sauna Sensor                                        |
| Type           | BLE environmental sensor + Yutori mobile app                           |
| Measurements   | Temperature, humidity, pressure, motion [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)                      |
| Temp range     | −40 to 85 °C (−40 to 185 °F) [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)                                 |
| Humidity range | 0–95% RH, ±2% accuracy in 20–80% band [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)                        |
| Protection     | IP67/IP68/IP69K polycarbonate enclosure [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)                      |
| Battery        | CR2477T, user‑replaceable, ~1–2 years typical life [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)           |
| Radio          | BLE 5.0, 5–20 m indoor range [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/796a734d-2f0d-4851-bf88-84c9ac432fde/ruuvitag-tech-spec-2023-04.pdf)                                 |
| Platforms      | iOS app; Apple Health integration, other wearables via connectors [ascopubs](https://ascopubs.org/doi/10.1200/JCO.2022.40.16_suppl.8544) |
| Use            | Any sauna; also compatible with cold‑plunge setups using same app [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/146956071/bedde126-d302-44d9-9794-7ea1ce57fb05/Sauna-Business-Plan.docx) |

