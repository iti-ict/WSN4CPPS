
/*---------------------------------------------------------------------------*/
/**
 * \addtogroup jc10f-relay
 * @{
 *
 * \file
 *  Driver for a jc10f sensor
 */
/*---------------------------------------------------------------------------*/
#include "contiki.h"
#include "jc10f.h"
#include "dev/gpio.h"
#include "dev/adc-sensors.h"
#include "dev/adc.h"
#include "lib/sensors.h"
#include "dev/ioc.h"
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
static int
status(int type)
{
  switch(type) {
  case SENSORS_ACTIVE:
    return 2;
  case SENSORS_READY:
    return 1;
  default:
    return JC10F_ERROR;
  }
}
/*---------------------------------------------------------------------------*/
static int
value(int type)
{
  switch(type) {
    case VADC1:
      return adc_sensors.value(ANALOG_GROVE_LOUDNESS); // The returned value is in millivolts with one extra precision digit, no need to convert from ADC raw count voltage
    
    case VADC2:
      return adc_sensors.value(ANALOG_GROVE_LOUDNESS);

    case VADC3:
      return adc_sensors.value(ANALOG_AAC_SENSOR);
    
    case JC10F_OFF:
      return 0;
    
    default:
      return JC10F_ERROR;
  }
}
/*---------------------------------------------------------------------------*/
static int
configure(int type, int value)
{
  if(type != SENSORS_ACTIVE) {
    return JC10F_ERROR;
  }

  switch(value) {
    case ADC3_PIN:
    adc_sensors.configure(ANALOG_AAC_SENSOR, ADC3_PIN);
    return JC10F_SUCCESS;

    case ADC2_PIN:
    adc_sensors.configure(ANALOG_GROVE_LOUDNESS, ADC2_PIN);
    return JC10F_SUCCESS;

    case ADC1_PIN:
    adc_sensors.configure(ANALOG_GROVE_LOUDNESS, ADC1_PIN);
    return JC10F_SUCCESS;


  }

  return JC10F_SUCCESS;
}
/*---------------------------------------------------------------------------*/
SENSORS_SENSOR(jc10f, JC10F_SENSOR, value, configure, status);
/*---------------------------------------------------------------------------*/
/** @} */
