import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

import { getIonMode } from '../../global/ionic-global';
import { RadioGroupChangeEventDetail } from '../../interface';
import { watchForOptions } from '../../utils/watch-options';

@Component({
  tag: 'ion-radio-group'
})
export class RadioGroup implements ComponentInterface {

  private inputId = `ion-rg-${radioGroupIds++}`;
  private labelId = `${this.inputId}-lbl`;
  private mutationO?: MutationObserver;

  @Element() el!: HTMLElement;

  /**
   * If `true`, the radios can be deselected.
   */
  @Prop() allowEmptySelection = false;

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * the value of the radio group.
   */
  @Prop({ mutable: true }) value?: any | null;

  @Watch('value')
  valueChanged(value: any | undefined) {
    this.updateRadios();
    this.ionChange.emit({ value });
  }

  /**
   * Emitted when the value has changed.
   */
  @Event() ionChange!: EventEmitter<RadioGroupChangeEventDetail>;

  connectedCallback() {
    // Get the list header if it exists and set the id
    // this is used to set aria-labelledby
    const el = this.el;
    const header = el.querySelector('ion-list-header') || el.querySelector('ion-item-divider');
    if (header) {
      const label = header.querySelector('ion-label');
      if (label) {
        this.labelId = label.id = this.name + '-lbl';
      }
    }

    if (!this.mutationO) {
      this.mutationO = watchForOptions<HTMLIonRadioElement>(el, 'ion-radio', newOption => {
        if (newOption !== undefined) {
          this.value = newOption.value;
        } else {
          this.updateRadios();
        }
      });
    }
    this.updateRadios();
  }

  disconnectedCallback() {
    if (this.mutationO) {
      this.mutationO.disconnect();
      this.mutationO = undefined;
    }
  }

  private get radios() {
    return Array.from(this.el.querySelectorAll('ion-radio'));
  }

  private updateRadios() {
    const { value, radios } = this;
    let hasChecked = false;

    // Walk the DOM in reverse order, since the last selected one wins!
    for (const radio of radios.reverse()) {
      if (!hasChecked && radio.value === value) {
        // correct value for this radio
        // but this radio isn't checked yet
        // and we haven't found a checked yet
        hasChecked = true;
        radio.checked = true;
      } else {
        // this radio doesn't have the correct value
        // or the radio group has been already checked
        radio.checked = false;
      }
    }

    // Reset value if
    if (!hasChecked) {
      this.value = undefined;
    }
  }

  private onSelect = (ev: Event) => {
    const selectedRadio = ev.target as HTMLIonRadioElement | null;
    if (selectedRadio) {
      this.value = selectedRadio.value;
    }
  }

  private onDeselect = (ev: Event) => {
    const selectedRadio = ev.target as HTMLIonRadioElement | null;
    if (selectedRadio) {
      selectedRadio.checked = false;
      this.value = undefined;
    }
  }

  render() {
    return (
      <Host
        role="radiogroup"
        aria-labelledby={this.labelId}
        onIonSelect={this.onSelect}
        onIonDeselect={this.allowEmptySelection ? this.onDeselect : undefined}
        class={getIonMode(this)}
      >
      </Host>
    );
  }
}

let radioGroupIds = 0;

