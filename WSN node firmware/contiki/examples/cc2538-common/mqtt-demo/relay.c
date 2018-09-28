/**
 * \rponce probes
 * @{
 *
 * \defgroup testRele
 *
 * Demonstrates the operation of the rele
 * @{
 *
 * \file
 *        RE-Mote & Rele SONGLE
 *
 * \author
 *         Rubén Ponce <rponce@iti.es>
 */

/*---------------------------------------------------------------------------*/
#include "contiki.h"
#include "sys/etimer.h"
#include "sys/rtimer.h"
#include "dev/leds.h"
#include "dev/button-sensor.h"
#include "dev/adc-sensors.h"
#include "dev/adc.h"
#include "dev/gpio.h"
#include <stdio.h>
#include <stdint.h>

/*---------------------------------------------------------------------------*/
#define ADC_PIN   2
#define LOOP_PERIOD 2
#define LOOP_INTERVAL (CLOCK_SECOND * LOOP_PERIOD)
#define LEDS_PERIODIC LEDS_GREEN  

/*---------------------------------------------------------------------------*/

static uint8_t pinR1 = 2; // Predetermined GPIO PIN2
static uint8_t portR1 = 2; // Predetermined GPIO PORT C until 20mA
static uint8_t pinR2 = 3; // Predetermined GPIO PIN0
static uint8_t portR2 = 2; // Predetermined GPIO PORT C until 20mA
static uint8_t flag = 0;

#define PIN_RELE1   GPIO_PIN_MASK(pinR1)
#define PORT_RELE1  GPIO_PORT_TO_BASE(portR1)
#define PIN_RELE2   GPIO_PIN_MASK(pinR2)
#define PORT_RELE2  GPIO_PORT_TO_BASE(portR2)

/*---------------------------------------------------------------------------*/
PROCESS(test_button_process, "Test button");
AUTOSTART_PROCESSES(&test_button_process);

/*---------------------------------------------------------------------------*/
PROCESS_THREAD(test_button_process, ev, data)
{
  PROCESS_BEGIN();

  GPIO_SOFTWARE_CONTROL(PORT_RELE1, PIN_RELE1);
  GPIO_SOFTWARE_CONTROL(PORT_RELE2, PIN_RELE2);
  GPIO_SET_OUTPUT(PORT_RELE1, PIN_RELE1);
  GPIO_SET_OUTPUT(PORT_RELE2, PIN_RELE2);
  GPIO_SET_PIN(PORT_RELE1, PIN_RELE1);
  GPIO_SET_PIN(PORT_RELE2, PIN_RELE2);
  clock_delay_usec(1000);
  GPIO_CLR_PIN(PORT_RELE1, PIN_RELE1); 
  GPIO_CLR_PIN(PORT_RELE2, PIN_RELE2); 

  SENSORS_ACTIVATE(button_sensor);
  leds_on(LEDS_PERIODIC);

  while(1){

    PROCESS_YIELD();
    PROCESS_WAIT_EVENT_UNTIL(ev == sensors_event && data == &button_sensor && button_sensor.value(0));
    leds_toggle(LEDS_PERIODIC);
    if (flag == 0)
    {
      GPIO_SET_PIN(PORT_RELE1, PIN_RELE1);
      GPIO_CLR_PIN(PORT_RELE2, PIN_RELE2);
      flag = 1;
    }
    else
    {
      GPIO_CLR_PIN(PORT_RELE1, PIN_RELE1);
      GPIO_SET_PIN(PORT_RELE2, PIN_RELE2);
      flag = 0;
    }
  }
  PROCESS_END();
}


