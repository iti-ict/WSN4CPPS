/**
 * \rponce probes
 * @{
 *
 * \defgroup test ADC + 1-wire
 *
 * Demonstrates the operation of ADC and 1-wire
 * @{
 *
 * \file
 *        RE-Mote 
 *
 * \author
 *         Rubén Ponce <rponce@iti.es>
 */

/*---------------------------------------------------------------------------*/
#include "contiki.h"
#include "sys/etimer.h"
#include "sys/rtimer.h"

#include "dev/leds.h"
#include "dev/gpio.h"

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <math.h>

#define LEDS_PERIODIC LEDS_GREEN 

//#define PORT_BASE_REF  GPIO_PORT_TO_BASE(GPIO_A_NUM)
//#define PIN_MASK_REF   GPIO_PIN_MASK(5)

/*---------------------------------------------------------------------------*/
static uint8_t pin = 5; // Predetermined GPIO PIN0
static uint8_t baseport = 1; // Predetermined GPIO PORT D
static uint8_t presence;

#define PIN_MASK   GPIO_PIN_MASK(pin)
#define PORT_BASE  GPIO_PORT_TO_BASE(baseport) 
/*---------------------------------------------------------------------------*/
PROCESS(test, "DS1820 drivers");
AUTOSTART_PROCESSES(&test);

/*---------------------------------------------------------------------------*/
PROCESS_THREAD(test, ev, data)
{
  PROCESS_BEGIN(); 

  GPIO_SOFTWARE_CONTROL(PORT_BASE, PIN_MASK);
  GPIO_SET_INPUT(PORT_BASE, PIN_MASK);

  leds_on(LEDS_GREEN);

  while(1) {
    presence =  GPIO_READ_PIN(PORT_BASE, PIN_MASK); //Return value of line
    if(presence)
     leds_off(LEDS_GREEN);
  
    else
      leds_on(LEDS_GREEN);
        
    printf("\n Presencia =  %d \n", presence);  

  } /* Loop forever */
/*----------------------------------------------------------------------*/
/* End of program */
/*----------------------------------------------------------------------*/
  PROCESS_END();
}

