import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@latest/lit-element.js?module";

console.info(
  '\n %c Energy Manager Card %c v1.1.0 %c \n',
  'background-color: #777;color: #fff;padding: 3px 2px 3px 3px;border-radius: 3px 0 0 3px;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
  'background-color: #bc81e0;background-image: linear-gradient(90deg, #1f7a1f, #33cc33);color: #fff;padding: 3px 3px 3px 2px;border-radius: 0 3px 3px 0;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
  'background-color: transparent'
);

// This puts your card into the UI card picker dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-manager-card',
  name: 'Energy Manager Card',
  description: 'An Energy manager card to show solar, grid and consumption',
});

const translations = {
  "en": {
    "charging":     "Charging",
    "discharging":  "Discharging",
    "togrid":       "Feed-in",
    "fromgrid" :    "Grid supply",
    "production":   "Production",
    "consumption":  "Consumption",
    "charging_state": "Charging state"
  },
  "de": {
    "charging":     "Aufladung",
    "discharging":  "Entladung",
    "togrid":       "Einspeisung",
    "fromgrid" :    "Netzbezug",
    "production":   "Produktion",
    "consumption":  "Verbrauch",
    "charging_state": "Ladezustand"
  },
}

class EnergyManagerCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
  }

  color(value, inverse) {
    if (parseInt(value, 10) === 0) {
      return 'grey-light';
    }
    return value > 0 ? 'green' : 'red';
  }

  color1(value, inverse) {
    if (parseInt(value, 10) === 0) {
      return 'grey-light';
    }

    return value > 0 ? 'green' : 'active';
  }

  consumptionSummarized(){
    return this.config.pc_summarized;
  }

  solar() {
    return this.hass.states[this.config.solar_power].state;
  }

  gridPower() {
    return this.hass.states[this.config.grid_power].state;
  }

  batteryPower() {
    return this.hass.states[this.config.battery_power];
  }

  batteryChargingState() {
    return this.hass.states[this.config.battery_charging_state]
  }

  consumption() {
    var consumption_for_summarized_power = parseFloat(Math.abs(this.solar())) + parseFloat(this.hass.states[this.config.power_consumption].state);
    return (this.consumptionSummarized()) ? consumption_for_summarized_power : this.hass.states[this.config.power_consumption].state ;
  }

  grid() {
    if(this.gridPower()) {
      return -this.gridPower();
    } else {
      if (!this.batteryPower()) {
        return this.solar() - this.consumption();
      }else{
        return this.solar() - this.consumption() - this.batteryPower().state;
      }
    }
  }

  arrow(css, rotation=0) {
    return html`<svg class="${css}" style="transform: rotate(${rotation}deg);" xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line stroke-dasharray="2 4" x1="24" y1="7" x2="24" y2="54"></line><polyline points="17 51 24 57 31 50"></polyline></svg>`
  }

  batteryTemplate() {
    if (!this.batteryPower()) return;

    return html`
    <div class="flex items-center justify-center py-4">
      <div class="relative">
        ${ this.arrow(this.color1(this.batteryPower().state), this.batteryPower().state > 0 ? 0 : 180) }
        <p style="position: absolute; left: 120%; top: 0;">
          <span class="block grey-dark bold">${this.batteryPower().state > 0 ? (translations[this.hass.config.language]?.charging || translations['en'].charging) : (translations[this.hass.config.language]?.charging || translations['en'].discharging)}</span>
          <span class="bold ${this.color1(this.batteryPower().state)}">
            ${Math.abs(this.round(this.batteryPower().state,2))} W
          </span>
        </p>
        </div>
    </div>
    <div class="text-center">
      <ha-icon class="main-icon grey-dark" icon="mdi:car-battery"></ha-icon>
      <p>
        <span class="block grey-dark bold">${translations[this.hass.config.language]?.charging_state || translations['en'].charging_state}</span>
        <span class="bold">${this.round(this.batteryChargingState().state, 1)} %</span>
      </p>
    </div>
    `
  }

  render() {
    return html`
    <ha-card class="py-8" style="position: relative">
      <div class="flex justify-around">
        <ha-icon class="main-icon grey-dark" icon="mdi:white-balance-sunny"></ha-icon>
        <ha-icon class="main-icon grey-dark" icon="mdi:transmission-tower"></ha-icon>
      </div>
      <div class="flex justify-around py-4">
        <div class="flex items-center p-2 ${this.color(this.solar())}">
          <p style="margin-right: 0.5rem;">
            <span class="block grey-dark bold">${translations[this.hass.config.language]?.production || translations['en'].production}</span>
            <span class="bold">${this.round(this.solar(),2)} W</span>
          </p>
          ${ this.arrow(this.color(this.solar()), -30) }
        </div>

        <div class="flex items-center p-2">
          ${ this.arrow(this.color(this.grid()), this.grid() > 0 ? -150 : 30) }
          <p class="${this.color(this.grid())}" style="margin-left: 0.5rem;">
            <span class="block grey-dark bold">${this.grid() > 0 ? (translations[this.hass.config.language]?.togrid || translations['en'].togrid) : (translations[this.hass.config.language]?.fromgrid || translations['en'].fromgrid)}</span>
            <span class="bold">${Math.abs(this.round(this.grid(),2))} W</span>
          </p>
        </div>
      </div>

      <div class="flex justify-center items-center">
        <div class="relative">
          <p style="position: absolute; left: -150%; text-align: right;">
            <span class="block grey-dark bold">${translations[this.hass.config.language]?.consumption || translations['en'].consumption}</span>
            <span class="bold">${this.round(this.consumption(),2)} W</span>
          </p>
          <ha-icon class="main-icon large grey-dark" icon="mdi:home-city-outline"></ha-icon>
        </div>
      </div>
      ${ this.batteryTemplate() }
    </ha-card>
    `;
  }

  setConfig(config) {
    if (!config.solar_power) {
      throw new Error('You need to define an solar power entity');
    }

    if (!config.power_consumption) {
      throw new Error('You need to define an consumption entity')
    }

    this.config = { ...config };
  }

  getCardSize() {
    return 5;
  }

  static get styles() {
    return [css`
      .grey-dark {
        color: var(--secondary-text-color);
      }
      .grey-light {
        color: var(--disabled-text-color);
      }
      .flex {
        display: flex;
      }
      .items-center {
        align-items: center;
      }
      .justify-center {
        justify-content: center;
      }
      .justify-start {
        justify-content: flex-start;
      }
      .justify-end {
        justify-content: flex-end;
      }
      .justify-around {
        justify-content: space-around;
      }
      .w-1-2 {
        width: 50%;
      }
      .p-2 {
        padding: 0.5rem;
      }
      .main-icon {
        width: 48px;
        height: 48px;
        --mdc-icon-size: 48px;
      }
      .main-icon.large {
        width: 64px;
        height: 64px;
        --mdc-icon-size: 64px;
      }
      .active {
        color: var(--primary-text-color);
      }
      .bold {
        font-weight: bold;
      }
      .block {
        display: block;
      }
      .text-center {
        text-align: center;
      }
      .py-8 {
        padding-top: 2rem;
        padding-bottom: 2rem;
      }
      .py-4 {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      .relative {
        position: relative;
      }
      .red {
        color: var(--label-badge-red);
      }
      .green {
        color: var(--label-badge-green);
      }

    `];
  }
}
customElements.define('energy-manager-card', EnergyManagerCard);