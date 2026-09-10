# Machine Learning Layer (SIH26002)

## Design Philosophy: No Premature AI
In accordance with SIH engineering rigor, ML models are isolated from the core operational routing loop. No fake predictions or hardcoded percentages are used in Phase 1.

## Future ML Subsystems (Phase 2)
1. **TravelTimePredictor (LightGBM)**:
   - Features: Segment elevation slope, weather intensity (precipitation mm/hr), vehicle gross weight, historical monsoon travel delay factors.
2. **DisruptionRiskPredictor (LightGBM / Random Forest)**:
   - Features: Soil saturation index, cumulative 72h rainfall, terrain steepness, river basin flood discharge levels.
3. **DemandForecaster (LSTM / Temporal Fusion Transformer)**:
   - Forecasts essential medicine and grain consumption across isolated hill district headquarters.
