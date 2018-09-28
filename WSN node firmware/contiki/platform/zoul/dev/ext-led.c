/*---------------------------------------------------------------------------*/
/**
 * \addtogroup zoul-ext-led
 * @{
 *
 * \file
 *  Driver for a external RGB led
 */
/*---------------------------------------------------------------------------*/
#include "contiki.h"
#include "sys/etimer.h"
#include "sys/rtimer.h"
#include "dev/leds.h"
#include "dev/gpio.h"
#include "ext-led.h"
#include "dev/gpio.h"
#include "lib/sensors.h"
#include "dev/ioc.h"

/*---------------------------------------------------------------------------*/
uint8_t read_pin1 = 0;
uint8_t read_pin2 = 0;
uint8_t read_pin3 = 0;
uint8_t sum = 0;

void setup_extled()
{
  GPIO_SET_OUTPUT(PORT_BASE_RED, PIN_RED);
  GPIO_SET_OUTPUT(PORT_BASE_GB, PIN_BLUE);
  GPIO_SET_OUTPUT(PORT_BASE_GB, PIN_GREEN);  
}

void extled_on(uint8_t led)
{
   switch(led)
      {
        case RED:
        GPIO_SET_PIN(PORT_BASE_GB, PIN_BLUE);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_GREEN);
        GPIO_CLR_PIN(PORT_BASE_RED, PIN_RED);
        break;
        
        case GREEN:
        GPIO_SET_PIN(PORT_BASE_GB, PIN_BLUE);
        GPIO_SET_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_GREEN);
        break;

        case BLUE:
        GPIO_SET_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_GREEN);
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_BLUE);
        break;

        case PURPLE:
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_BLUE);
        GPIO_CLR_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_GREEN);
        break;

        case YELLOW:
        GPIO_CLR_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_GREEN);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_BLUE);
        break;

        case ALL: 
        GPIO_CLR_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_GREEN);
        GPIO_CLR_PIN(PORT_BASE_GB, PIN_BLUE);
        break;

        default: 
        GPIO_SET_PIN(PORT_BASE_RED, PIN_RED);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_GREEN);
        GPIO_SET_PIN(PORT_BASE_GB, PIN_BLUE);
        break;
      }
}

void extled_off()
{
    GPIO_SET_PIN(PORT_BASE_RED, PIN_RED);
    GPIO_SET_PIN(PORT_BASE_GB, PIN_GREEN);
    GPIO_SET_PIN(PORT_BASE_GB, PIN_BLUE);
}

void toggle_extled(uint8_t led)
{
    read_pin1 = GPIO_READ_PIN(PORT_BASE_RED, PIN_RED);
    read_pin2 = GPIO_READ_PIN(PORT_BASE_GB, PIN_GREEN);
    read_pin3 = GPIO_READ_PIN(PORT_BASE_GB, PIN_BLUE);

    if(read_pin1 == 0 || read_pin2 == 0 || read_pin3 == 0)
        extled_off();       
    else
        extled_on(led);      
}
/** @} */
