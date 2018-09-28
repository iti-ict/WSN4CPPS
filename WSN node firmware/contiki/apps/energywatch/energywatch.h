/**
 * \file
 *        header file for Energywatch: periodically get stats on energy remaining for nodes
 * \author
 *         David Todoli <dtodoli@iti.es>
 */

#ifndef POWERTRACE_H
#define POWERTRACE_H

#include "sys/clock.h"

void powertrace_start(clock_time_t perioc);
void powertrace_stop(void);

void powertrace_print(char *str);

#endif /* POWERTRACE_H */
