/*
 * Copyright (c) 2016, Zolertia - http://www.zolertia.com
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * This file is part of the Contiki operating system.
 *
 */
/*---------------------------------------------------------------------------*/
/**
 * \addtogroup zoul-leds
 * @{
 *
 * \defgroup zoul-led Generic external RGB driver
 *
 * Driver for a generic external RGB driver
 * @{
 *
 * \file
 * Header file for the generic external RGB driver
 */
/*---------------------------------------------------------------------------*/
#ifndef EXT_LED_H
#define EXT_LED_H
/* -------------------------------------------------------------------------- */
/** @} */
/* -------------------------------------------------------------------------- */


#define PORT_BASE_RED   GPIO_PORT_TO_BASE(GPIO_D_NUM)
#define PORT_BASE_GB    GPIO_PORT_TO_BASE(GPIO_B_NUM)
#define PIN_RED         GPIO_PIN_MASK(4)
#define PIN_BLUE        GPIO_PIN_MASK(6)
#define PIN_GREEN       GPIO_PIN_MASK(7)

/**
 * \name external RGB LED available commands
 * @{
 */

#define RED             0
#define GREEN           1
#define BLUE            2
#define PURPLE          3
#define YELLOW			4
#define ALL 			5
/** @} */

void setup_extled(void);

void extled_on(uint8_t led);

void extled_off(void);

void toggle_extled(uint8_t led);

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
#endif /* EXT_LED_H */
/* -------------------------------------------------------------------------- */
/**
 * @}
 * @}
 */
