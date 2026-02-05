# Energymanager Card for HomeAssistant
In the past i used homee as main system. But during the time, limitation grew. However, the Energymanager view was pretty good, so i created a version for my new lovelace dashboard.

## Code sample for dashboard yaml
```
type: custom:energy-manager-card
power_consumption: sensor.total_consumed_power
pc_summarized: 0
grid_power: sensor.grid_power_total
solar_power: sensor.solar_produced_power
battery_charging_state: sensor.pv_battery_loadlevel
battery_power: sensor.pv_battery_powerflow
```
