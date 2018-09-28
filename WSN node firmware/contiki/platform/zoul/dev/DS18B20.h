/**
 * \ITI, DS18B20 Drivers .h
 * @{
 *
 * \defgroup
 *
 * Demonstrates the RE-Mote and DS18B20
 * @{
 *
 * \file
 *        RE-Mote 
 *
 * \author
 *         Rubén Ponce <rponce@iti.es>
 */

/*---------------------------------------------------------------------------*/

#ifndef DS18B20_H_
#define DS18B20_H_ 

#include <stdint.h>
#include <stdio.h>
#include <stdint.h>
#include "dev/gpio.h"

#define DEBUG 0

uint8_t get[10];

void set_temperature_GPIO(uint8_t pin, uint8_t port);
int16_t Read_Temperature(void);

#endif /* DS18B20_H_ */
/*---------------------------------------------------------------------------*/
/**
 * @}
 * @}
 */